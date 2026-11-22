import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { canvasFont, clusterShape, MIN_CANVAS_TEXT, SHAPES } from "../lab/canvasKit";
import { geometry } from "../lab/gridDraw";

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return name === "__tests__" ? [] : sources(full);
    return /\.(ts|tsx)$/.test(name) ? [full] : [];
  });
}

describe("canvas rendering rules", () => {
  it("never sets canvas text below the minimum size", () => {
    for (const size of [6, 9, 11, 12, 18]) {
      const px = Number(/ (\d+)px /.exec(canvasFont(size))![1]);
      expect(px).toBeGreaterThanOrEqual(MIN_CANVAS_TEXT);
    }
  });

  it("has no hard-coded canvas or SVG font size under 12px in the UI", () => {
    const offenders: string[] = [];
    for (const file of sources(path.resolve(__dirname, ".."))) {
      const text = readFileSync(file, "utf8");
      for (const m of text.matchAll(/(?:ctx\.font\s*=\s*['"`][^'"`]*?|text-\[)(\d+(?:\.\d+)?)px/g))
        if (Number(m[1]) < MIN_CANVAS_TEXT) offenders.push(`${path.basename(file)}: ${m[0]}`);
    }
    expect(offenders).toEqual([]);
  });

  it("places grid cells on whole device pixels", () => {
    for (const dpr of [1, 1.25, 1.5, 2, 2.5]) {
      const g = geometry(813, 517, 41, 25, dpr);
      expect(Number.isInteger(Math.round(g.s * dpr * 1e6) / 1e6)).toBe(true);
      expect(Number.isInteger(Math.round(g.ox * dpr * 1e6) / 1e6)).toBe(true);
      expect(Number.isInteger(Math.round(g.oy * dpr * 1e6) / 1e6)).toBe(true);
      expect(g.ox + g.s * 41).toBeLessThanOrEqual(813 + 1e-6);
    }
  });

  it("gives every cluster its own marker shape, in a fixed order", () => {
    expect(new Set(SHAPES).size).toBe(8);
    expect(Array.from({ length: 8 }, (_, i) => clusterShape(i))).toEqual([...SHAPES]);
    expect(clusterShape(8)).toBe(SHAPES[0]);
  });
});
