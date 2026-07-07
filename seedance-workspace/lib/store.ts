import fs from 'node:fs';
import path from 'node:path';
import type { Job } from './types';

// A flat JSON file stands in for a database here so the scaffold runs with
// zero external services. It is NOT safe for concurrent writers or
// serverless deploys (the filesystem is ephemeral on most hosts) — swap
// this module for Postgres/Supabase/SQLite before shipping this for real.
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'jobs.json');

function ensureFile(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
}

function readAll(): Job[] {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) as Job[];
  } catch {
    return [];
  }
}

function writeAll(jobs: Job[]): void {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(jobs, null, 2), 'utf-8');
}

export function listJobs(): Job[] {
  return readAll().sort((a, b) => b.createdAt - a.createdAt);
}

export function getJob(id: string): Job | undefined {
  return readAll().find((j) => j.id === id);
}

export function createJob(job: Job): Job {
  const jobs = readAll();
  jobs.push(job);
  writeAll(jobs);
  return job;
}

export function updateJob(id: string, patch: Partial<Job>): Job | undefined {
  const jobs = readAll();
  const idx = jobs.findIndex((j) => j.id === id);
  if (idx === -1) return undefined;
  jobs[idx] = { ...jobs[idx], ...patch, updatedAt: Date.now() };
  writeAll(jobs);
  return jobs[idx];
}
