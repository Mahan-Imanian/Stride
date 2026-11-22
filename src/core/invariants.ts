import type { AlgoId } from "./info";

export const INVARIANTS_APPROVED = false;

export const INVARIANTS: Record<AlgoId, string> = {
  bfs: "Cells leave the queue in order of their distance in moves, so the first time the target leaves it, no path has fewer moves.",
  dfs: "The stack holds the untried branches of the current route. DFS finds a path, not necessarily the shortest one.",
  dijkstra:
    "Every settled cell's distance is final. The heap holds the frontier, ordered by tentative distance.",
  astar:
    "With weight 1 and a heuristic that never overestimates, the first time the target leaves the open set its path is the cheapest.",
  greedy:
    "Cells leave the queue by estimated distance to the target alone, so nothing guarantees the path found is the cheapest.",
  insertion: "Before step i, the first i values are sorted among themselves.",
  selection: "After pass i, the first i values are the i smallest, each in its final position.",
  bubble: "After pass i, the last i values are the i largest, each in its final position.",
  quick:
    "After a partition, every value left of the pivot is smaller and every value right of it is at least as large, so the pivot is final.",
  merge:
    "Both halves are sorted before they are merged, and merging two sorted runs keeps the result sorted.",
  heap: "Before the boundary, every parent is at least as large as its children. After the boundary, every value is sorted and final.",
  linear: "Every index before the probe has been checked and does not hold the target.",
  binary: "If the target is present, it lies between lo and hi.",
  jump: "If the target is present, it lies in the block after the last jump that landed on a smaller value.",
  prim: "The chosen edges form one tree, and each new edge is the lightest one leaving it, so the tree is part of a minimum spanning tree.",
  kruskal:
    "The chosen edges never close a cycle, and each is the lightest edge joining two different fragments.",
  kmeans: "Neither the assignment step nor the update step ever increases the inertia.",
  gradient:
    "Each step moves the parameters against the gradient. With a small enough learning rate, the loss never increases.",
};
