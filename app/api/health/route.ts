import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '../../lib/supabase';

/**
 * GET /api/health
 *
 * System health check endpoint that validates database connectivity,
 * queue status, and environment variable configuration.
 * Returns a structured JSON report for monitoring and testing.
 */
export async function GET() {
  const checks: Record<string, string> = {};
  let healthy = true;

  // 1. Database connectivity
  try {
    const { error } = await supabase.from('stadium_metrics_ledger').select('id').limit(1);
    checks['database'] = error ? 'DEGRADED' : 'HEALTHY';
    if (error) healthy = false;
  } catch {
    checks['database'] = 'UNREACHABLE';
    healthy = false;
  }

  // 2. Queue status — count pending jobs
  try {
    const { count, error } = await supabase
      .from('stadium_job_queue')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');
    checks['queue_pending'] = error ? 'UNKNOWN' : String(count ?? 0);
  } catch {
    checks['queue_pending'] = 'UNKNOWN';
  }

  // 3. Environment variable configuration
  checks['env_supabase'] = process.env.SUPABASE_URL ? 'CONFIGURED' : 'MISSING';
  checks['env_gemini'] = process.env.GEMINI_API_KEY ? 'CONFIGURED' : 'MISSING';
  checks['env_worker_secret'] = process.env.INTERNAL_WORKER_SECRET ? 'CONFIGURED' : 'MISSING';

  if (!process.env.SUPABASE_URL || !process.env.GEMINI_API_KEY) {
    healthy = false;
  }

  return NextResponse.json({
    status: healthy ? 'HEALTHY' : 'DEGRADED',
    message: healthy ? 'All systems operational' : 'One or more checks failed',
    checks,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  }, { status: healthy ? 200 : 503 });
}
