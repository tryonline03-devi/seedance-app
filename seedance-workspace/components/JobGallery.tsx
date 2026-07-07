import type { Job } from '@/lib/types';
import JobCard from './JobCard';

export default function JobGallery({ jobs }: { jobs: Job[] }) {
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-[11px] uppercase tracking-slate text-ash">The reel</h2>
        <span className="font-mono text-[11px] text-smoke">{jobs.length} clip{jobs.length === 1 ? '' : 's'}</span>
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-md border border-dashed border-line px-4 py-8 text-center text-[13px] text-smoke">
          No renders yet — compose one above and it will land here.
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </section>
  );
}
