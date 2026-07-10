-- Migration: Stadium Metrics and AI Ops Log

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table 1: stadium_metrics_ledger (raw sensor data)
CREATE TABLE IF NOT EXISTS stadium_metrics_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gate_id VARCHAR(50) NOT NULL,
    crowd_density NUMERIC NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 2: stadium_ai_ops_log (AI reasoning output)
CREATE TABLE IF NOT EXISTS stadium_ai_ops_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gate_id VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    reasoning TEXT NOT NULL,
    action_script JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Supabase Realtime publication for stadium_ai_ops_log
ALTER PUBLICATION supabase_realtime ADD TABLE stadium_ai_ops_log;

-- ==========================================
-- ENTERPRISE TRANSACTIONAL OUTBOX CONFIG
-- ==========================================

-- Job State Enum
CREATE TYPE job_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Transactional Outbox Queue Table
CREATE TABLE IF NOT EXISTS stadium_job_queue (
    id BIGSERIAL PRIMARY KEY,
    payload JSONB NOT NULL,
    status job_status DEFAULT 'pending',
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 3,
    error_log TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for optimized high-speed FIFO execution polling
CREATE INDEX IF NOT EXISTS idx_queue_polling ON stadium_job_queue(status, created_at ASC) 
WHERE status = 'pending';
