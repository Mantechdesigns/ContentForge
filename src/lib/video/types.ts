/**
 * Content Forge — Video Provider Types
 * Core interfaces and types for the video generation system.
 */

/* ───── Job Statuses ───── */
export type ContentJobStatus =
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'needs_review';

/* ───── Job Source Types ───── */
export type JobSource =
  | 'telegram_voice_brief'
  | 'telegram_video_remix'
  | 'app_script_to_video'
  | 'app_url_breakdown_to_video';

/* ───── Provider Mode ───── */
export type ProviderMode = 'mcp' | 'api';

/* ───── Provider Interface ───── */
export interface GenerateVideoInput {
  jobId: string;
  script: string;
  avatarId: string;
  voiceId?: string;
  aspectRatio?: '9:16' | '1:1' | '16:9';
  background?: string;
  callbackUrl?: string;
}

export interface GenerateVideoResult {
  providerVideoId: string;
  status: 'submitted' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  error?: string;
}

export interface VideoJobStatus {
  providerVideoId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  error?: string;
}

export interface VideoProvider {
  readonly name: string;
  readonly mode: ProviderMode;
  generateVideo(input: GenerateVideoInput): Promise<GenerateVideoResult>;
  getStatus(jobId: string): Promise<VideoJobStatus>;
}

/* ───── Content Job Record ───── */
export interface ContentJob {
  id: string;
  source: JobSource;
  owner: string;            // 'manny' | 'internal' | workspace-id
  status: ContentJobStatus;
  providerMode: ProviderMode;
  heygenVideoId?: string;
  script: string;
  avatarId: string;
  config: Record<string, unknown>;
  result?: {
    videoUrl: string;
    thumbnailUrl?: string;
    duration?: number;
  };
  error?: string;
  createdAt: string;
  updatedAt: string;
}

/* ───── Create Job Input ───── */
export interface CreateJobInput {
  source: JobSource;
  owner: string;
  script: string;
  avatarId?: string;
  config?: Record<string, unknown>;
}
