import type { JobState } from './types';

const MARKET_BASE = 'https://api.kie.ai';
const UPLOAD_BASE = 'https://kieai.redpandaai.co';

function apiKey(): string {
  const key = process.env.KIE_API_KEY;
  if (!key) {
    throw new Error(
      'KIE_API_KEY is not set. Add it to .env.local (see .env.local.example).'
    );
  }
  return key;
}

/**
 * Uploads a base64 / data-URL payload to Kie.ai's temporary file host and
 * returns a public downloadUrl that can be passed to createTask as a
 * reference_image_url / reference_video_url / reference_audio_url /
 * first_frame_url / last_frame_url.
 *
 * Kie.ai deletes uploaded files after ~24h, which is fine here since we
 * only need the URL long enough for the model to read it during generation.
 */
export async function uploadBase64(
  base64Data: string,
  fileName: string,
  uploadPath = 'seedance-workspace/refs'
): Promise<string> {
  const res = await fetch(`${UPLOAD_BASE}/api/file-base64-upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ base64Data, uploadPath, fileName })
  });

  const body = await res.json();
  if (!res.ok || !body?.success) {
    throw new Error(
      `Kie.ai file upload failed: ${body?.msg ?? res.statusText}`
    );
  }
  return body.data.downloadUrl as string;
}

/**
 * Creates a Seedance 2.0 generation task. Returns the taskId used to poll
 * status via getTaskStatus. We deliberately omit callBackUrl here and poll
 * instead, since local dev has no public URL for Kie.ai to call back to —
 * see the README for wiring up a real webhook in production.
 */
export async function createTask(
  model: string,
  input: Record<string, unknown>,
  callBackUrl?: string
): Promise<string> {
  const res = await fetch(`${MARKET_BASE}/api/v1/jobs/createTask`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      ...(callBackUrl ? { callBackUrl } : {}),
      input
    })
  });

  const body = await res.json();
  if (!res.ok || body?.code !== 200) {
    throw new Error(`Kie.ai createTask failed: ${body?.msg ?? res.statusText}`);
  }
  return body.data.taskId as string;
}

export interface TaskStatus {
  state: JobState;
  progress?: number;
  resultUrls?: string[];
  failMsg?: string;
}

const STATE_MAP: Record<string, JobState> = {
  waiting: 'waiting',
  queuing: 'queuing',
  generating: 'generating',
  success: 'success',
  fail: 'fail'
};

/**
 * Polls the unified Market task-status endpoint. Works for any Market
 * model, not just Seedance — same shape is reused if you add more models
 * behind this workspace later.
 */
export async function getTaskStatus(taskId: string): Promise<TaskStatus> {
  const res = await fetch(
    `${MARKET_BASE}/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`,
    { headers: { Authorization: `Bearer ${apiKey()}` } }
  );

  const body = await res.json();
  if (!res.ok) {
    throw new Error(`Kie.ai recordInfo failed: ${body?.msg ?? res.statusText}`);
  }

  const data = body.data ?? {};
  const state = STATE_MAP[data.state as string] ?? 'waiting';

  let resultUrls: string[] | undefined;
  if (data.resultJson) {
    try {
      resultUrls = JSON.parse(data.resultJson).resultUrls;
    } catch {
      resultUrls = undefined;
    }
  }

  return {
    state,
    progress: typeof data.progress === 'number' ? data.progress : undefined,
    resultUrls,
    failMsg: data.failMsg || undefined
  };
}
