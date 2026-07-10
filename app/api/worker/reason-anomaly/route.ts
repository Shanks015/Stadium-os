import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '../../../lib/supabase';
import { GoogleGenAI } from '@google/genai';
import type { ApiResponse } from '../../../lib/types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'placeholder' });

interface AnomalyPayload {
  gate_id: string;
  crowd_density: number;
  timestamp: string;
}

interface RequestBody {
  anomalies?: AnomalyPayload[];
}

interface AiOutput {
  severity?: 'High' | 'Critical' | 'WARNING' | 'CRITICAL';
  reasoning?: string;
  action_script?: Record<string, string> | string;
}

/**
 * POST /api/worker/reason-anomaly
 *
 * Anomaly evaluation endpoint. Accepts a batch of anomalies, invokes Google Gemini
 * to determine incident severity and evac scripts, and writes reports to stadium_ai_ops_log.
 *
 * @security Protected by Bearer token validation (INTERNAL_WORKER_SECRET)
 */
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const secret = process.env.INTERNAL_WORKER_SECRET;
    
    // Validate INTERNAL_WORKER_SECRET
    if (!authHeader || authHeader !== `Bearer ${secret}`) {
      return NextResponse.json(
        { status: 'ERROR', message: 'Unauthorized' } satisfies ApiResponse,
        { status: 401 }
      );
    }

    const body = (await request.json()) as RequestBody;
    const anomalies = body.anomalies;
    
    if (!anomalies || anomalies.length === 0) {
      return NextResponse.json(
        { status: 'ERROR', message: 'No anomalies provided' } satisfies ApiResponse,
        { status: 400 }
      );
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

        const textResponse = response.text;
        if (!textResponse) throw new Error('Gemini returned empty response');
        const aiOutput = JSON.parse(textResponse.trim()) as AiOutput;

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

    return NextResponse.json(
      { status: 'SUCCESS', message: 'Processing complete' } satisfies ApiResponse,
      { status: 200 }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown runtime failure';
    console.error('Worker Error:', errorMessage);
    return NextResponse.json(
      { status: 'FATAL', message: 'Internal Server Error' } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
