'use client';

import { useEffect, useRef, useState } from 'react';
import Composer from '@/components/Composer';
import JobGallery from '@/components/JobGallery';
import type { GenerateRequestBody, Job } from '@/lib/types';

const POLL_INTERVAL_MS = 4000;
const ACTIVE_STATES = new Set(['waiting', 'queuing', 'generating']);

export default function Page() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const jobsRef = useRef<Job[]>([]);
  jobsRef.current = jobs;

  // Initial load
  useEffect(() => {
    fetch('/api/jobs')
      .then((r) => r.json())
      .then(setJobs)
      .catch(() => setJobs([]));
  }, []);

  // Poll any job that hasn't reached a terminal state yet.
  useEffect(() => {
    const interval = setInterval(async () => {
      const active = jobsRef.current.filter((j) => ACTIVE_STATES.has(j.state));
      if (active.length === 0) return;

      const updates = await Promise.all(
        active.map(async (job) => {
          try {
            const res = await fetch(`/api/jobs/${job.id}`);
            if (!res.ok) return null;
            return (await res.json()) as Job;
          } catch {
            return null;
          }
        })
      );

      setJobs((prev) =>
        prev.map((job) => updates.find((u) => u && u.id === job.id) ?? job)
      );
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  async function handleGenerate(body: GenerateRequestBody) {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Generation request failed');
    }
    setJobs((prev) => [data as Job, ...prev]);
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 lg:px-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-[15px] uppercase tracking-slate text-paper">
            Seedance workspace
          </h1>
          <p className="mt-1 text-[13px] text-smoke">
            Compose a shot, send it to Seedance 2.0, watch it land in the reel.
          </p>
        </div>
        <span className="rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-ash">
          via Kie.ai
        </span>
      </header>

      <div className="flex flex-col gap-8">
        <Composer onSubmit={handleGenerate} />
        <JobGallery jobs={jobs} />
      </div>
    </main>
  );
}
