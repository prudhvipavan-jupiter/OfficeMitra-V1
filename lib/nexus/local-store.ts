import fs from "fs";
import path from "path";
import type { NexusJob, NexusJobStatus } from "./types";

const dataDir = path.join(process.cwd(), "data", "nexus");
const jobsPath = path.join(dataDir, "jobs.json");

function ensureDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

function readJobs(): NexusJob[] {
  ensureDir();
  if (!fs.existsSync(jobsPath)) return [];
  return JSON.parse(fs.readFileSync(jobsPath, "utf-8")) as NexusJob[];
}

function writeJobs(jobs: NexusJob[]) {
  ensureDir();
  fs.writeFileSync(jobsPath, JSON.stringify(jobs, null, 2));
}

export function localListJobs(status?: NexusJobStatus): NexusJob[] {
  let jobs = readJobs();
  if (status) jobs = jobs.filter((j) => j.status === status);
  return jobs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function localGetJob(id: string): NexusJob | null {
  return readJobs().find((j) => j.id === id) ?? null;
}

export function localSaveJob(job: NexusJob): NexusJob {
  const jobs = readJobs();
  const idx = jobs.findIndex((j) => j.id === job.id);
  if (idx >= 0) jobs[idx] = job;
  else jobs.unshift(job);
  writeJobs(jobs);
  return job;
}

export function localDeleteJob(id: string): boolean {
  const jobs = readJobs();
  const next = jobs.filter((j) => j.id !== id);
  if (next.length === jobs.length) return false;
  writeJobs(next);
  return true;
}
