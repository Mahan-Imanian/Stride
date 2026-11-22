# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two primary users with equal weight; each surface picks its own priority.

- **Lecturers and TAs** who drive Stride live in a lecture hall, project it, assign its experiments as coursework and point students at a stable link. They judge it in seconds, against the dozen visualizers they have already seen, and they reject anything that reads as a student project.
- **Students** who open an assigned link or prepared experiment on a laptop, a phone or the Chrome side panel and work through it alone, scrubbing forward and back.

Pitch spans course levels: plain-language captions by default, with formal invariants, asymptotic bounds and notation one step away, so it serves CS1/CS2 and an upper-level algorithms course.

## Product Purpose

Stride records every operation of an algorithm run and plays it back beside the data structure the algorithm decides from (BFS queue, DFS stack, Dijkstra's min-heap with stale entries, A\*'s open set, quicksort's call stack, merge sort's buffer, Kruskal's union-find). Success is a professor putting it on a lecture slide, assigning an experiment, and citing or reproducing a figure from it.

## Positioning

The first claim a skeptical professor must believe is that they can use it in class: citable, exportable figures, stable links, presentation mode, prepared experiments ready for an assignment. Correctness and teaching the why follow close behind.

What a neighbouring visualizer cannot truthfully copy: full recorded traces with backward scrubbing; the structure the algorithm decides from shown beside every step; captions with real values tied to the pseudocode line; two runs aligned on one input with a numeric verdict; an engine tested against reference implementations; whole experiments encoded in a URL.

## Operating Context

- Lecture halls with projectors, often washed out by room light; driven by keyboard, clicker or a laptop trackpad mid-lecture.
- Coursework: a lecturer shares a link or a prepared experiment; students open it on laptops, phones (share links) and the Chrome side panel (about 320 to 500px wide).
- Slides, problem sets and papers, which need figures exported from a run.
- Static hosting on GitHub Pages under `/Stride/`; a Manifest V3 Chrome extension with the `sidePanel` permission only, Chrome 116+.

## Capabilities and Constraints

- 18 algorithms in 5 families (pathfinding, sorting, searching, spanning trees, learning); 14 prepared experiments, each framed as a question.
- Compare panel, presentation mode (P), share links (URL-encoded, format version 3), JSON export, saved experiments in local storage, command palette, keyboard shortcuts.
- Stack is fixed: TypeScript, React, Vite, Tailwind, Vitest, ESLint, Prettier. No backend, server, database or API keys. No analytics or telemetry.
- `src/core/` stays free of React and the DOM. Canvas draws the structures every animation frame; React draws text panels at up to 20 Hz.
- No new heavy dependencies (charting, component or animation libraries) without explicit approval.
- Input sizes are capped (61×37 grids, 64 values, 400 points) so recording stays fast.
- Known gaps: no BST, hash table, Bellman-Ford or topological sort; frame times measured only in headless Chrome.

## Brand Commitments

- Name: Stride. MIT licence and attribution (© Mahan Imanian) stay intact.
- Existing algorithm and experiment copy is kept; new copy is marked as placeholder for approval.
- No off-the-shelf design language (Material, Astryx or similar) as the visual identity.

## Evidence on Hand

- The engine figures in the README are recomputed by `src/core/__tests__/readme.test.ts` (path costs, expansion counts, inertia).
- Algorithms are tested against reference implementations; share links round-trip for every prepared experiment.
- No user testimonials, adoption figures or course deployments exist. Do not invent them.

## Product Principles

1. Usable in class first: every surface answers "can I put this in front of students tomorrow?"
2. Show the decision, not just the state: the structure and invariant the algorithm reads from sit beside every step.
3. Honest about limits: what a comparison proves from one input, and what the tool does not cover, are stated where a skeptical reader will look.
4. Reproducible by default: every view is a stable link, and every figure can be exported and cited.
5. One visual language across all five families and all structure views.

## Accessibility & Inclusion

WCAG 2.2 AA minimum, verified in both themes and inside the canvas. Full keyboard operation; text equivalents for canvas content (live step announcements, an accessible structure description, a navigable textual view of the run). Colour-blind-safe encodings (shape or pattern as well as hue), checked for deuteranopia, protanopia and tritanopia. `prefers-reduced-motion` honoured in canvas and DOM. Legible when projected in a bright room.
