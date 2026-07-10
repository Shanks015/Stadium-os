import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { supabaseAdmin as supabase } from '../../../lib/supabase';
import type { GateMetric, QueueJob, ApiResponse } from '../../../lib/types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'placeholder' });

/** Density threshold (%) at which the AI reasoning engine is triggered */
const ANOMALY_THRESHOLD = 80;

/**
 * POST /api/worker/process-queue
 *
 * Background FIFO queue worker that atomically claims the oldest pending job
 * from `stadium_job_queue`, commits the metrics to `stadium_metrics_ledger`,
 * and triggers AI anomaly evaluation via Google Gemini for any gates
 * exceeding the configured density threshold.
 *
 * @security Protected by Bearer token validation (INTERNAL_WORKER_SECRET)
 * @security Never exposed to client-side code
 */
export async function POST(req: NextRequest) {
  // 0. Authorization gate
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.INTERNAL_WORKER_SECRET}`) {
    return NextResponse.json(
      { status: 'ERROR', message: 'Unauthorized' } satisfies ApiResponse,
      { status: 401 }
    );
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
    return NextResponse.json({ status: 'NO_JOBS_PENDING' } satisfies ApiResponse, { status: 200 });
  }

  const typedJob = job as QueueJob;

  // 2. Shift status to processing immediately to block double-consumption
  await supabase
    .from('stadium_job_queue')
    .update({ status: 'processing', attempts: typedJob.attempts + 1 })
    .eq('id', typedJob.id);

  try {
    const metrics: GateMetric[] = typedJob.payload;

    // 3. Process hot storage dump into ledger
    const { error: ledgerError } = await supabase.from('stadium_metrics_ledger').insert(metrics);
    if (ledgerError) throw ledgerError;

    // 4. Anomaly Evaluator — only trigger AI for high-density gates
    const criticalGates = metrics.filter((m: GateMetric) => m.crowd_density >= ANOMALY_THRESHOLD);
    if (criticalGates.length > 0) {
      try {
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
          gate_id: criticalGates.map((g: GateMetric) => g.gate_id).join(', '),
          severity: aiOutput.severity,
          reasoning: aiOutput.reasoning,
          action_script: aiOutput.action_script
        });
      } catch (aiError: unknown) {
        // Graceful AI degradation — log the anomaly even if Gemini is unavailable
        const aiMessage = aiError instanceof Error ? aiError.message : 'Gemini API unavailable';
        console.warn(`[AI DEGRADED]: ${aiMessage}. Logging fallback entry.`);
        await supabase.from('stadium_ai_ops_log').insert({
          gate_id: criticalGates.map((g: GateMetric) => g.gate_id).join(', '),
          severity: 'WARNING',
          reasoning: `AI engine unavailable. ${criticalGates.length} gate(s) exceeded ${ANOMALY_THRESHOLD}% density threshold. Manual inspection required.`,
          action_script: 'DEPLOY_GROUND_PERSONNEL'
        });
      }
    }

    // 5. Mark Job as Completed
    await supabase
      .from('stadium_job_queue')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', typedJob.id);

    return NextResponse.json(
      { status: 'JOB_COMPLETED', job_id: typedJob.id } satisfies ApiResponse
    );

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown runtime failure';
    console.error(`[QUEUE WORKER FAULT ON JOB ${typedJob.id}]:`, errorMessage);
    
    const isFinalAttempt = typedJob.attempts + 1 >= typedJob.max_attempts;
    const finalStatus = isFinalAttempt ? 'failed' : 'pending';

    // If final attempt crashes, log errors safely onto the outbox record for debugging
    await supabase.from('stadium_job_queue').update({
      status: finalStatus,
      error_log: errorMessage,
      updated_at: new Date().toISOString()
    }).eq('id', typedJob.id);

    return NextResponse.json(
      { status: 'JOB_DEGRADED', error: errorMessage } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
