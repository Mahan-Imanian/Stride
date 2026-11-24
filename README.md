# Stride

An algorithm lab for lectures and self-study. Stride records every operation of a run and plays it back next to the data structure the algorithm reads from, such as the BFS queue, Dijkstra's heap or quicksort's call stack. Each step has a caption with the actual values, and two algorithms can run on the same input so their counts compare directly.

**[Open the lab](https://mahan-imanian.github.io/Stride/)** · [Quick start](#quick-start) · [Algorithms](#algorithms) · [How it works](#how-it-works) · [Internals](docs/internals.md)

<a href="https://mahan-imanian.github.io/Stride/"><img alt="Five Stride experiments on the blackboard theme. The largest: Dijkstra and A* on one grid, both finding a path of cost 46, with Dijkstra expanding 658 cells and A* 295. Beside it, BFS flooding a maze, quicksort on sorted input with a last-element pivot (496 comparisons against 103 with median-of-3), Prim building a spanning tree (both trees weigh 307), and k-means started from a corner (inertia 7.718 against 1.657 for k-means++). Each is titled with its question." src=".github/assets/hero.jpg" width="100%"></a>

## What you can do

### Start from a question

Explore lists 14 prepared experiments, grouped by family, each titled with its question, such as _Why does breadth-first search always find the fewest moves?_ or _On nearly sorted data, can a quadratic sort beat merge sort?_ Opening one builds the input and records the run. In the lab the question stays at the top, and the result appears under it when the run ends. Change a wall, the pivot rule, the heuristic or the learning rate and the run is recorded again.

<img alt="The Explore page on the blackboard theme: the intro beside a finished A* versus Dijkstra board, then the experiments grouped by family, each titled with its question" src=".github/assets/f-explore.png" width="100%">

### Compare two algorithms on the same input

Run two algorithms, or two settings of one, on the same grid. Both expansions share one board: run A hatches one way, run B the other, and cells both expanded are a flat tint. The Compare tab gives the verdict in plain numbers ("both find a path of cost 46; A\* expands 55% fewer cells") and points to the first cell where the two orders diverge.

<img alt="A* vs Dijkstra at the last step on the whiteboard theme: Result, both find a path of cost 46, Dijkstra expanded 658 cells and A* 295, with A*'s dashed path across the board" src=".github/assets/f-compare.png" width="100%">

### See the structure the algorithm is deciding from

The BFS queue, DFS stack, Dijkstra's min-heap (stale entries included), A\*'s open set with g, h and f, quicksort's call stack, merge sort's buffer and Kruskal's union-find fragments sit beside the board. Each caption uses real values, for example "a cheaper route to (17, 18) through (17, 17): g 21 → 19", and the pseudocode line moves with it.

<img alt="Quicksort's worst case 9 steps in: last-element pivot against median-of-three, pivot 74 landing at index 23 in both, lo, i and hi pointers under the bars, and a call stack nine calls deep" src=".github/assets/f-quicksort.png" width="100%">

<img alt="Prim and Kruskal 14 steps in: Prim's candidate edges dashed around its tree, Kruskal joining two fragments with edge 0–18, and Prim's candidate heap with stale edges struck through" src=".github/assets/f-kruskal.png" width="100%">

In _Bad starting centroids_, k-means++ settles at inertia 1.657 after 2 iterations, while centroids started in a corner settle at 7.718 after 4. Each cluster has its own colour and marker shape, so the board still reads in greyscale.

<img alt="k-means++ and corner-started k-means side by side on four blobs: regions of the nearest centroid, circle, square, triangle and diamond markers, and the result line 1.657 against 7.718" src=".github/assets/f-kmeans.png" width="100%">

### Teach with it

- **Readable from the back of the room.** A charcoal blackboard theme and a whiteboard light theme, set in Atkinson Hyperlegible. State on the board is shown by pattern as well as colour (hatching for settled, an outline for waiting, a ringed solid for the current cell, a haloed line for the result), so it holds up on a washed-out projector and for colour-blind students.
- **Phase rail.** Marks under the scrubber show where a run reaches a milestone, such as the target being discovered, and the status line names the next one.
- **Hide the answers.** <kbd>A</kbd> hides the captions and the result so the class can predict the next step, then reveal it. The counts in the run strip stay visible for now.
- **Edit the board while you teach.** A toolbar above the board draws walls and mud, erases, moves the start and target, clears the grid or makes a new layout (keys 1 to 5 for the tools). Graphs get Move, Edge, Node and Delete. It stays available in presentation mode.
- **Make the board bigger.** Panels minimize, collapse to icons or close from their own controls, and the Window menu brings them back. Three workspaces are one click away: Essentials, Lecture (explanation minimized, side panel as icons) and Board only, which makes the board about half again as tall. Stride remembers the arrangement, and the board keeps its size and position while a run plays.
- **Presentation mode.** The Present button or <kbd>P</kbd> goes full screen with large type and toggles for code, state, explanation and metrics.
- **Share links.** Input, seed, settings, the experiment and optionally the current step are encoded in the URL, and JSON export uses the same format.

<img alt="The Lecture workspace: the drawing toolbar above a large BFS board, the explanation minimized to a one-line bar with expand and close controls, the side panel collapsed to a strip of icons, and the Window menu in the header" src=".github/assets/f-focus.png" width="100%">

<img alt="Answers hidden at the end of A* vs Dijkstra: the captions are replaced by Predict the next step, then reveal it, and a Reveal button" src=".github/assets/f-hidden.png" width="100%">

<img alt="Presentation mode: BFS in a maze with the queue, pseudocode and caption in large type" src=".github/assets/f-present.png" width="100%">

The invariant lines under each caption and the prompt "Predict the next step, then reveal it." are draft text, shown with a dotted underline in the app until they are reviewed.

## Quick start

Open the [hosted lab](https://mahan-imanian.github.io/Stride/), or run it locally with Node 20 or newer:

```bash
git clone https://github.com/Mahan-Imanian/Stride.git
cd Stride
npm install
npm run dev
```

Then open http://localhost:5173/Stride/.

## Algorithms

| Family         | Algorithms                                                                                                                                               | What you see                                                          |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Pathfinding    | BFS, DFS, Dijkstra (binary heap, lazy deletion), A\* (Manhattan, Euclidean, octile or zero heuristic, weight 1–5), greedy best-first; diagonals optional | Queue, stack or heap with priorities; frontier, expansion order, path |
| Sorting        | Insertion, selection, bubble (early exit), quicksort (last, median-of-three or seeded random pivot), merge, heap                                         | Pointers, active range, call stack, merge buffer, heap boundary       |
| Searching      | Linear, binary, jump                                                                                                                                     | lo / hi / probe, candidates left, probes against a linear scan        |
| Spanning trees | Prim, Kruskal (union-find)                                                                                                                               | Candidate heap or sorted edges, fragments, rejected edges             |
| Learning       | k-means (k-means++, random, deliberately bad or hand-placed centroids), gradient descent on linear regression (learning rate, momentum, start)           | Voronoi regions and inertia; loss surface, descent path, gradient     |

Each algorithm has an About panel with complexity, guarantees, the state it keeps, common mistakes and when to use it.

## How it works

Each run is recorded in full before it is played. Each algorithm (`runGrid`, `runSort` and so on in `src/core/`) writes a typed event trace through a `TraceBuilder`, and every event names the pseudocode line it belongs to. A `Player` folds those events into state with the family's machine and caches keyframes, so the scrubber can jump to any step without replaying from the start.

```mermaid
flowchart LR
  A["Algorithm run (src/core)"] --> T[Typed event trace]
  T --> P["Player: machine + keyframes"]
  S["Transport: scrub, step, play"] -->|cursor| P
  P --> C["Canvases, every animation frame"]
  P --> X["Code, state and caption panels, up to 20 Hz"]
```

`src/core/` has no React and no DOM. Canvases draw from the live cursor in `requestAnimationFrame`; text panels follow a cursor throttled to 20 Hz during playback, so React never renders per frame. Source layout, rendering details, how the figures in this README were measured, the tuning constants, the keyboard map and how to add an algorithm are in [docs/internals.md](docs/internals.md).

### Design decisions

- **Record first, then play back.** Each run is computed to completion before playback starts, which is what makes backward scrubbing, jumping to any step, aligning two runs on one timeline and testing every event possible. The cost is that input size is capped (61×37 grids, 64 values to sort, 400 points) so that recording stays fast, every input edit records the run again, and each family needs a state machine that replays its events next to the algorithm itself.
- **A core without React or the DOM.** Algorithms, traces, the player, scenarios and the share format live in `src/core/`. Tests run them in Node, and the image and performance scripts bundle them with esbuild. The price is a translation layer (`explain.ts`, the state panels) between events and what the UI shows.
- **Canvas for the visualization, React for text, panels at 20 Hz.** A 61×37 grid has 2,257 cells, and a comparison shows two of them. Drawing them on a canvas usually takes a few milliseconds per frame ([measurements](docs/internals.md#measurements)); re-rendering the React stage on every cursor change was the main cause of dropped frames in 3.0.0. Text panels are capped at 20 updates a second during playback, since text changing faster than that cannot be read anyway, so they can lag the canvas by up to 50 ms while playing and catch up as soon as playback pauses. 20 Hz is a round figure, not a tuned one. Canvas content is invisible to screen readers, so the grid has its own keyboard cursor and live region, and the other views rely on the caption and state panels.
- **No backend.** The site is static on GitHub Pages and the extension is the same bundle. A share link carries the whole experiment (base64 JSON with run-length-encoded grid cells), so sharing needs no server or account. The trade-offs are long links (a 61×37 maze encodes to about 5 KB), saved experiments that stay in one browser, no way to revoke a link once sent, and no usage data. Links stay valid only as long as format version 3 is decoded the same way; `src/core/__tests__/share.test.ts` round-trips every prepared experiment and checks minimal, hand-edited and malformed links.

## Chrome extension

The same app also builds as a Manifest V3 extension (Chrome 116 or newer):

```bash
npm run build:ext
```

Open `chrome://extensions`, turn on Developer mode, choose **Load unpacked** and select `dist-extension/`. The toolbar button opens the lab in a tab, and it is also available in Chrome's side panel.

| Permission  | Why                                                                |
| ----------- | ------------------------------------------------------------------ |
| `sidePanel` | Registers the lab as a side panel page. Nothing else is requested. |

No content scripts, no host permissions and a strict CSP (`script-src 'self'`). The app contacts no hosts: fonts are bundled, and saved experiments and settings stay in the browser's local storage.

## Development

| Command              | What it does                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------ |
| `npm test`           | Vitest: algorithms against reference implementations, player, share links, contrast, UI journeys |
| `npm run lint`       | ESLint                                                                                           |
| `npm run typecheck`  | `tsc --noEmit`                                                                                   |
| `npm run build`      | Type-checks and builds the GitHub Pages site into `dist/`                                        |
| `npm run build:ext`  | Builds the extension into `dist-extension/`                                                      |
| `npm run images`     | Regenerates the icons and `og.png` from real engine output                                       |
| `npm run bench`      | Times recording a run and seeking, for the largest input of each family                          |
| `npm run perf`       | Plays every algorithm in headless Chrome and reports frame times (needs `CHROME_PATH`)           |
| `npm run lighthouse` | Runs Lighthouse 12.8.2 on Explore and the Lab, mobile and desktop                                |

CI runs lint, typecheck, tests and both builds on every push and pull request to `main`. Pushing to `main` also deploys `dist/` to GitHub Pages. The engine figures quoted above (path costs, expansion counts, inertia, the number of algorithms and experiments) are recomputed by `src/core/__tests__/readme.test.ts`. `bench`, `perf` and `lighthouse` are not part of CI; [docs/internals.md](docs/internals.md#measurements) explains how to run them and lists the last results with their environment.

## Limits

- Accessibility has been checked with Lighthouse (`npm run lighthouse`) and a token contrast test, not with a screen reader. Nobody has used the app with NVDA or VoiceOver yet.
- Frame times have only been measured in headless Chrome, which paces frames at 60 Hz. Nothing has been measured on a 120 or 144 Hz display or on a phone.
- On Lighthouse's simulated mobile connection, first paint waits for the 154 KB (gzip) main bundle, so the mobile performance score is lower than desktop.
- The UI tests run in jsdom. There are no browser end-to-end tests in CI.
- No data-structure family (BST, hash table) and no Bellman-Ford or topological sort yet.
- The lecture redesign is in progress. Responsive layout, motion, a screen-reader pass and the planned classroom tools (blank board, clicker support, presenter view, pointer, pen, zoom, QR follow-along, offline use) are not done yet.

See the [changelog](CHANGELOG.md) for what changed between versions.

## License

[MIT](LICENSE) © Mahan Imanian
