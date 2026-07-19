import { redis } from './redis';
import { Client } from '@upstash/qstash';
import { AuditJob } from '../types/job';

const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN || '',
  baseUrl: process.env.QSTASH_URL || 'https://qstash-us-east-1.upstash.io',
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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const workerUrl = `${baseUrl}/api/worker/crawl`;
  
  if (process.env.QSTASH_TOKEN) {
    await qstashClient.publishJSON({
      url: workerUrl,
      body: { jobId }
    });
  } else {
    // Local fallback: await the fetch so Vercel doesn't kill the background promise
    await fetch(workerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId })
    });
  }

  return jobId;
}
