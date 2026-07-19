import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { AuditJob } from '@/types/job';
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const body = await req.json();
    const { action, payload } = body;
    
    const jobStr = await redis.get(`job:${id}`);
    if (!jobStr) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    const job = (typeof jobStr === 'string' ? JSON.parse(jobStr) : jobStr) as AuditJob;
    
    // Simplistic handling
    if (action === 'remove_issue' && job.result) {
      job.result.issues = job.result.issues.filter(i => i.id !== payload.issueId);
      await redis.set(`job:${id}`, JSON.stringify(job));
    }
    
    return NextResponse.json({ message: 'Chat interaction recorded', action, payload, job });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
