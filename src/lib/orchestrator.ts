import { redis } from './redis';
import { Client } from '@upstash/qstash';
import { AuditJob } from '../types/job';

const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN || 'dummy'
});

export async function startAudit(clientUrl: string, competitorUrls: string[], customInstructions: string): Promise<string> {
  const jobId = crypto.randomUUID();
  const job: AuditJob = {
    id: jobId,
    clientUrl,
    competitorUrls,
    customInstructions,
    status: 'pending',
    progress: 0,
    createdAt: Date.now()
  };

  await redis.set(`job:${jobId}`, job);

  const workerUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/worker`;
  
  if (process.env.QSTASH_TOKEN) {
    await qstashClient.publishJSON({
      url: workerUrl,
      body: { jobId }
    });
  } else {
    // Local fallback
    fetch(workerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId })
    }).catch(console.error);
  }

  return jobId;
}
