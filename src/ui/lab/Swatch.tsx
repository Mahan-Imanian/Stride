import { SHAPES, type Shape } from "./canvasKit";

export type SwatchKind =
  | "done"
  | "pending"
  | "current"
  | "path"
  | "path-a"
  | "path-b"
  | "run-a"
  | "run-b"
  | "both"
  | "wall"
  | "cost"
  | "plain"
  | "range"
  | "pivot"
  | "candidate"
  | "rejected"
  | "reference"
  | "tree-node"
  | "trail"
  | "found"
  | "current-line"
  | "unassigned"
  | "centroid"
  | "fit";

const v = (name: string, a = 1) => `rgb(var(--${name}) / ${a})`;

export function Swatch({ kind }: { kind: SwatchKind }) {
  const id = `sw-${kind}`;
  const body = (() => {
    switch (kind) {
      case "done":
      case "run-a":
      case "run-b": {
        const color = kind === "done" ? "enc-done" : kind === "run-a" ? "enc-a" : "enc-b";
        const flip = kind === "run-b";
        return (
          <>
            <rect
              x="0.5"
              y="0.5"
              width="13"
              height="13"
              fill={v(color, 0.12)}
              stroke={v("rule-strong")}
            />
            <path
              d={flip ? "M-1 4 9 14M3 0 15 12M-1 -1 1 1" : "M-1 10 9 0M3 14 15 2M13 15 15 13"}
              stroke={v(color)}
              strokeWidth="1.25"
            />
          </>
        );
      }
      case "both":
        return (
          <rect
            x="0.5"
            y="0.5"
            width="13"
            height="13"
            fill={v("ink", 0.16)}
            stroke={v("rule-strong")}
          />
        );
      case "pending":
        return (
          <rect
            x="2.5"
            y="2.5"
            width="9"
            height="9"
            fill="none"
            stroke={v("enc-heap")}
            strokeWidth="1.75"
          />
        );
      case "current":
        return <rect x="1" y="1" width="12" height="12" fill={v("enc-current")} />;
      case "trail":
        return <rect x="1" y="1" width="12" height="12" fill={v("enc-current", 0.3)} />;
      case "path":
      case "path-a":
        return (
          <path d="M0 7H14" stroke={v(kind === "path" ? "enc-path" : "enc-a")} strokeWidth="2.5" />
        );
      case "path-b":
        return <path d="M0 7H14" stroke={v("enc-b")} strokeWidth="2.5" strokeDasharray="4 2.5" />;
      case "reference":
        return <path d="M0 7H14" stroke={v("ink-2")} strokeWidth="1.25" strokeDasharray="3 2" />;
      case "candidate":
        return <path d="M0 7H14" stroke={v("enc-heap")} strokeWidth="2" strokeDasharray="4 2.5" />;
      case "rejected":
        return (
          <>
            <path d="M0 7H14" stroke={v("ink", 0.3)} strokeWidth="1.25" />
            <path d="M4.5 4.5 9.5 9.5M9.5 4.5 4.5 9.5" stroke={v("ink-3")} strokeWidth="1.5" />
          </>
        );
      case "wall":
        return (
          <rect
            x="0.5"
            y="0.5"
            width="13"
            height="13"
            fill={v("enc-wall")}
            stroke={v("enc-wall-edge")}
          />
        );
      case "cost":
        return (
          <>
            <rect
              x="0.5"
              y="0.5"
              width="13"
              height="13"
              fill={v("field")}
              stroke={v("rule-strong")}
            />
            {[3, 7, 11].flatMap((y, r) =>
              [3, 7, 11].map((x) => (
                <circle
                  key={`${x}-${y}`}
                  cx={x + (r % 2 ? 1 : 0)}
                  cy={y}
                  r="0.95"
                  fill={v("enc-cost")}
                />
              )),
            )}
          </>
        );
      case "plain":
        return <rect x="3" y="2" width="8" height="12" fill={v("ink", 0.34)} />;
      case "pivot":
      case "tree-node":
        return kind === "pivot" ? (
          <path d="M7 3 12 11H2Z" fill={v("ink")} />
        ) : (
          <circle cx="7" cy="7" r="5.5" fill={v("ink")} />
        );
      case "found":
        return <rect x="3" y="2" width="8" height="12" fill={v("enc-path")} stroke={v("ink")} />;
      case "current-line":
        return <path d="M0 7H14" stroke={v("enc-current")} strokeWidth="3" />;
      case "fit":
        return <path d="M0 11 14 3" stroke={v("ink")} strokeWidth="2" />;
      case "unassigned":
        return <circle cx="7" cy="7" r="3" fill={v("ink-3")} />;
      case "centroid":
        return (
          <>
            <circle cx="7" cy="7" r="5.75" fill={v("bg")} stroke={v("ink")} strokeWidth="1.5" />
            <circle cx="7" cy="7" r="2" fill={v("ink-2")} />
          </>
        );
      case "range":
        return (
          <rect
            x="0.5"
            y="0.5"
            width="13"
            height="13"
            fill={v("sunken")}
            stroke={v("rule-strong")}
          />
        );
    }
  })();
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      aria-hidden="true"
      className="shrink-0"
      data-swatch={id}
    >
      {body}
    </svg>
  );
}

const SVG_SHAPE: Record<Shape, string> = {
  circle: "M7 2.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 1 1 0-9Z",
  square: "M3 3h8v8H3Z",
  triangle: "M7 2 12 11H2Z",
  "triangle-down": "M7 12 12 3H2Z",
  diamond: "M7 1.5 12.5 7 7 12.5 1.5 7Z",
  plus: "M5.3 2h3.4v3.3H12v3.4H8.7V12H5.3V8.7H2V5.3h3.3Z",
  hexagon: "M7 1.8 11.6 4.4v5.2L7 12.2 2.4 9.6V4.4Z",
  star: "M7 1.2 8.6 5.2 12.9 5.4 9.6 8.1 10.7 12.3 7 9.9 3.3 12.3 4.4 8.1 1.1 5.4 5.4 5.2Z",
};

export function ClusterMark({ index }: { index: number }) {
  const shape = SHAPES[index % SHAPES.length];
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="shrink-0">
      <path d={SVG_SHAPE[shape]} fill={`rgb(var(--cat-${(index % 8) + 1}))`} />
    </svg>
  );
}
