import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '../../../lib/supabase';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const secret = process.env.INTERNAL_WORKER_SECRET;
    
    // Validate INTERNAL_WORKER_SECRET
    if (!authHeader || authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { anomalies } = await request.json();
    
    if (!anomalies || anomalies.length === 0) {
      return NextResponse.json({ message: 'No anomalies provided' }, { status: 400 });
    }

    for (const anomaly of anomalies) {
      try {
        const prompt = `You are a Stadium Operations Director. Analyze the following high-density gate data:
Gate ID: ${anomaly.gate_id}
Crowd Density: ${anomaly.crowd_density}%
Timestamp: ${anomaly.timestamp}

You must return a strict JSON structure exactly matching this schema:
{
  "severity": "High" | "Critical",
  "reasoning": "Explanation of why the action is needed",
  "action_script": { "type": "string", "details": "action details" }
}

Do not include markdown blocks, just raw JSON.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          }
        });

        const textResponse = response.text || '{}';
        const aiOutput = JSON.parse(textResponse);

        // Save generated output to stadium_ai_ops_log
        await supabase.from('stadium_ai_ops_log').insert({
          gate_id: anomaly.gate_id,
          severity: aiOutput.severity || 'Critical',
          reasoning: aiOutput.reasoning || 'Density threshold exceeded.',
          action_script: aiOutput.action_script || {}
        });

      } catch (aiError) {
        console.error('AI Processing Error:', aiError);
        // Hardcoded graceful fallback alert
        await supabase.from('stadium_ai_ops_log').insert({
          gate_id: anomaly.gate_id,
          severity: 'Critical',
          reasoning: 'Fallback: High crowd density detected, AI analysis failed.',
          action_script: { action: "Deploy physical personnel to gate immediately" }
        });
      }
    }

    return NextResponse.json({ message: 'Processing complete' }, { status: 200 });

  } catch (error) {
    console.error('Worker Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
