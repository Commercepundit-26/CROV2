import { NextResponse } from 'next/server';
import { z } from 'zod';
import { startAudit } from '../../../lib/orchestrator';
import { redis } from '../../../lib/redis';

const AuditRequestSchema = z.object({
  clientUrl: z.string().url(),
  competitorUrls: z.array(z.string().url()).optional().default([]),
  customInstructions: z.string().optional().default('')
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clientUrl, competitorUrls, customInstructions } = AuditRequestSchema.parse(body);

    const jobId = await startAudit(clientUrl, competitorUrls, customInstructions);
    return NextResponse.json({ jobId, message: 'Audit started' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing job id' }, { status: 400 });

  const job = await redis.get(\`job:\${id}\`);
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  return NextResponse.json(job);
}
