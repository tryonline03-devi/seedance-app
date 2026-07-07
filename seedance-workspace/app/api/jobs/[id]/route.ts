import { NextResponse } from 'next/server';
import { getTaskStatus } from '@/lib/kie';
import { getJob, updateJob } from '@/lib/store';

const TERMINAL_STATES = new Set(['success', 'fail']);

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const job = getJob(params.id);
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  // Once a job has finished there's nothing new to fetch — this also keeps
  // us from hammering the Kie.ai API for old jobs the gallery re-renders.
  if (TERMINAL_STATES.has(job.state)) {
    return NextResponse.json(job);
  }

  try {
    const status = await getTaskStatus(job.taskId);
    const updated = updateJob(job.id, {
      state: status.state,
      progress: status.progress,
      resultUrls: status.resultUrls,
      failMsg: status.failMsg
    });
    return NextResponse.json(updated ?? job);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
