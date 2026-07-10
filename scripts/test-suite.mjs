import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = 'http://localhost:3000';
let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

async function testZodValidation() {
  console.log('\n📋 Test Suite: Zod Schema Validation');

  const res1 = await fetch(`${API_BASE}/api/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert(res1.status === 400, 'Rejects non-array payload with 400');

  const res2 = await fetch(`${API_BASE}/api/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([{ gate_id: 'A' }]),
  });
  assert(res2.status === 400, 'Rejects payload missing required fields');

  const res3 = await fetch(`${API_BASE}/api/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([{ gate_id: 'A', crowd_density: 150, timestamp: new Date().toISOString() }]),
  });
  assert(res3.status === 400, 'Rejects crowd_density > 100');

  const res4 = await fetch(`${API_BASE}/api/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([{ gate_id: 'Test-A', crowd_density: 55, timestamp: new Date().toISOString() }]),
  });
  assert(res4.status === 202, 'Accepts valid payload with 202');
}

async function testWorkerAuth() {
  console.log('\n🔐 Test Suite: Worker Authorization');

  const res1 = await fetch(`${API_BASE}/api/worker/process-queue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  assert(res1.status === 401, 'Rejects worker call without auth header');

  const res2 = await fetch(`${API_BASE}/api/worker/process-queue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer wrong_token' },
  });
  assert(res2.status === 401, 'Rejects worker call with invalid token');
}

async function testMethodNotAllowed() {
  console.log('\n🚫 Test Suite: HTTP Method Enforcement');

  const res1 = await fetch(`${API_BASE}/api/ingest`, { method: 'GET' });
  assert(res1.status === 405, 'GET on /api/ingest returns 405');
}

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║   STADIUM OS v1.0 - Automated Test Suite        ║');
  console.log('╚══════════════════════════════════════════════════╝');

  try {
    await testZodValidation();
    await testWorkerAuth();
    await testMethodNotAllowed();
  } catch (err) {
    console.error('\n💥 Test runner crashed:', err.message);
  }

  console.log(`\n══════════════════════════════════════════`);
  console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log(`══════════════════════════════════════════`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
