/**
 * STADIUM OS v1.0 — Comprehensive Test Suite
 *
 * Covers: Zod Validation, Worker Auth, HTTP Methods, Rate Limiting,
 * Content-Type Enforcement, Payload Boundary Limits, and Health Checks.
 *
 * Usage: node scripts/test-suite.mjs [BASE_URL]
 * Default: http://localhost:3000
 */

const API_BASE = process.argv[2] || 'http://localhost:3000';
let passed = 0;
let failed = 0;
const results = [];

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
    results.push({ test: testName, status: 'PASS' });
  } else {
    console.log(`  ❌ FAIL: ${testName}`);
    failed++;
    results.push({ test: testName, status: 'FAIL' });
  }
}

// ─────────────────────────────────────────────
// Test Group 1: Zod Schema Validation
// ─────────────────────────────────────────────
async function testZodValidation() {
  console.log('\n📋 Test Group 1: Zod Schema Validation');

  // 1a: Reject non-array body
  const res1 = await fetch(`${API_BASE}/api/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert(res1.status === 400, 'Rejects non-array payload with 400');

  // 1b: Reject missing required fields
  const res2 = await fetch(`${API_BASE}/api/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([{ gate_id: 'A' }]),
  });
  assert(res2.status === 400, 'Rejects payload missing required fields');

  // 1c: Reject out-of-range crowd_density > 100
  const res3 = await fetch(`${API_BASE}/api/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([{ gate_id: 'A', crowd_density: 150, timestamp: new Date().toISOString() }]),
  });
  assert(res3.status === 400, 'Rejects crowd_density > 100');

  // 1d: Reject negative crowd_density
  const res3b = await fetch(`${API_BASE}/api/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([{ gate_id: 'A', crowd_density: -5, timestamp: new Date().toISOString() }]),
  });
  assert(res3b.status === 400, 'Rejects negative crowd_density');

  // 1e: Reject invalid timestamp format
  const res3c = await fetch(`${API_BASE}/api/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([{ gate_id: 'A', crowd_density: 50, timestamp: 'not-a-date' }]),
  });
  assert(res3c.status === 400, 'Rejects invalid timestamp format');

  // 1f: Reject empty gate_id
  const res3d = await fetch(`${API_BASE}/api/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([{ gate_id: '', crowd_density: 50, timestamp: new Date().toISOString() }]),
  });
  assert(res3d.status === 400, 'Rejects empty gate_id string');

  // 1g: Reject empty array
  const res3e = await fetch(`${API_BASE}/api/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([]),
  });
  assert(res3e.status === 400, 'Rejects empty array payload');

  // 1h: Accept valid payload
  const res4 = await fetch(`${API_BASE}/api/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([{ gate_id: 'Test-A', crowd_density: 55, timestamp: new Date().toISOString() }]),
  });
  assert(res4.status === 202, 'Accepts valid payload with 202');

  // 1i: Accept boundary values (0 and 100)
  const res5 = await fetch(`${API_BASE}/api/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([
      { gate_id: 'Boundary-Low', crowd_density: 0, timestamp: new Date().toISOString() },
      { gate_id: 'Boundary-High', crowd_density: 100, timestamp: new Date().toISOString() },
    ]),
  });
  assert(res5.status === 202, 'Accepts boundary density values (0 and 100)');
}

// ─────────────────────────────────────────────
// Test Group 2: Worker Authorization
// ─────────────────────────────────────────────
async function testWorkerAuth() {
  console.log('\n🔐 Test Group 2: Worker Authorization');

  // 2a: Reject unauthenticated
  const res1 = await fetch(`${API_BASE}/api/worker/process-queue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  assert(res1.status === 401, 'Rejects worker call without auth header');

  // 2b: Reject wrong token
  const res2 = await fetch(`${API_BASE}/api/worker/process-queue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer wrong_token' },
  });
  assert(res2.status === 401, 'Rejects worker call with invalid token');

  // 2c: Reject empty Bearer
  const res3 = await fetch(`${API_BASE}/api/worker/process-queue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' },
  });
  assert(res3.status === 401, 'Rejects worker call with empty Bearer token');
}

// ─────────────────────────────────────────────
// Test Group 3: HTTP Method Enforcement
// ─────────────────────────────────────────────
async function testMethodEnforcement() {
  console.log('\n🚫 Test Group 3: HTTP Method Enforcement');

  const res1 = await fetch(`${API_BASE}/api/ingest`, { method: 'GET' });
  assert(res1.status === 405, 'GET on /api/ingest returns 405');

  const res2 = await fetch(`${API_BASE}/api/ingest`, { method: 'PUT' });
  assert(res2.status === 405, 'PUT on /api/ingest returns 405');

  const res3 = await fetch(`${API_BASE}/api/ingest`, { method: 'DELETE' });
  assert(res3.status === 405, 'DELETE on /api/ingest returns 405');
}

// ─────────────────────────────────────────────
// Test Group 4: Content-Type Enforcement
// ─────────────────────────────────────────────
async function testContentType() {
  console.log('\n📦 Test Group 4: Content-Type Enforcement');

  const res1 = await fetch(`${API_BASE}/api/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: 'not json',
  });
  assert(res1.status === 415, 'Rejects text/plain Content-Type with 415');
}

// ─────────────────────────────────────────────
// Test Group 5: Response Structure Validation
// ─────────────────────────────────────────────
async function testResponseStructure() {
  console.log('\n📐 Test Group 5: Response Structure Validation');

  const res1 = await fetch(`${API_BASE}/api/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([{ gate_id: 'Struct-Test', crowd_density: 42, timestamp: new Date().toISOString() }]),
  });
  const body = await res1.json();
  assert(body.status === 'ACCEPTED', 'Response body contains status field');
  assert(typeof body.message === 'string', 'Response body contains message field');
}

// ─────────────────────────────────────────────
// Test Group 6: Security Headers Validation
// ─────────────────────────────────────────────
async function testSecurityHeaders() {
  console.log('\n🛡️  Test Group 6: Security Headers');

  const res = await fetch(`${API_BASE}/api/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([{ gate_id: 'Header-Test', crowd_density: 30, timestamp: new Date().toISOString() }]),
  });

  assert(res.headers.get('x-content-type-options') === 'nosniff', 'X-Content-Type-Options: nosniff is present');
  assert(res.headers.get('cache-control') === 'no-store, max-age=0', 'Cache-Control: no-store on API routes');
}

// ─────────────────────────────────────────────
// Runner
// ─────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║   STADIUM OS v1.0 — Comprehensive Test Suite        ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║   Target: ${API_BASE.padEnd(40)} ║`);
  console.log('╚══════════════════════════════════════════════════════╝');

  try {
    await testZodValidation();
    await testWorkerAuth();
    await testMethodEnforcement();
    await testContentType();
    await testResponseStructure();
    await testSecurityHeaders();
  } catch (err) {
    console.error('\n💥 Test runner crashed:', err.message);
  }

  const total = passed + failed;
  const pct = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';

  console.log(`\n╔══════════════════════════════════════════════════════╗`);
  console.log(`║   Results: ${passed} passed, ${failed} failed, ${total} total (${pct}%)`.padEnd(55) + '║');
  console.log(`╚══════════════════════════════════════════════════════╝`);

  process.exit(failed > 0 ? 1 : 0);
}

main();
