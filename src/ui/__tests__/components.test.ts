import { describe, expect, it } from "vitest";
import { defaultExperiment, runVariant } from "@/core/experiment";
import { ALGOS } from "@/core/info";
import { INVARIANTS } from "@/core/invariants";
import { getScenario } from "@/core/scenarios";
import { nextMilestone, phases } from "../lab/milestones";
import { shortcutFor } from "../shortcuts";

describe("phase rail", () => {
  it("covers the whole run without gaps and ends on the last checkpoint", () => {
    for (const id of ["astar-vs-dijkstra", "mst", "kmeans-init", "binary-search"]) {
      const run = runVariant(getScenario(id)!.build(false), "a")!;
      const total = run.trace.events.length;
      const segs = phases(run, total);
      expect(segs[0].start).toBe(0);
      expect(segs[segs.length - 1].end).toBe(total);
      for (let i = 1; i < segs.length; i++) expect(segs[i].start).toBe(segs[i - 1].end);
      expect(segs.every((s) => s.end > s.start)).toBe(true);
    }
  });

  it("names the next milestone after a position, and none at the end", () => {
    const run = runVariant(defaultExperiment("bfs"), "a")!;
    const first = run.trace.checkpoints.find((c) => c.at > 0)!;
    expect(nextMilestone(run, 0)).toBe(first.label);
    expect(nextMilestone(run, run.trace.events.length)).toBeNull();
  });
});

describe("invariants", () => {
  it("has one for every algorithm", () => {
    for (const a of ALGOS) expect(INVARIANTS[a.id], a.id).toMatch(/\w.{20,}/);
  });
});

describe("view shortcuts", () => {
  it("maps E to the explanation and I to the side panel in the lab", () => {
    const key = (k: string) => new KeyboardEvent("keydown", { key: k });
    expect(shortcutFor(key("e"), { inLab: true, singleKey: true, present: false })).toBe(
      "panel:explain",
    );
    expect(shortcutFor(key("i"), { inLab: true, singleKey: true, present: false })).toBe("side");
    expect(shortcutFor(key("i"), { inLab: false, singleKey: true, present: false })).toBeNull();
  });
});

describe("hide-the-answer shortcut", () => {
  it("maps A to the answers toggle in the lab, and nowhere else", () => {
    const e = new KeyboardEvent("keydown", { key: "a" });
    expect(shortcutFor(e, { inLab: true, singleKey: true, present: false })).toBe("answers");
    expect(shortcutFor(e, { inLab: false, singleKey: true, present: false })).toBeNull();
    expect(shortcutFor(e, { inLab: true, singleKey: false, present: false })).toBeNull();
  });
});
