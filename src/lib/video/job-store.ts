/**
 * Content Forge — In-Memory Job Store
 * Tracks video generation jobs. Will be replaced by Supabase later.
 */
import { ContentJob, ContentJobStatus, CreateJobInput, ProviderMode } from './types';

const INTERNAL_OWNERS = ['manny', 'internal'];

/* ───── Store ───── */
const jobs = new Map<string, ContentJob>();

function generateId(): string {
  return crypto.randomUUID();
}

function resolveProviderMode(owner: string): ProviderMode {
  return INTERNAL_OWNERS.includes(owner.toLowerCase()) ? 'mcp' : 'api';
}

/* ───── Public API ───── */

export function createJob(input: CreateJobInput): ContentJob {
  const now = new Date().toISOString();
  const id = generateId();
  const providerMode = resolveProviderMode(input.owner);

  const job: ContentJob = {
    id,
    source: input.source,
    owner: input.owner,
    status: 'queued',
    providerMode,
    script: input.script,
    avatarId: input.avatarId || process.env.HEYGEN_DEFAULT_AVATAR_ID || '',
    config: input.config || {},
    createdAt: now,
    updatedAt: now,
  };

  jobs.set(id, job);
  console.log(`[job-store] Created job ${id} (${input.source}, mode: ${providerMode})`);
  return job;
}

export function getJob(id: string): ContentJob | null {
  return jobs.get(id) || null;
}

export function updateJob(
  id: string,
  updates: Partial<Pick<ContentJob, 'status' | 'heygenVideoId' | 'result' | 'error'>>
): ContentJob | null {
  const job = jobs.get(id);
  if (!job) return null;

  const updated: ContentJob = {
    ...job,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  jobs.set(id, updated);
  console.log(`[job-store] Updated job ${id} → ${updated.status}`);
  return updated;
}

export function listJobs(filter?: { status?: ContentJobStatus; owner?: string }): ContentJob[] {
  let results = Array.from(jobs.values());

  if (filter?.status) {
    results = results.filter((j) => j.status === filter.status);
  }
  if (filter?.owner) {
    results = results.filter((j) => j.owner === filter.owner);
  }

  // Most recent first
  return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Find a job by its HeyGen video ID (used by webhook handler).
 */
export function findJobByHeygenVideoId(heygenVideoId: string): ContentJob | null {
  for (const job of jobs.values()) {
    if (job.heygenVideoId === heygenVideoId) return job;
  }
  return null;
}
