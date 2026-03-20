import { NextRequest, NextResponse } from 'next/server';
import { routeJob } from '@/lib/video/provider-router';
import { listJobs } from '@/lib/video/job-store';
import type { JobSource } from '@/lib/video/types';

const VALID_SOURCES: JobSource[] = [
  'telegram_voice_brief',
  'telegram_video_remix',
  'app_script_to_video',
  'app_url_breakdown_to_video',
];

/**
 * POST /api/video/jobs
 * Secure inbound endpoint for Railway/OpenClaw to create video jobs.
 * Requires x-shared-secret header for authentication.
 */
export async function POST(req: NextRequest) {
  // ── Auth ──
  const secret = req.headers.get('x-shared-secret');
  const expectedSecret = process.env.CONTENT_FORGE_SHARED_SECRET;

  if (!expectedSecret) {
    console.error('[video/jobs] CONTENT_FORGE_SHARED_SECRET not configured');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  if (secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── Parse body ──
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { source, owner, script, avatarId, config } = body;

  // ── Validate ──
  if (!source || !VALID_SOURCES.includes(source)) {
    return NextResponse.json(
      { error: `Invalid source. Must be one of: ${VALID_SOURCES.join(', ')}` },
      { status: 400 }
    );
  }

  if (!owner || typeof owner !== 'string') {
    return NextResponse.json({ error: 'owner required (string)' }, { status: 400 });
  }

  if (!script || typeof script !== 'string') {
    return NextResponse.json({ error: 'script required (string)' }, { status: 400 });
  }

  if (script.length > 5000) {
    return NextResponse.json({ error: 'Script too long (max 5000 chars for HeyGen)' }, { status: 400 });
  }

  // ── Create & route job ──
  try {
    const job = await routeJob({
      source,
      owner,
      script,
      avatarId,
      config,
    });

    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      providerMode: job.providerMode,
    }, { status: 201 });
  } catch (err) {
    console.error('[video/jobs] Failed to create job:', err);
    return NextResponse.json(
      { error: 'Failed to create video job' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/video/jobs
 * List all jobs. Optionally filter by ?status= or ?owner=
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const status = searchParams.get('status') as import('@/lib/video/types').ContentJobStatus | null;
  const owner = searchParams.get('owner');

  const jobs = listJobs({
    status: status || undefined,
    owner: owner || undefined,
  });

  return NextResponse.json({ jobs, count: jobs.length });
}
