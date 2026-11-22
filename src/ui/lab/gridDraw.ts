import type { Run } from "@/core/experiment";
import type { GridInput } from "@/core/grid/model";
import { CLOSED, OPEN } from "@/core/grid/machine";
import type { Palette } from "../hooks";
import { badge, canvasFont, crisp, hatch, haloLine, snapPx, stipple } from "./canvasKit";

export type GridRun = Extract<Run, { family: "grid" }>;

export interface Geometry {
  s: number;
  ox: number;
  oy: number;
  ruler: number;
  dpr: number;
}

const RULER = 24;
export const TRAIL_LENGTH = 6;
const RANKED = 3;

export function geometry(W: number, H: number, w: number, h: number, dpr = 1): Geometry {
  const probe = Math.floor(Math.min(W / w, H / h));
  const ruler = probe >= 11 && W > 360 ? RULER : 0;
  const fit = Math.min((W - ruler) / w, (H - ruler) / h);
  const s = Math.max(3, Math.floor(fit * dpr)) / dpr;
  return {
    s,
    ruler,
    dpr,
    ox: snapPx(ruler + (W - ruler - s * w) / 2, dpr),
    oy: snapPx(ruler + (H - ruler - s * h) / 2, dpr),
  };
}

export interface Snap {
  status: Uint8Array;
  current: number;
  pushedNow: number[];
  path: number[];
  outcome: string;
  g: Float64Array;
  parent: Int32Array;
  frontier: { cell: number; pri: number; h: number }[];
  trail: number[];
  ranked: number[];
  diffStatus: Uint8Array | null;
  diffPath: number[] | null;
  diffCurrent: number;
}

export interface Anim {
  from: Uint8Array;
  at: Float64Array;
  pathKey: string;
  pathT: number;
  dur: number;
}

export interface View {
  geo: Geometry;
  input: GridInput;
  palette: Palette;
  terrain: HTMLCanvasElement | null;
  editing: boolean;
  values: boolean;
  hidden: boolean;
  focus: number | null;
  reduced: boolean;
  algo: string;
  w: number;
  h: number;
}

function recentlyClosed(closedAt: Int32Array, current: number): number[] {
  const best: [number, number][] = [];
  for (let i = 0; i < closedAt.length; i++) {
    const t = closedAt[i];
    if (t < 0 || i === current) continue;
    if (best.length < TRAIL_LENGTH) best.push([t, i]);
    else {
      let min = 0;
      for (let k = 1; k < best.length; k++) if (best[k][0] < best[min][0]) min = k;
      if (t > best[min][0]) best[min] = [t, i];
    }
  }
  return best.sort((x, y) => x[0] - y[0]).map(([, i]) => i);
}

export function takeSnap(
  run: GridRun,
  cursor: number,
  diff: GridRun | null,
  diffCursor: number,
): Snap {
  const st = run.player.at(cursor).state;
  const ranked = st.frontier
    .filter((e) => st.status[e.cell] !== CLOSED)
    .sort((x, y) => x.pri - y.pri || x.seq - y.seq)
    .slice(0, RANKED)
    .map((e) => e.cell);
  const base = {
    status: st.status.slice(),
    current: st.current,
    pushedNow: st.pushedNow.slice(),
    path: st.path,
    outcome: st.outcome,
    g: st.g.slice(),
    parent: st.parent.slice(),
    frontier: st.frontier.slice(),
    trail: st.outcome === "running" ? recentlyClosed(st.closedAt, st.current) : [],
    ranked: st.outcome === "running" ? ranked : [],
  };
  if (!diff) return { ...base, diffStatus: null, diffPath: null, diffCurrent: -1 };
  const ds = diff.player.at(diffCursor).state;
  return {
    ...base,
    diffStatus: ds.status.slice(),
    diffPath: ds.path,
    diffCurrent: ds.outcome === "running" ? ds.current : -1,
  };
}

const hatchSpacing = (s: number) => Math.max(3.5, Math.min(7, s * 0.3));
const mudSpacing = (weight: number) => Math.max(3.6, 7.5 - (weight - 2) * 0.5);

export function paintTerrain(
  ctx: CanvasRenderingContext2D,
  geo: Geometry,
  input: GridInput,
  p: Palette,
) {
  const { s, ox, oy, ruler, dpr } = geo;
  const { w, h, cells } = input;
  if (ruler) {
    ctx.fillStyle = p.ink3;
    ctx.strokeStyle = p.ruleStrong;
    ctx.lineWidth = 1 / dpr;
    ctx.font = canvasFont(12);
    const every = s >= 18 ? 5 : 10;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.beginPath();
    for (let c = 0; c <= w; c++) {
      const x = crisp(ox + c * s, dpr);
      const major = c % every === 0;
      ctx.moveTo(x, oy - (major ? 6 : 3));
      ctx.lineTo(x, oy);
      if (major && c < w) ctx.fillText(String(c), ox + c * s + s / 2, oy - 7);
    }
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let r = 0; r <= h; r++) {
      const y = crisp(oy + r * s, dpr);
      const major = r % every === 0;
      ctx.moveTo(ox - (major ? 6 : 3), y);
      ctx.lineTo(ox, y);
      if (major && r < h) ctx.fillText(String(r), ox - 8, oy + r * s + s / 2);
    }
    ctx.stroke();
  }

  ctx.fillStyle = p.field;
  ctx.fillRect(ox, oy, s * w, s * h);

  if (s >= 6) {
    ctx.strokeStyle = p.gridLine;
    ctx.lineWidth = 1 / dpr;
    ctx.beginPath();
    for (let c = 1; c < w; c++) {
      const x = crisp(ox + c * s, dpr);
      ctx.moveTo(x, oy);
      ctx.lineTo(x, oy + s * h);
    }
    for (let r = 1; r < h; r++) {
      const y = crisp(oy + r * s, dpr);
      ctx.moveTo(ox, y);
      ctx.lineTo(ox + s * w, y);
    }
    ctx.stroke();
  }

  ctx.fillStyle = p.wall;
  for (let i = 0; i < w * h; i++) {
    if (cells[i] !== 0) continue;
    ctx.fillRect(ox + (i % w) * s, oy + Math.floor(i / w) * s, s, s);
  }

  const edgeW = Math.max(1, Math.round(1.25 * dpr)) / dpr;
  ctx.strokeStyle = p.wallEdge;
  ctx.lineWidth = edgeW;
  ctx.beginPath();
  const open = (c: number, r: number) =>
    c >= 0 && r >= 0 && c < w && r < h && cells[r * w + c] !== 0;
  for (let i = 0; i < w * h; i++) {
    if (cells[i] !== 0) continue;
    const c = i % w;
    const r = Math.floor(i / w);
    const x0 = ox + c * s;
    const y0 = oy + r * s;
    const half = edgeW / 2;
    if (open(c, r - 1)) {
      ctx.moveTo(x0, y0 + half);
      ctx.lineTo(x0 + s, y0 + half);
    }
    if (open(c, r + 1)) {
      ctx.moveTo(x0, y0 + s - half);
      ctx.lineTo(x0 + s, y0 + s - half);
    }
    if (open(c - 1, r)) {
      ctx.moveTo(x0 + half, y0);
      ctx.lineTo(x0 + half, y0 + s);
    }
    if (open(c + 1, r)) {
      ctx.moveTo(x0 + s - half, y0);
      ctx.lineTo(x0 + s - half, y0 + s);
    }
  }
  ctx.stroke();

  for (let i = 0; i < w * h; i++) {
    const v = cells[i];
    if (v <= 1) continue;
    const x = ox + (i % w) * s;
    const y = oy + Math.floor(i / w) * s;
    stipple(ctx, x, y, s, s, Math.min(mudSpacing(v), s / 2), p.rgb("enc-cost", 0.75));
    if (s >= 24) {
      ctx.fillStyle = p.ink2;
      ctx.font = canvasFont(12);
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";
      ctx.fillText(String(v), x + s - 2, y + s - 1);
    }
  }
}

interface Frame {
  ctx: CanvasRenderingContext2D;
  v: View;
  snap: Snap;
  a: Anim;
  p: Palette;
  s: number;
  ox: number;
  oy: number;
  w: number;
  h: number;
  dpr: number;
  now: number;
  center: (c: number) => [number, number];
}

const ease = (t: number) => 1 - (1 - t) * (1 - t) * (1 - t);

export function paint(ctx: CanvasRenderingContext2D, v: View, snap: Snap, a: Anim): boolean {
  const { s, ox, oy, dpr } = v.geo;
  const { w, h } = v.input;
  const f: Frame = {
    ctx,
    v,
    snap,
    a,
    p: v.palette,
    s,
    ox,
    oy,
    w,
    h,
    dpr,
    now: performance.now(),
    center: (c) => [ox + (c % w) * s + s / 2, oy + Math.floor(c / w) * s + s / 2],
  };
  ctx.clearRect(0, 0, v.w, v.h);
  if (v.terrain) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(v.terrain, 0, 0);
    ctx.restore();
  } else paintTerrain(ctx, v.geo, v.input, v.palette);

  const focus = v.focus !== null && v.focus >= 0 && v.focus < w * h ? v.focus : null;
  let animating = false;
  if (!v.editing) {
    animating = paintCells(f);
    if (!snap.diffStatus) paintTrail(f);
    if (v.values && s >= 22) paintValues(f);
    if (snap.current >= 0 && snap.pushedNow.length) paintEnqueued(f);
    if (focus !== null && snap.parent[focus] >= 0) paintParentTrail(f, focus);
    if (!v.hidden && paintPaths(f)) animating = true;
    paintCurrent(f);
    if (!snap.diffStatus && s >= 14 && !v.values && !v.hidden) paintRanks(f);
  }
  paintEndpoints(f);
  if (focus !== null) paintFocus(f, focus);
  return animating;
}

function paintCells({ ctx, v, snap, a, p, s, ox, oy, w, h, now }: Frame): boolean {
  const { cells } = v.input;
  const spacing = hatchSpacing(s);
  const doneHatch = hatch(ctx, p.closed, 1, spacing);
  const aHatch = hatch(ctx, p.a, 1, spacing);
  const bHatch = hatch(ctx, p.b, -1, spacing);
  const inset = Math.max(1.5, s * 0.16);
  const outlineW = Math.max(1.25, Math.min(2.5, s * 0.09));
  let animating = false;

  const drawOpen = (x: number, y: number, alpha: number, scale: number) => {
    if (alpha <= 0) return;
    const size = (s - inset * 2) * scale;
    const off = (s - size) / 2;
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = p.open;
    ctx.lineWidth = outlineW;
    ctx.strokeRect(x + off, y + off, size, size);
  };
  const drawClosed = (x: number, y: number, alpha: number) => {
    if (alpha <= 0) return;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.rgb("enc-done", 0.12);
    ctx.fillRect(x, y, s, s);
    if (doneHatch) {
      ctx.fillStyle = doneHatch;
      ctx.fillRect(x, y, s, s);
    }
  };

  if (snap.diffStatus) {
    for (let i = 0; i < w * h; i++) {
      if (cells[i] === 0) continue;
      const ca = snap.status[i] === CLOSED;
      const cb = snap.diffStatus[i] === CLOSED;
      if (!ca && !cb) continue;
      const x = ox + (i % w) * s;
      const y = oy + Math.floor(i / w) * s;
      if (ca && cb) {
        ctx.fillStyle = p.rgb("ink", 0.16);
        ctx.fillRect(x, y, s, s);
        continue;
      }
      ctx.fillStyle = p.rgb(ca ? "enc-a" : "enc-b", 0.12);
      ctx.fillRect(x, y, s, s);
      const pat = ca ? aHatch : bHatch;
      if (pat) {
        ctx.fillStyle = pat;
        ctx.fillRect(x, y, s, s);
      }
    }
    return false;
  }

  for (let i = 0; i < w * h; i++) {
    if (cells[i] === 0) continue;
    const st = snap.status[i];
    const t0 = a.at[i];
    const age = t0 && !v.reduced ? (now - t0) / a.dur : 1;
    if (!st && age >= 1) continue;
    const x = ox + (i % w) * s;
    const y = oy + Math.floor(i / w) * s;
    if (age >= 1) {
      if (st === CLOSED) drawClosed(x, y, 1);
      else if (st === OPEN) drawOpen(x, y, 1, 1);
      continue;
    }
    animating = true;
    const k = ease(Math.max(0, age));
    const from = a.from[i];
    if (from === CLOSED) drawClosed(x, y, 1 - k);
    else if (from === OPEN) drawOpen(x, y, 1 - k, 1 - 0.35 * k);
    if (st === CLOSED) {
      drawClosed(x, y, k);
      if (s >= 6) {
        ctx.globalAlpha = 1 - k;
        ctx.strokeStyle = p.current;
        ctx.lineWidth = outlineW;
        ctx.strokeRect(x + outlineW / 2, y + outlineW / 2, s - outlineW, s - outlineW);
      }
    } else if (st === OPEN) drawOpen(x, y, k, 0.65 + 0.35 * k);
  }
  ctx.globalAlpha = 1;
  return animating;
}

function paintTrail({ ctx, snap, p, s, ox, oy, w }: Frame) {
  const n = snap.trail.length;
  for (let k = 0; k < n; k++) {
    const c = snap.trail[k];
    ctx.fillStyle = p.rgb("enc-current", 0.08 + (0.3 * (k + 1)) / (n + 1));
    ctx.fillRect(ox + (c % w) * s, oy + Math.floor(c / w) * s, s, s);
  }
}

function paintRanks({ ctx, snap, p, s, center }: Frame) {
  snap.ranked.forEach((c, k) => {
    const [cx, cy] = center(c);
    badge(ctx, cx + s * 0.42, cy - s * 0.42, String(k + 1), p.current, p.bg, p.bg);
  });
}

function paintValues({ ctx, v, snap, p, s, ox, oy, w, h }: Frame) {
  const fs = Math.min(14, Math.floor(s * 0.34));
  ctx.font = canvasFont(fs);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const fMap = new Map<number, number>();
  if (v.algo === "astar" || v.algo === "greedy")
    for (const e of snap.frontier)
      if (!fMap.has(e.cell) || e.pri < fMap.get(e.cell)!) fMap.set(e.cell, e.pri);
  for (let i = 0; i < w * h; i++) {
    if (!snap.status[i] || !Number.isFinite(snap.g[i])) continue;
    const x = ox + (i % w) * s + s / 2;
    const y = oy + Math.floor(i / w) * s + s / 2;
    ctx.fillStyle = snap.status[i] === OPEN ? p.ink : p.ink2;
    const gv = Math.round(snap.g[i] * 10) / 10;
    const f = fMap.get(i);
    if (f !== undefined && s >= 34) {
      ctx.fillText(String(gv), x, y - 7);
      ctx.fillStyle = p.ink3;
      ctx.fillText(`f${Math.round(f * 10) / 10}`, x, y + 8);
    } else ctx.fillText(String(gv), x, y);
  }
}

function paintEnqueued({ ctx, v, snap, a, p, s, now, center }: Frame) {
  ctx.strokeStyle = p.rgb("enc-current", 0.85);
  ctx.lineWidth = Math.max(1, s * 0.09);
  ctx.lineCap = "round";
  const [cx, cy] = center(snap.current);
  for (const n of snap.pushedNow) {
    const [nx, ny] = center(n);
    const t0 = a.at[n];
    const k = t0 && !v.reduced ? ease(Math.min(1, (now - t0) / a.dur)) : 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + (nx - cx) * 0.8 * k, cy + (ny - cy) * 0.8 * k);
    ctx.stroke();
  }
  ctx.lineCap = "butt";
}

function paintParentTrail({ ctx, snap, p, w, h, center }: Frame, focus: number) {
  ctx.save();
  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = p.ink;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  let c = focus;
  ctx.moveTo(...center(c));
  let guard = 0;
  while (snap.parent[c] >= 0 && guard++ < w * h) {
    c = snap.parent[c];
    ctx.lineTo(...center(c));
  }
  ctx.stroke();
  ctx.restore();
}

function paintPaths({ ctx, snap, a, p, s, now, center }: Frame): boolean {
  let animating = false;
  const width = Math.max(2, s * 0.2);
  const draw = (path: number[], color: string, progress: number, dashed: boolean) => {
    if (path.length < 2) return;
    const pts = [...path].reverse().map(center);
    const segs = (pts.length - 1) * progress;
    const shown: [number, number][] = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      if (i - 1 >= segs) break;
      if (i > segs) {
        const [x0, y0] = pts[i - 1];
        const [x1, y1] = pts[i];
        const f = segs - (i - 1);
        shown.push([x0 + (x1 - x0) * f, y0 + (y1 - y0) * f]);
      } else shown.push(pts[i]);
    }
    haloLine(ctx, shown, color, p.bg, width, dashed ? [s * 0.55, s * 0.35] : []);
    if (progress < 1) {
      const head = shown[shown.length - 1];
      ctx.fillStyle = p.current;
      ctx.beginPath();
      ctx.arc(head[0], head[1], Math.max(2.5, s * 0.22), 0, Math.PI * 2);
      ctx.fill();
    }
  };

  if (snap.path.length) {
    let prog = 1;
    if (a.pathT) {
      prog = ease(Math.min(1, (now - a.pathT) / Math.min(1100, 260 + snap.path.length * 16)));
      if (prog < 1) animating = true;
    }
    draw(snap.path, snap.diffStatus ? p.a : p.path, prog, false);
  }
  if (snap.diffPath && snap.diffPath.length) draw(snap.diffPath, p.b, 1, true);
  return animating;
}

function paintCurrent({ ctx, snap, p, s, center }: Frame) {
  if (snap.current >= 0 && !snap.path.includes(snap.current)) {
    const [cx, cy] = center(snap.current);
    ctx.fillStyle = p.current;
    ctx.fillRect(cx - s / 2, cy - s / 2, s, s);
    if (s >= 8) {
      ctx.strokeStyle = p.current;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cx - s / 2 - 2.5, cy - s / 2 - 2.5, s + 5, s + 5);
    }
  }
  if (snap.diffCurrent >= 0) {
    const [bx, by] = center(snap.diffCurrent);
    ctx.strokeStyle = p.b;
    ctx.lineWidth = Math.max(2, s * 0.14);
    ctx.strokeRect(bx - s / 2 + 1, by - s / 2 + 1, s - 2, s - 2);
  }
}

function paintEndpoints({ ctx, v, snap, p, s, center }: Frame) {
  const found = snap.outcome === "found" && !v.editing && !v.hidden;
  const targetInk = found ? (snap.diffStatus ? p.a : p.path) : p.ink;
  if (s >= 16) {
    for (const [cell, letter, ink] of [
      [v.input.start, "S", p.ink],
      [v.input.target, "T", targetInk],
    ] as const) {
      const [cx, cy] = center(cell);
      ctx.fillStyle = ink;
      ctx.fillRect(cx - s / 2 + 1, cy - s / 2 + 1, s - 2, s - 2);
      ctx.fillStyle = p.field;
      ctx.font = canvasFont(s * 0.58, { weight: 700, mono: false });
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(letter, cx, cy + 1);
    }
    return;
  }
  const [sx, sy] = center(v.input.start);
  ctx.fillStyle = p.ink;
  ctx.beginPath();
  ctx.arc(sx, sy, Math.max(3, s * 0.34), 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = p.field;
  ctx.beginPath();
  ctx.arc(sx, sy, Math.max(1, s * 0.12), 0, Math.PI * 2);
  ctx.fill();

  const [tx, ty] = center(v.input.target);
  const tr = Math.max(3.5, s * 0.36);
  ctx.strokeStyle = targetInk;
  ctx.lineWidth = Math.max(1.5, s * 0.1);
  ctx.beginPath();
  ctx.arc(tx, ty, tr, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = targetInk;
  ctx.beginPath();
  ctx.arc(tx, ty, Math.max(1.2, s * 0.1), 0, Math.PI * 2);
  ctx.fill();
}

function paintFocus({ ctx, p, s, ox, oy, w }: Frame, focus: number) {
  const x = ox + (focus % w) * s;
  const y = oy + Math.floor(focus / w) * s;
  ctx.strokeStyle = p.focus;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, s - 2, s - 2);
}
