const WORKER_URL = 'http://localhost:3000/api/worker/process-queue';
const SECRET = 'super_secret_worker_key'; // Matches value inside .env.local

async function pollQueue() {
  console.log('--- Instantiating Outbox Queue Execution Worker ---');
  
  setInterval(async () => {
    try {
      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SECRET}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      if (result.status === 'JOB_COMPLETED') {
        console.log(`[SUCCESS]: Transactional Worker processed Job ID: ${result.job_id}`);
      } else if (result.status === 'JOB_DEGRADED') {
        console.log(`[DEGRADED]: Worker failed to process job. Error: ${result.error}`);
      }
    } catch (error) {
      console.error('[POLLING FAULT]: Unable to connect to consumer worker execution thread.', error.message);
    }
  }, 3000); // Polls every 3 seconds
}

pollQueue();
