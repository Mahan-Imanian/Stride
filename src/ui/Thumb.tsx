import { useEffect, useRef, useState } from "react";
import { runVariant, type Experiment } from "@/core/experiment";
import { CLOSED } from "@/core/grid/machine";
import { EDGE_TREE } from "@/core/graph/graph";
import { setupCanvas, usePalette, type Palette } from "./hooks";
import { clusterShape, haloLine, hatch, shapePath, stipple } from "./lab/canvasKit";

export function Thumb({
  build,
  className,
  label,
}: {
  build: () => Experiment;
  className?: string;
  label: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const p = usePalette();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (es) => es.some((e) => e.isIntersecting) && setVisible(true),
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!visible || !ref.current) return;
    const el = ref.current;
    const id = window.setTimeout(() => {
      const r = el.getBoundingClientRect();
      const ctx = setupCanvas(el, r.width, r.height);
      if (ctx) drawThumb(ctx, r.width, r.height, build(), p);
    }, 0);
    return () => window.clearTimeout(id);
  }, [visible, p, build]);
  return <canvas ref={ref} className={className} role="img" aria-label={label} />;
}

function drawThumb(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  exp: Experiment,
  p: Palette,
) {
  ctx.fillStyle = p.field;
  ctx.fillRect(0, 0, W, H);
  const run = runVariant(exp, "a")!;
  const end = run.trace.events.length;
  if (run.family === "grid") {
    const g = run.input;
    const s = Math.min(W / g.w, H / g.h);
    const ox = (W - s * g.w) / 2;
    const oy = (H - s * g.h) / 2;
    const st = run.player.at(end).state;
    const other = exp.b ? runVariant(exp, "b") : null;
    const os =
      other && other.family === "grid" ? other.player.at(other.trace.events.length).state : null;
    const doneHatch = hatch(ctx, p.closed, 1, 4, 1);
    const aHatch = hatch(ctx, p.a, 1, 4, 1);
    const bHatch = hatch(ctx, p.b, -1, 4, 1);
    for (let i = 0; i < g.w * g.h; i++) {
      const x = ox + (i % g.w) * s;
      const y = oy + Math.floor(i / g.w) * s;
      const a = st.status[i] === CLOSED;
      const b = os ? os.status[i] === CLOSED : false;
      if (g.cells[i] === 0) {
        ctx.fillStyle = p.wall;
        ctx.fillRect(x, y, s + 0.4, s + 0.4);
        continue;
      }
      ctx.fillStyle = p.field;
      ctx.fillRect(x, y, s + 0.4, s + 0.4);
      if (g.cells[i] > 1) stipple(ctx, x, y, s, s, Math.max(2.2, s / 2), p.weight);
      let pat: CanvasPattern | null = null;
      if (os && a && b) {
        ctx.fillStyle = p.rgb("ink", 0.16);
        ctx.fillRect(x, y, s + 0.4, s + 0.4);
      } else if (os ? a || b : a) pat = os ? (a ? aHatch : bHatch) : doneHatch;
      if (pat) {
        ctx.fillStyle = pat;
        ctx.fillRect(x, y, s + 0.4, s + 0.4);
      } else if (!os && st.status[i]) {
        ctx.strokeStyle = p.open;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + s * 0.2, y + s * 0.2, s * 0.6, s * 0.6);
      }
    }
    const line = (path: number[], color: string, dash = false) => {
      const pts = path.map(
        (c) =>
          [ox + (c % g.w) * s + s / 2, oy + Math.floor(c / g.w) * s + s / 2] as [number, number],
      );
      haloLine(ctx, pts, color, p.bg, Math.max(1.5, s * 0.35), dash ? [s, s * 0.6] : []);
    };
    line(st.path, os ? p.a : p.path);
    if (os) line(os.path, p.b, true);
  } else if (run.family === "sort") {
    const vals = run.input.values;
    const max = Math.max(...vals);
    const slot = W / vals.length;
    vals.forEach((v, i) => {
      const h = (v / max) * (H - 12);
      ctx.fillStyle = p.rgb("ink", 0.55);
      ctx.fillRect(i * slot + slot * 0.15, H - h - 4, slot * 0.7, h);
    });
  } else if (run.family === "search") {
    const vals = run.input.values;
    const max = Math.max(...vals);
    const slot = W / vals.length;
    const st = run.player.at(end).state;
    vals.forEach((v, i) => {
      const h = (v / max) * (H - 12);
      ctx.fillStyle =
        i === st.found ? p.path : st.probed[i] ? p.rgb("ink", 0.7) : p.rgb("ink", 0.2);
      ctx.fillRect(i * slot + slot * 0.15, H - h - 4, Math.max(1, slot * 0.7), h);
    });
  } else if (run.family === "graph") {
    const { nodes, edges } = run.input;
    const st = run.player.at(end).state;
    const X = (x: number) => 10 + x * (W - 20);
    const Y = (y: number) => 10 + y * (H - 20);
    edges.forEach(([a, b], i) => {
      ctx.strokeStyle = st.edgeState[i] === EDGE_TREE ? p.path : p.rgb("ink", 0.2);
      ctx.lineWidth = st.edgeState[i] === EDGE_TREE ? 2.5 : 1;
      ctx.beginPath();
      ctx.moveTo(X(nodes[a].x), Y(nodes[a].y));
      ctx.lineTo(X(nodes[b].x), Y(nodes[b].y));
      ctx.stroke();
    });
    ctx.fillStyle = p.ink;
    nodes.forEach((n) => {
      ctx.beginPath();
      ctx.arc(X(n.x), Y(n.y), 3, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (run.family === "kmeans") {
    const st = run.player.at(end).state;
    const side = Math.min(W, H) - 12;
    const ox = (W - side) / 2;
    const oy = (H - side) / 2;
    run.input.points.forEach((q, i) => {
      const a = st.assign ? st.assign[i] : -1;
      ctx.fillStyle = a >= 0 ? p.cat[a % 8] : p.ink3;
      ctx.fill(
        shapePath(a >= 0 ? clusterShape(a) : "circle", ox + q.x * side, oy + (1 - q.y) * side, 2.2),
      );
    });
  } else {
    const st = run.player.at(end).state;
    const side = Math.min(W, H) - 12;
    const ox = (W - side) / 2;
    const oy = (H - side) / 2;
    ctx.fillStyle = p.ink2;
    run.input.points.forEach((q) => {
      ctx.beginPath();
      ctx.arc(ox + q.x * side, oy + (1 - q.y) * side, 1.8, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.save();
    ctx.beginPath();
    ctx.rect(ox, oy, side, side);
    ctx.clip();
    ctx.strokeStyle = st.phase === "diverged" ? p.current : p.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ox, oy + (1 - st.b) * side);
    ctx.lineTo(ox + side, oy + (1 - (st.m + st.b)) * side);
    ctx.stroke();
    ctx.restore();
  }
}
