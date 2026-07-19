import { NextResponse } from 'next/server';
import { redis } from '../../../../lib/redis';
import { AuditJob } from '../../../../types/job';
import { generatePresentation, AuditResult } from '../../../../engines/pptEngine';
import { supabase } from '../../../../lib/supabase';

export const maxDuration = 60;

export async function POST(req: Request) {
  const { jobId } = await req.json();
  if (!jobId) return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });

  const jobStr = await redis.get(`job:${jobId}`);
  const analyzeStr = await redis.get(`job:${jobId}:analyze`);
  if (!jobStr || !analyzeStr) return NextResponse.json({ error: 'Data not found' }, { status: 404 });
  
  const job = (typeof jobStr === 'string' ? JSON.parse(jobStr) : jobStr) as AuditJob;
  const analyzeResult = (typeof analyzeStr === 'string' ? JSON.parse(analyzeStr) : analyzeStr) as any;

  try {
    const auditData: AuditResult = {
      clientUrl: job.clientUrl,
      issues: analyzeResult.allIssues,
      missingFeatures: analyzeResult.missingFeatures,
      recommendations: ['Improve contrast on primary CTAs', 'Add trust badges to the footer']
    };
    
    const pptBuffer = await generatePresentation(auditData);
    
    const fileName = `audit-${jobId}.pptx`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audits')
      .upload(fileName, pptBuffer, { contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
      
    let downloadUrl = '';
    if (!uploadError) {
      const { data } = supabase.storage.from('audits').getPublicUrl(fileName);
      downloadUrl = data.publicUrl;
    } else {
      console.error("Supabase Upload Error:", uploadError);
      downloadUrl = `upload_error: ${uploadError.message}`;
    }

    job.status = 'completed';
    job.progress = 100;
    job.result = { downloadUrl, issues: analyzeResult.allIssues };
    
    await redis.set(`job:${jobId}`, job);
    
    // Cleanup temporary redis keys to save space
    await redis.del(`job:${jobId}:crawl`);
    await redis.del(`job:${jobId}:analyze`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    job.status = 'failed';
    await redis.set(`job:${jobId}`, job);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
