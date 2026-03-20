import { NextRequest, NextResponse } from 'next/server';
import { getJob } from '@/lib/video/job-store';

/**
 * GET /api/video/status?jobId=xxx
 * Poll for the current status of a video job.
 */
export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json({ error: 'jobId query param required' }, { status: 400 });
  }

  const job = getJob(jobId);

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  return NextResponse.json({ job });
}
