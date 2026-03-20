/**
 * Content Forge — HeyGen MCP Provider
 * Internal/founder-mode adapter: formats MCP tool call payloads
 * for the Gravity Claw bot to execute.
 *
 * Day 4 stub: logs the payload; does not actually call MCP.
 * Full MCP client integration comes when the bot has the HeyGen
 * MCP server configured.
 */
import type { VideoProvider, GenerateVideoInput, GenerateVideoResult, VideoJobStatus } from './types';
import { getJob } from './job-store';

export class HeyGenMcpProvider implements VideoProvider {
  readonly name = 'HeyGenMCP';
  readonly mode = 'mcp' as const;

  async generateVideo(input: GenerateVideoInput): Promise<GenerateVideoResult> {
    // Build the MCP tool call payload that Gravity Claw would execute
    const mcpPayload = {
      tool: 'heygen_create_video',
      arguments: {
        avatar_id: input.avatarId,
        script: input.script,
        voice_id: input.voiceId || 'en-US-JennyNeural',
        aspect_ratio: input.aspectRatio || '9:16',
        background: input.background || 'studio',
        callback_id: input.jobId,
      },
    };

    console.log(`[HeyGenMCP] 🧑‍💼 Founder mode — MCP payload for job ${input.jobId}:`);
    console.log(JSON.stringify(mcpPayload, null, 2));
    console.log('[HeyGenMCP] → Waiting for Gravity Claw bot or manual MCP execution');

    // In founder mode, the job stays in 'processing' until the result
    // comes back via the OpenClaw bridge or webhook
    return {
      providerVideoId: `mcp-${input.jobId}`,
      status: 'processing',
    };
  }

  async getStatus(providerVideoId: string): Promise<VideoJobStatus> {
    // For MCP mode, status comes from our job store (updated via bridge/webhook)
    const jobId = providerVideoId.replace('mcp-', '');
    const job = getJob(jobId);

    if (!job) {
      return {
        providerVideoId,
        status: 'pending',
      };
    }

    const statusMap: Record<string, VideoJobStatus['status']> = {
      queued: 'pending',
      processing: 'processing',
      completed: 'completed',
      failed: 'failed',
      needs_review: 'completed',
    };

    return {
      providerVideoId,
      status: statusMap[job.status] || 'pending',
      videoUrl: job.result?.videoUrl,
      thumbnailUrl: job.result?.thumbnailUrl,
    };
  }
}
