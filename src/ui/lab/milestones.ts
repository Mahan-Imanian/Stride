import type { Run } from "@/core/experiment";

export interface Phase {
  start: number;
  end: number;
  label: string;
}

export function phases(run: Run, total: number): Phase[] {
  const cuts = run.trace.checkpoints.filter((c) => c.at > 0 && c.at < total);
  const out: Phase[] = [];
  let start = 0;
  for (const c of cuts) {
    if (c.at > start) out.push({ start, end: c.at, label: c.label });
    start = c.at;
  }
  const last = run.trace.checkpoints[run.trace.checkpoints.length - 1];
  out.push({ start, end: total, label: last && last.at >= total ? last.label : "End" });
  return out;
}

export function nextMilestone(run: Run, at: number): string | null {
  const next = run.trace.checkpoints.find((c) => c.at > at);
  return next ? next.label : null;
}
