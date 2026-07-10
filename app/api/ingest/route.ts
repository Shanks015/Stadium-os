import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const gateMetricSchema = z.object({
  gate_id: z.string(),
  crowd_density: z.number().min(0).max(100),
  timestamp: z.string().datetime(),
});

const payloadSchema = z.array(gateMetricSchema);

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Strict runtime validation
    const result = payloadSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation Error', details: result.error.errors }, { status: 400 });
    }

    const validatedData = result.data;

    // Insert validated data into stadium_metrics_ledger
    const { error: dbError } = await supabase
      .from('stadium_metrics_ledger')
      .insert(validatedData);

    if (dbError) {
      console.error('Database Error:', dbError);
      return NextResponse.json({ error: 'Database Insertion Failed' }, { status: 500 });
    }

    // Check for high density and asynchronously dispatch to worker
    const highDensityGates = validatedData.filter(metric => metric.crowd_density >= 80);
    
    if (highDensityGates.length > 0) {
      const workerUrl = new URL('/api/worker/reason-anomaly', request.url).toString();
      
      // Fire and forget, no await
      fetch(workerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.INTERNAL_WORKER_SECRET}`
        },
        body: JSON.stringify({ anomalies: highDensityGates })
      }).catch(err => {
        console.error('Failed to dispatch worker:', err);
      });
    }

    // Return 202 Accepted status
    return NextResponse.json({ message: 'Data accepted' }, { status: 202 });

  } catch (error) {
    console.error('Ingest Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
