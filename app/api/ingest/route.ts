import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const MetricPayloadSchema = z.array(
  z.object({
    gate_id: z.string().min(1),
    crowd_density: z.number().min(0).max(100),
    timestamp: z.string().datetime()
  })
);

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const validation = MetricPayloadSchema.safeParse(rawBody);
    
    if (!validation.success) {
      return NextResponse.json({ status: 'ERROR', errors: validation.error.errors }, { status: 400 });
    }

    // TRANSACTIONAL OUTBOX: Commit directly to queue table
    const { error } = await supabase
      .from('stadium_job_queue')
      .insert({ payload: validation.data });

    if (error) throw error;

    // Return a 202 Accepted status in single-digit milliseconds
    return NextResponse.json({ status: 'ACCEPTED' }, { status: 202 });

  } catch (error: any) {
    console.error('[INGESTION CRITICAL FAILURE]:', error);
    return NextResponse.json({ status: 'FATAL', message: 'Internal Server Error' }, { status: 500 });
  }
}
