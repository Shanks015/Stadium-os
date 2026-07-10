import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testFile = path.join(__dirname, '..', 'test-payloads', 'surge-test.json');

async function runTest() {
  console.log('Reading test payload...');
  const data = JSON.parse(fs.readFileSync(testFile, 'utf8'));

  console.log('Sending data to /api/ingest...');
  try {
    const response = await fetch('http://localhost:3000/api/ingest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const status = response.status;
    const body = await response.json();

    console.log(`Response Status: ${status}`);
    console.log('Response Body:', body);

    if (status === 202) {
      console.log('✅ Test passed! Data accepted by ingestion API.');
      console.log('Verify in your database that:');
      console.log(' 1. 5 records were inserted into stadium_metrics_ledger');
      console.log(' 2. 2 records (Gate-B and Gate-D) were passed to the GenAI worker');
      console.log(' 3. 2 records are present in stadium_ai_ops_log (check after a few seconds for async processing)');
    } else {
      console.log('❌ Test failed! Unexpected status code.');
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

runTest();
