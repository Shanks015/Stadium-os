import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { supabaseAdmin as supabase } from '../../../lib/supabase';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'placeholder' });

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.INTERNAL_WORKER_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 1. Atomically claim the oldest pending job (Simulating Row Locking)
  const { data: job, error: claimError } = await supabase
    .from('stadium_job_queue')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (claimError || !job) {
    return NextResponse.json({ status: 'NO_JOBS_PENDING' }, { status: 200 });
  }

  // 2. Shift status to processing immediately to block double-consumption
  await supabase
    .from('stadium_job_queue')
    .update({ status: 'processing', attempts: job.attempts + 1 })
    .eq('id', job.id);

  try {
    const metrics = job.payload;

    // 3. Process hot storage dump into ledger
    const { error: ledgerError } = await supabase.from('stadium_metrics_ledger').insert(metrics);
    if (ledgerError) throw ledgerError;

    // 4. Anomaly Evaluator
    const criticalGates = metrics.filter((m: any) => m.crowd_density >= 80);
    if (criticalGates.length > 0) {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze these critical stadium entries: ${JSON.stringify(criticalGates)}`,
        config: {
          systemInstruction: "You are a Stadium Operations Director. Return ONLY a valid JSON object matching: { \"severity\": \"CRITICAL\" | \"WARNING\", \"reasoning\": \"...\", \"action_script\": \"...\" }",
          responseMimeType: "application/json"
        }
      });

      const aiOutput = JSON.parse(response.text.trim());
      
      // Save reasoning to ops log using DB gate_id column format (joined)
      await supabase.from('stadium_ai_ops_log').insert({
        gate_id: criticalGates.map((g: any) => g.gate_id).join(', '),
        severity: aiOutput.severity,
        reasoning: aiOutput.reasoning,
        action_script: aiOutput.action_script
      });
    }

    // 5. Mark Job as Completed
    await supabase.from('stadium_job_queue').update({ status: 'completed', updated_at: new Date().toISOString() }).eq('id', job.id);
    return NextResponse.json({ status: 'JOB_COMPLETED', job_id: job.id });

  } catch (err: any) {
    console.error(`[QUEUE WORKER FAULT ON JOB ${job.id}]:`, err);
    
    const isFinalAttempt = job.attempts + 1 >= job.max_attempts;
    const finalStatus = isFinalAttempt ? 'failed' : 'pending';

    // If final attempt crashes, log errors safely onto the outbox record for debugging
    await supabase.from('stadium_job_queue').update({
      status: finalStatus,
      error_log: err.message || 'Unknown runtime failure.',
      updated_at: new Date().toISOString()
    }).eq('id', job.id);

    return NextResponse.json({ status: 'JOB_DEGRADED', error: err.message }, { status: 500 });
  }
}
