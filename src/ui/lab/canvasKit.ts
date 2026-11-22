export const MIN_CANVAS_TEXT = 12;

export function canvasFont(size: number, opts: { weight?: number; mono?: boolean } = {}) {
  const px = Math.max(MIN_CANVAS_TEXT, Math.round(size));
  const family =
    opts.mono === false ? '"Atkinson Hyperlegible Next"' : '"Atkinson Hyperlegible Mono"';
  return `${opts.weight ?? 500} ${px}px ${family}, ui-monospace, monospace`;
}

export function deviceRatio(): number {
  return typeof window === "undefined" ? 1 : Math.min(2.5, window.devicePixelRatio || 1);
}

export function ctxRatio(ctx: CanvasRenderingContext2D): number {
  const t = ctx.getTransform();
  return t.a || 1;
}

export const snapPx = (v: number, dpr: number) => Math.round(v * dpr) / dpr;

export const crisp = (v: number, dpr: number) => (Math.round(v * dpr) + 0.5) / dpr;

type Dir = 1 | -1;

const patternCache = new WeakMap<CanvasRenderingContext2D, Map<string, CanvasPattern | null>>();

export function hatch(
  ctx: CanvasRenderingContext2D,
  color: string,
  dir: Dir,
  spacing = 5,
  width = 1.25,
): CanvasPattern | null {
  const dpr = ctxRatio(ctx);
  const key = `${color}|${dir}|${spacing}|${width}|${dpr}`;
  let byCtx = patternCache.get(ctx);
  if (!byCtx) {
    byCtx = new Map();
    patternCache.set(ctx, byCtx);
  }
  if (byCtx.has(key)) return byCtx.get(key)!;
  const n = Math.max(3, Math.round(spacing * dpr));
  const tile = document.createElement("canvas");
  tile.width = n;
  tile.height = n;
  const t = tile.getContext("2d");
  let pattern: CanvasPattern | null = null;
  if (t) {
    t.strokeStyle = color;
    t.lineWidth = Math.max(1, Math.round(width * dpr));
    t.lineCap = "square";
    t.beginPath();
    if (dir === 1) {
      t.moveTo(-n, 2 * n);
      t.lineTo(2 * n, -n);
      t.moveTo(-n, n);
      t.lineTo(n, -n);
      t.moveTo(0, 2 * n);
      t.lineTo(2 * n, 0);
    } else {
      t.moveTo(-n, -n);
      t.lineTo(2 * n, 2 * n);
      t.moveTo(-n, 0);
      t.lineTo(n, 2 * n);
      t.moveTo(0, -n);
      t.lineTo(2 * n, n);
    }
    t.stroke();
    pattern = ctx.createPattern(tile, "repeat");
    pattern?.setTransform(new DOMMatrix().scale(1 / dpr));
  }
  byCtx.set(key, pattern);
  return pattern;
}

export function stipple(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  spacing: number,
  color: string,
) {
  const r = Math.max(0.6, Math.min(0.95, spacing * 0.14));
  ctx.fillStyle = color;
  ctx.beginPath();
  const row0 = Math.ceil((y - spacing / 2) / spacing);
  for (let row = row0; row * spacing + spacing / 2 < y + h; row++) {
    const py = row * spacing + spacing / 2;
    const shift = row % 2 ? spacing / 2 : 0;
    const col0 = Math.ceil((x - shift - spacing / 2) / spacing);
    for (let col = col0; col * spacing + shift + spacing / 2 < x + w; col++) {
      const px = col * spacing + shift + spacing / 2;
      ctx.moveTo(px + r, py);
      ctx.arc(px, py, r, 0, Math.PI * 2);
    }
  }
  ctx.fill();
}

export function haloLine(
  ctx: CanvasRenderingContext2D,
  pts: [number, number][],
  color: string,
  halo: string,
  width: number,
  dash: number[] = [],
) {
  if (pts.length < 2) return;
  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  const trace = () => {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  };
  ctx.strokeStyle = halo;
  ctx.lineWidth = width + Math.max(3, width * 0.9);
  trace();
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  trace();
  ctx.stroke();
  ctx.restore();
}

export function badge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  fill: string,
  ink: string,
  halo: string,
) {
  ctx.save();
  ctx.font = canvasFont(12, { weight: 700 });
  const w = Math.max(18, ctx.measureText(text).width + 8);
  const h = 18;
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.roundRect(x - w / 2 - 1.5, y - h / 2 - 1.5, w + 3, h + 3, 10);
  ctx.fill();
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x - w / 2, y - h / 2, w, h, 9);
  ctx.fill();
  ctx.fillStyle = ink;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y + 0.5);
  ctx.restore();
}

export const SHAPES = [
  "circle",
  "square",
  "triangle",
  "diamond",
  "triangle-down",
  "plus",
  "hexagon",
  "star",
] as const;
export type Shape = (typeof SHAPES)[number];

export function shapePath(shape: Shape, x: number, y: number, r: number): Path2D {
  const p = new Path2D();
  const poly = (pts: [number, number][]) => {
    p.moveTo(x + pts[0][0], y + pts[0][1]);
    for (let i = 1; i < pts.length; i++) p.lineTo(x + pts[i][0], y + pts[i][1]);
    p.closePath();
  };
  switch (shape) {
    case "circle":
      p.arc(x, y, r, 0, Math.PI * 2);
      break;
    case "square":
      p.rect(x - r * 0.88, y - r * 0.88, r * 1.76, r * 1.76);
      break;
    case "triangle":
      poly([
        [0, -r * 1.15],
        [r * 1.05, r * 0.75],
        [-r * 1.05, r * 0.75],
      ]);
      break;
    case "triangle-down":
      poly([
        [0, r * 1.15],
        [r * 1.05, -r * 0.75],
        [-r * 1.05, -r * 0.75],
      ]);
      break;
    case "diamond":
      poly([
        [0, -r * 1.2],
        [r * 1.2, 0],
        [0, r * 1.2],
        [-r * 1.2, 0],
      ]);
      break;
    case "plus": {
      const a = r * 1.15;
      const b = r * 0.42;
      poly([
        [-b, -a],
        [b, -a],
        [b, -b],
        [a, -b],
        [a, b],
        [b, b],
        [b, a],
        [-b, a],
        [-b, b],
        [-a, b],
        [-a, -b],
        [-b, -b],
      ]);
      break;
    }
    case "hexagon":
      poly(
        Array.from({ length: 6 }, (_, i) => {
          const t = (Math.PI / 3) * i + Math.PI / 6;
          return [Math.cos(t) * r * 1.08, Math.sin(t) * r * 1.08] as [number, number];
        }),
      );
      break;
    case "star":
      poly(
        Array.from({ length: 10 }, (_, i) => {
          const t = (Math.PI / 5) * i - Math.PI / 2;
          const rr = i % 2 ? r * 0.55 : r * 1.3;
          return [Math.cos(t) * rr, Math.sin(t) * rr] as [number, number];
        }),
      );
      break;
  }
  return p;
}

export const clusterShape = (i: number): Shape => SHAPES[i % SHAPES.length];
