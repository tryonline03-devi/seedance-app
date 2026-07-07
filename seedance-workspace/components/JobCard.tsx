import type { Job } from '@/lib/types';

const STATE_LABEL: Record<Job['state'], string> = {
  waiting: 'Waiting',
  queuing: 'Queued',
  generating: 'Rendering',
  success: 'Ready',
  fail: 'Failed'
};

const MODE_LABEL: Record<Job['mode'], string> = {
  'text-to-video': 'Text only',
  'image-first-frame': 'First frame',
  'image-first-last-frame': 'First + last',
  'multimodal-reference': 'Multimodal refs'
};

function timecode(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function JobCard({ job }: { job: Job }) {
  return (
    <div className="w-[300px] shrink-0 overflow-hidden rounded-md border border-line bg-panel">
      <div className="sprocket-rail" aria-hidden="true" />

      <div className="flex items-center justify-between gap-2 px-3 pt-2">
        <div className="flex items-center gap-2">
          <span className="tally-dot" data-state={job.state} />
          <span className="text-[11px] uppercase tracking-slate text-ash">
            {STATE_LABEL[job.state]}
          </span>
        </div>
        <span className="font-mono text-[11px] text-smoke">{timecode(job.createdAt)}</span>
      </div>

      <div className="px-3 pt-2">
        <p className="line-clamp-3 text-[13px] leading-snug text-paper">{job.prompt}</p>
      </div>

      <div className="px-3 pt-3">
        {job.state === 'success' && job.resultUrls?.[0] && (
          <video
            src={job.resultUrls[0]}
            controls
            className="aspect-video w-full rounded-sm bg-canvas"
          />
        )}

        {job.state === 'fail' && (
          <p className="rounded-sm border border-fail/40 bg-fail/10 px-2 py-1.5 text-[12px] text-fail">
            {job.failMsg || 'Generation failed.'}
          </p>
        )}

        {(job.state === 'waiting' || job.state === 'queuing' || job.state === 'generating') && (
          <div className="aspect-video w-full rounded-sm border border-dashed border-line bg-canvas">
            <div className="flex h-full flex-col items-center justify-center gap-1.5">
              <span className="font-mono text-[11px] text-smoke">
                {job.progress != null ? `${job.progress}%` : '—'}
              </span>
              <div className="h-1 w-24 overflow-hidden rounded-full bg-panel-raised">
                <div
                  className="h-full bg-tally transition-all"
                  style={{ width: `${job.progress ?? 6}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 px-3 py-2 font-mono text-[10.5px] text-smoke">
        <span className="truncate">{job.taskId}</span>
        <span>{MODE_LABEL[job.mode]}</span>
      </div>

      <div className="sprocket-rail" aria-hidden="true" />
    </div>
  );
}
