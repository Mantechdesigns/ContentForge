/**
 * Content Forge — Provider Router
 * Routes video jobs to the correct provider based on owner.
 *
 * Routing logic:
 *   if job.owner === 'manny' or 'internal' → MCP provider
 *   if job.owner === client workspace     → API provider
 */
import type { VideoProvider, ContentJob } from './types';
import { createJob, updateJob } from './job-store';
import { HeyGenApiProvider } from './heygen-api-provider';
import { HeyGenMcpProvider } from './heygen-mcp-provider';
import type { CreateJobInput } from './types';

const apiProvider = new HeyGenApiProvider();
const mcpProvider = new HeyGenMcpProvider();

/**
 * Get the correct provider for a job.
 */
export function getProvider(job: ContentJob): VideoProvider {
  return job.providerMode === 'mcp' ? mcpProvider : apiProvider;
}

/**
 * Create a job, route to the correct provider, and kick off generation.
 * Returns the created job immediately (generation is async for API mode).
 */
export async function routeJob(input: CreateJobInput): Promise<ContentJob> {
  const job = createJob(input);
  const provider = getProvider(job);

  console.log(`[router] Routing job ${job.id} → ${provider.name} (${provider.mode})`);

  // Fire-and-forget: kick off generation async
  processJob(job, provider).catch((err) => {
    console.error(`[router] Background processing failed for ${job.id}:`, err);
    updateJob(job.id, {
      status: 'failed',
      error: (err as Error).message || 'Unknown processing error',
    });
  });

  return job;
}

/**
 * Process a job through its provider.
 */
async function processJob(job: ContentJob, provider: VideoProvider): Promise<void> {
  // Mark as processing
  updateJob(job.id, { status: 'processing' });

  const callbackUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}/api/video/webhook`
    : process.env.CONTENT_FORGE_URL
      ? `${process.env.CONTENT_FORGE_URL}/api/video/webhook`
      : undefined;

  const result = await provider.generateVideo({
    jobId: job.id,
    script: job.script,
    avatarId: job.avatarId,
    aspectRatio: (job.config.aspectRatio as '9:16' | '1:1' | '16:9') || '9:16',
    background: (job.config.background as string) || 'studio',
    voiceId: job.config.voiceId as string | undefined,
    callbackUrl,
  });

  // Update job with provider video ID
  updateJob(job.id, {
    heygenVideoId: result.providerVideoId,
    status: result.status === 'failed' ? 'failed' : 'processing',
    error: result.error,
    result: result.videoUrl ? { videoUrl: result.videoUrl } : undefined,
  });

  // If API mode returned a completed video immediately (unlikely but possible)
  if (result.status === 'completed' && result.videoUrl) {
    updateJob(job.id, {
      status: 'needs_review',
      result: { videoUrl: result.videoUrl },
    });
  }
}
