/**
 * Content Forge — HeyGen API Provider
 * Product-mode adapter: calls HeyGen API v2 directly.
 * Used for client workspace jobs (non-internal owners).
 */
import type { VideoProvider, GenerateVideoInput, GenerateVideoResult, VideoJobStatus } from './types';

const HEYGEN_BASE = 'https://api.heygen.com';

function getApiKey(): string {
  const key = process.env.HEYGEN_API_KEY;
  if (!key) throw new Error('[HeyGenAPI] HEYGEN_API_KEY not set');
  return key;
}

function getBackgroundColor(bg?: string): string {
  const map: Record<string, string> = {
    studio: '#0d0d1a',
    office: '#1a1a2e',
    outdoor: '#1a2e1a',
    minimal: '#f0f0f0',
    gradient: '#1a1a2e',
  };
  return map[bg || 'studio'] || '#0d0d1a';
}

export class HeyGenApiProvider implements VideoProvider {
  readonly name = 'HeyGenAPI';
  readonly mode = 'api' as const;

  async generateVideo(input: GenerateVideoInput): Promise<GenerateVideoResult> {
    const apiKey = getApiKey();

    // Map aspect ratio to dimensions
    const dimensions: Record<string, { width: number; height: number }> = {
      '9:16': { width: 1080, height: 1920 },
      '1:1': { width: 1080, height: 1080 },
      '16:9': { width: 1920, height: 1080 },
    };
    const dim = dimensions[input.aspectRatio || '9:16'] || dimensions['9:16'];

    const payload = {
      video_inputs: [
        {
          character: {
            type: 'avatar',
            avatar_id: input.avatarId,
            avatar_style: 'normal',
          },
          voice: {
            type: 'text',
            input_text: input.script,
            voice_id: input.voiceId || 'en-US-JennyNeural',
          },
          background: {
            type: 'color',
            value: getBackgroundColor(input.background),
          },
        },
      ],
      dimension: dim,
      aspect_ratio: input.aspectRatio || '9:16',
      // callback_id links back to our job for webhook matching
      callback_id: input.jobId,
    };

    console.log(`[HeyGenAPI] Generating video for job ${input.jobId}, avatar: ${input.avatarId}`);

    const res = await fetch(`${HEYGEN_BASE}/v2/video/generate`, {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(60000),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[HeyGenAPI] Error ${res.status}:`, errText);
      return {
        providerVideoId: '',
        status: 'failed',
        error: `HeyGen API error (${res.status}): ${errText.substring(0, 200)}`,
      };
    }

    const data = await res.json();
    const videoId = data.data?.video_id || '';

    console.log(`[HeyGenAPI] Video submitted: ${videoId}`);
    return {
      providerVideoId: videoId,
      status: 'submitted',
    };
  }

  async getStatus(providerVideoId: string): Promise<VideoJobStatus> {
    const apiKey = getApiKey();

    const res = await fetch(
      `${HEYGEN_BASE}/v1/video_status.get?video_id=${providerVideoId}`,
      {
        headers: { 'X-Api-Key': apiKey },
        signal: AbortSignal.timeout(30000),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      return {
        providerVideoId,
        status: 'failed',
        error: `Status check failed (${res.status}): ${errText.substring(0, 200)}`,
      };
    }

    const data = await res.json();
    const status = data.data?.status;
    const videoUrl = data.data?.video_url;
    const thumbnailUrl = data.data?.thumbnail_url;
    const duration = data.data?.duration;

    const statusMap: Record<string, VideoJobStatus['status']> = {
      pending: 'pending',
      processing: 'processing',
      completed: 'completed',
      failed: 'failed',
    };

    return {
      providerVideoId,
      status: statusMap[status] || 'pending',
      videoUrl: videoUrl || undefined,
      thumbnailUrl: thumbnailUrl || undefined,
      duration: duration || undefined,
    };
  }
}
