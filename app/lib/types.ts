/** Raw sensor telemetry from stadium perimeter gates */
export interface GateMetric {
  gate_id: string;
  crowd_density: number;
  timestamp: string;
}

/** AI reasoning output stored in stadium_ai_ops_log */
export interface AiOpsLogEntry {
  id?: string;
  gate_id: string;
  severity: 'CRITICAL' | 'WARNING' | 'High' | 'Critical';
  reasoning: string;
  action_script: Record<string, string> | string;
  created_at?: string;
}

/** Transactional outbox job record */
export interface QueueJob {
  id: number;
  payload: GateMetric[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  attempts: number;
  max_attempts: number;
  error_log: string | null;
  created_at: string;
  updated_at: string;
}

/** API response envelope */
export interface ApiResponse {
  status: string;
  message?: string;
  errors?: unknown[];
  job_id?: number;
  error?: string;
}
