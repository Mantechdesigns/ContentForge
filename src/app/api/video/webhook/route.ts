import { NextRequest, NextResponse } from 'next/server';
import { getJob, updateJob, findJobByHeygenVideoId } from '@/lib/video/job-store';

/**
 * POST /api/video/webhook
 * HeyGen webhook receiver for avatar video success/fail events.
 *
 * Expected events:
 *   - avatar_video.success → updates job to 'needs_review'
 *   - avatar_video.fail    → updates job to 'failed'
 *
 * HeyGen sends callback_id (our job ID) in the payload.
 */
export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { event_type, event_data } = body;

  if (!event_type || !event_data) {
    console.warn('[webhook] Missing event_type or event_data');
    return NextResponse.json({ error: 'Missing event_type or event_data' }, { status: 400 });
  }

  console.log(`[webhook] Received: ${event_type}`);
  console.log('[webhook] Data:', JSON.stringify(event_data).substring(0, 300));

  // Resolve the job: try callback_id first (our job ID), fallback to video_id lookup
  const callbackId = event_data.callback_id;
  const videoId = event_data.video_id;

  let job = callbackId ? getJob(callbackId) : null;
  if (!job && videoId) {
    job = findJobByHeygenVideoId(videoId);
  }

  if (!job) {
    console.warn(`[webhook] No matching job found for callback_id=${callbackId}, video_id=${videoId}`);
    // Return 200 so HeyGen doesn't retry — the job may have been lost on restart
    return NextResponse.json({ received: true, matched: false });
  }

  switch (event_type) {
    case 'avatar_video.success': {
      const videoUrl = event_data.url || event_data.video_url || '';
      const thumbnailUrl = event_data.thumbnail_url || '';
      const duration = event_data.duration;

      updateJob(job.id, {
        status: 'needs_review',
        result: {
          videoUrl,
          thumbnailUrl: thumbnailUrl || undefined,
          duration: duration || undefined,
        },
      });

      console.log(`[webhook] ✅ Job ${job.id} → needs_review (video: ${videoUrl.substring(0, 60)}...)`);
      break;
    }

    case 'avatar_video.fail': {
      const errorMsg = event_data.error || event_data.message || 'HeyGen video generation failed';

      updateJob(job.id, {
        status: 'failed',
        error: errorMsg,
      });

      console.error(`[webhook] ❌ Job ${job.id} → failed: ${errorMsg}`);
      break;
    }

    default:
      console.log(`[webhook] Unhandled event type: ${event_type}`);
  }

  // Always return 200 quickly — never block the webhook
  return NextResponse.json({ received: true, matched: true, jobId: job.id });
}

/**
 * GET /api/video/webhook — health check for webhook registration
 */
export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/video/webhook',
    events: ['avatar_video.success', 'avatar_video.fail'],
  });
}
