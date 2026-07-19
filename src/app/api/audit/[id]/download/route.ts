import { NextResponse } from 'next/server';
import { redis } from '../../../../lib/redis';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  const job = await redis.get(\`job:\${id}\`) as any;
  if (!job || !job.result) {
    return NextResponse.json({ error: 'Not found or not completed' }, { status: 404 });
  }

  if (!job.result.downloadUrl) {
    return NextResponse.json({ error: 'Download URL not available' }, { status: 404 });
  }

  return NextResponse.redirect(job.result.downloadUrl);
}
