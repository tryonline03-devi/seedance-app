import { NextResponse } from 'next/server';
import { listJobs } from '@/lib/store';

export async function GET() {
  return NextResponse.json(listJobs());
}
