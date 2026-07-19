import { NextResponse } from 'next/server';
import { redis } from '../../../../lib/redis';
import { AuditJob } from '../../../../types/job';
import { crawlSite } from '../../../../engines/crawler';
import { Client } from '@upstash/qstash';

export const maxDuration = 60;
const qstashClient = new Client({ token: process.env.QSTASH_TOKEN || '', baseUrl: process.env.QSTASH_URL || 'https://qstash-us-east-1.upstash.io' });

export async function POST(req: Request) {
  const { jobId } = await req.json();
  if (!jobId) return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });

  const jobStr = await redis.get(`job:${jobId}`);
  if (!jobStr) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  const job = (typeof jobStr === 'string' ? JSON.parse(jobStr) : jobStr) as AuditJob;

  try {
    job.status = 'running';
    job.progress = 10;
    await redis.set(`job:${jobId}`, job);

    const crawlResult = await crawlSite(job.clientUrl, { maxPages: 1 });
    await redis.set(`job:${jobId}:crawl`, crawlResult);
    
    job.progress = 30;
    await redis.set(`job:${jobId}`, job);

    // Frontend orchestration drives the next step now
    return NextResponse.json({ success: true });
  } catch (error: any) {
    job.status = 'failed';
    await redis.set(`job:${jobId}`, job);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
