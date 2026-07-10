# Stadium OS v1.0 - Neubrutalist Bento Dashboard

An industry-grade, event-driven backend and real-time operations control center designed for modern stadium operations, crowd safety, and emergency response management. Built on top of **Next.js (App Router)**, **Supabase (PostgreSQL + Realtime)**, **Zod (Validation)**, and **Google Gemini API (Generative AI)**.

---

## 🏟️ Chosen Vertical: Stadium Operations & Emergency Safety
This project focuses on the high-velocity crowd monitoring and safety routing vertical. It addresses the challenges of stadium ingress/egress safety by tracking real-time sensor metrics at security gates and utilizing a generative reasoning engine (Gemini) to evaluate safety incidents and coordinate operational responses.

---

## ⚡ Architecture & Event-Driven Logic

```mermaid
graph TD;
    A[Synthetic Telemetry / Ingestion Client] -->|POST Array of Metrics| B[/api/ingest];
    B -->|Zod Validation| C{Valid?};
    C -->|No| D[400 Bad Request];
    C -->|Yes| E[(stadium_metrics_ledger)];
    E -->|Realtime WebSocket| F[Gate Heatmap UI];
    B -->|Check Thresholds: density >= 80%| G{High Density Anomaly?};
    G -->|Yes: Asynchronous Dispatch| H[/api/worker/reason-anomaly];
    G -->|No| I[202 Accepted];
    H -->|Validate Authorization Token| J{Authorized?};
    J -->|No| K[401 Unauthorized];
    J -->|Yes| L[Google Gemini API];
    L -->|Strict Schema JSON Generation| M{AI Success?};
    M -->|Yes| N[(stadium_ai_ops_log)];
    M -->|No: Fallback Alert| O[(stadium_ai_ops_log)];
    N -->|Realtime WebSocket| P[AI Operations Terminal UI];
    O -->|Realtime WebSocket| P;
```

### 1. Ingestion Pipeline (`/api/ingest`)
*   **Gate Metrics Ingestion**: High-velocity sensor payloads containing gate telemetry data are posted to `/api/ingest`.
*   **Strict Runtime Schema**: Validated via `zod` to ensure strict types: `gate_id` (string), `crowd_density` (numeric, 0-100), and `timestamp` (ISO datetime).
*   **Asynchronous Processing (Fire-and-Forget)**: Database writes happen first. If any gate exceeds a density of **80%**, the ingestion pipeline launches a non-blocking `POST` request to the anomaly worker route and immediately sends a `202 Accepted` status back to the client. This decouples database ingestion speeds from AI reasoning latency.

### 2. GenAI Worker (`/api/worker/reason-anomaly`)
*   **Worker Security**: The worker route validates an `INTERNAL_WORKER_SECRET` passed in the `Authorization` header to prevent open route invocation.
*   **Reasoning Engine**: Leverages `gemini-2.5-flash` configured with a strict `responseMimeType: "application/json"` response schema. Gemini acts as a **Stadium Operations Director**, analyzing raw anomalies to compute severity (`High` or `Critical`), a deep operational explanation, and actionable deployment scripts.
*   **Fault-Tolerant Fallback**: In the event of Gemini API rate-limits or system errors, the route gracefully handles exceptions by logging a predefined critical alert to ensure operational staff are still dispatched immediately.

### 3. Real-Time Telemetry & Bento Frontend
*   **Live Heatmaps & Telemetry**: Uses Supabase Realtime channels to subscribe to the PostgreSQL Write-Ahead Log. Updates the Gate Heatmap in real-time as telemetry streams in.
*   **AI Terminal**: Listeners automatically react when Gemini posts incident scripts, flashing severe incidents in high-contrast red alert blocks.
*   **Synthetic Data Ingestion**: Features an interactive Drag-and-Drop / File Upload box styled with Neubrutalist diagonal hatch lines that lets you drag a payload JSON file directly into the browser to trigger API ingestion.

---

## 🛠️ Security Practices & Limits
*   **Strict Environment Boundaries**: Critical API keys (`SUPABASE_SERVICE_ROLE_KEY` & `GEMINI_API_KEY`) are kept on the server-side. The frontend client component only receives the public publishable anon key.
*   **Repository Footprint**: Strict `.gitignore` rules prevent node modules, Next.js compilation caches, and local configurations from bloating the codebase. The repository remains comfortably below **10 MB**.

---

## 🚀 Setup & Execution Guide

### 1. Database Migrations
Copy the SQL commands inside [database/migrations.sql](file:///D:/promptwars/database/migrations.sql) and execute them inside your **Supabase SQL Editor**:
- Creates `stadium_metrics_ledger` (raw sensors) and `stadium_ai_ops_log` (AI logs).
- Adds the `stadium_ai_ops_log` table to the Supabase Realtime publication.

### 2. Environment Configuration
Create a `.env.local` file at the root of the project with the following keys:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_secret
GEMINI_API_KEY=your_gemini_api_key
INTERNAL_WORKER_SECRET=formulate_a_secure_token_key

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Install & Start Server
```bash
npm install
npm run dev
```

### 4. Running Ingestion Tests
You can test the pipeline either by dragging and dropping `test-payloads/surge-test.json` onto the dashboard or running the Node script from a separate terminal:
```bash
node scripts/test-ingestion.mjs
```

---

## 🧑‍💻 Assumptions Made
1. **Node environment**: Script execution and telemetry simulation are running under Node.js v20.11.0+.
2. **Next.js Version**: Configured using Next.js 16.2 (App Router).
3. **Database Roles**: The Service Role key bypasses Row-Level Security (RLS) on backend ingestion, whereas public client fetches are securely scoped.
