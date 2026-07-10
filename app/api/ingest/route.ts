import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin as supabase } from '../../lib/supabase';
import type { GateMetric, ApiResponse } from '../../lib/types';

/**
 * Zod schema for validating incoming gate telemetry payloads.
 * Enforces gate_id presence, density bounds [0, 100], and ISO 8601 timestamps.
 */
const MetricPayloadSchema = z.array(
  z.object({
    gate_id: z.string().min(1, 'gate_id must not be empty'),
    crowd_density: z.number().min(0, 'Density cannot be negative').max(100, 'Density cannot exceed 100'),
    timestamp: z.string().datetime('Timestamp must be ISO 8601 format')
  })
).min(1, 'Payload must contain at least one metric entry')
 .max(500, 'Payload cannot exceed 500 entries per batch');

/**
 * POST /api/ingest
 *
 * Low-latency ingestion gateway for stadium perimeter telemetry.
 * Validates the incoming JSON payload via Zod, then writes it to the
 * transactional outbox queue (`stadium_job_queue`) for asynchronous
 * processing by the background worker. Returns 202 Accepted immediately.
 *
 * @security Rate-limited via middleware.ts (100 req/min/IP)
 * @security Input validated via Zod schema with strict bounds
 */
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { status: 'ERROR', message: 'Content-Type must be application/json' } satisfies ApiResponse,
        { status: 415 }
      );
    }

    const rawBody = await req.json();
    const validation = MetricPayloadSchema.safeParse(rawBody);
    
    if (!validation.success) {
      return NextResponse.json(
        { status: 'ERROR', errors: validation.error.issues } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const payload: GateMetric[] = validation.data;

    // TRANSACTIONAL OUTBOX: Commit directly to queue table
    const { error } = await supabase
      .from('stadium_job_queue')
      .insert({ payload });

    if (error) throw error;

    // Return a 202 Accepted status in single-digit milliseconds
    return NextResponse.json(
      { status: 'ACCEPTED', message: `Queued ${payload.length} metric(s) for processing` } satisfies ApiResponse,
      { status: 202 }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown runtime failure';
    console.error('[INGESTION CRITICAL FAILURE]:', message);
    return NextResponse.json(
      { status: 'FATAL', message: 'Internal Server Error' } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
