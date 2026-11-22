# Stride design system

The system of record for how Stride looks, moves and reads. Code and this file change in the same commit; when they disagree, the code is wrong until this file is updated on purpose.

Each section states the user intent, the rules, and how the rule is verified. Rules marked **must** are enforced by a test or a script; the rest are reviewed by eye at the gates.

Status: **foundations, canvas, components and views** (tokens, type, encoding grammar, motion tokens, canvas rendering for all five families, the component layer, the Lab, Explore and Saved compositions). Responsive layout, motion, accessibility, presentation mode, export and repo presentation are added gate by gate.

## World

Stride is the lecture hall's board. Dark theme is a charcoal slate blackboard with bright chalk, light theme is a whiteboard with vivid markers. (Chosen on 22 November 2026 over three other board palettes, a muted greenboard, a saturated schoolroom green and a midnight navy, because its chalk colours separate hardest on a projector.) The board is the grid, the next board holds the structure the algorithm decides from, and the narration is written along the bottom. The world lends four things only: palette, type, density and one signature move (the board-work trail). It never lends texture, handwriting, chalk-dust images or skeuomorphic frames; navigation and controls stay ordinary web controls.

Light or dark is picked by scene, not taste: a projector in a lit lecture hall reads light chalk on a dark board best, so dark is the presentation default; a student at a laptop in daylight reads the whiteboard.

## Colour

Tokens live in `src/index.css` as RGB channels, under `:root, [data-theme="light"]` and `[data-theme="dark"]`. Tailwind exposes them in `tailwind.config.ts`. Canvas code reads the same tokens through `usePalette()` in `src/ui/hooks.ts`; no component or paint function may contain a literal colour.

### Surfaces and ink

| Token                          | Light (whiteboard)                            | Dark (charcoal slate)                   | Role                                                                                                            |
| ------------------------------ | --------------------------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `bg`                           | `246 246 244`                                 | `26 30 36`                              | The board: page ground                                                                                          |
| `surface`                      | `255 255 255`                                 | `30 35 42`                              | Raised panels, menus, dialogs                                                                                   |
| `field`                        | `255 255 255`                                 | `30 35 42`                              | Inputs and the open cell on a canvas                                                                            |
| `sunken`                       | `236 236 233`                                 | `20 23 28`                              | Wells, hover fills, the transport track                                                                         |
| `rule`                         | `216 217 214`                                 | `52 57 64`                              | Hairlines between regions                                                                                       |
| `rule-strong`                  | `128 133 140`                                 | `120 127 137`                           | Input borders, separators that must be seen                                                                     |
| `ink`                          | `23 25 28`                                    | `241 242 244`                           | Primary text: marker black, chalk white                                                                         |
| `ink-2`                        | `64 69 76`                                    | `196 201 209`                           | Secondary text                                                                                                  |
| `ink-3`                        | `91 97 106`                                   | `154 161 171`                           | Muted text, still 4.5:1 on every surface                                                                        |
| `action` / `on-action`         | ink / white                                   | chalk / board                           | The one primary button per view: filled with ink                                                                |
| `hot` / `hot-ink` / `hot-soft` | marker orange `224 112 0` / `160 78 0` / tint | canary chalk `255 210 63` / same / tint | "Look here now": the current step, the heap top, the highlighted code line. `hot-ink` is the text-safe strength |
| `focus`                        | cobalt `36 86 214`                            | canary chalk                            | Keyboard focus ring                                                                                             |

Rules:

- **Must:** every text token (`ink`, `ink-2`, `ink-3`, `hot-ink`) is at least 4.5:1 on every surface, in both themes. Verified by `src/ui/__tests__/contrast.test.ts`.
- **Must:** the focus ring is at least 3:1 on every surface. Same test.
- The primary action is ink-filled, never a hue. A hue on a button would collide with the encoding colours on the board.
- Hue appears only where it carries meaning: the encoding below, and `focus`. No hue gradients, glows, coloured shadows or tinted panels.
- Depth: in dark, surface steps and hairlines only; in light, one soft neutral shadow (`--shadow-pop`) for floating menus and dialogs.

### Browser surfaces

Selection (`hot` at 30%), the text caret (`hot`), scrollbars (`rule-strong`), `accent-color` (ink), focus rings and link underline offset (3px) are themed in `src/index.css`. The `theme-color` meta has a light and a dark value.

## Visual encoding

One grammar for every family (pathfinding, sorting, searching, spanning trees, learning). State is never carried by colour alone; every state differs by shape or texture as well as hue, so a figure survives deuteranopia, protanopia, tritanopia, a washed-out projector and a black-and-white printout.

| Meaning                                                 | Mark                                                                                      | Token                                   |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------- |
| Decided (settled, sorted, in the tree, assigned)        | Diagonal line hatch "/" over a faint tint                                                 | `enc-done`                              |
| Pending (in the heap, queue or stack; under comparison) | Outline, inset from the cell edge                                                         | `enc-heap`                              |
| Current (the element being processed this step)         | Solid fill plus an outer ring                                                             | `enc-current`                           |
| Result (path, final tree, fitted line)                  | A continuous line with a ground-coloured halo                                             | `enc-path`                              |
| Obstacle (wall)                                         | The heaviest solid; in dark, a chalk contour on its boundary                              | `enc-wall`, `enc-wall-edge`             |
| Cost (mud weight)                                       | Dot stipple; more dots, more cost                                                         | `enc-cost`                              |
| Run A in a comparison                                   | "/" hatch and solid path                                                                  | `enc-a`                                 |
| Run B in a comparison                                   | "\\" hatch and dashed path                                                                | `enc-b`                                 |
| Both runs                                               | A quiet solid neutral tint, distinct from the two runs by being solid rather than hatched | ink at 13% (light), chalk at 20% (dark) |

Rules:

- **Must:** every mark token is at least 3:1 against an open cell (`field`) in both themes, and a wall is separable from an open cell by fill or by its contour. Verified by `contrast.test.ts`.
- The categorical hues (`enc-heap`, `enc-a`, `enc-b`) pass the dataviz validator's colour-vision checks in both themes (worst ΔE 16.2 deutan dark, 17.0 protan light). Run A is coral (dark) or berry (light), run B is cyan or cobalt, the heap is canary or orange. A third hue for "both runs" was tried and rejected: every candidate violet collided with run B under deuteranopia. `enc-done` and `enc-cost` are deliberately neutral; they are told apart by texture (lines against dots), never by colour.
- No red and green pair is used for any meaning, except that k-means clusters 3 and 6 (aqua and green) may both appear when k is 6 or more; their marker shapes (triangle, plus) carry the difference.
- Every encoding a learner must decode has a visible legend, always available beside the view. Legend swatches are drawn marks (`src/ui/lab/Swatch.tsx`), never flat colour squares, so the legend shows the same hatch, outline, line or dot as the canvas.

### Cluster identity (k-means)

Eight categorical tokens `--cat-1` to `--cat-8` (blue, orange, aqua, yellow, pink, green, violet, red), stepped separately for each theme and validated with the dataviz checker on Stride's own surfaces (worst adjacent ΔE 9.1 protan light, 8.4 protan dark; every slot at least 3:1). Each cluster also has its own marker shape in fixed order: circle, square, triangle, diamond, inverted triangle, plus, hexagon, star (`SHAPES` in `canvasKit.ts`). The order never changes with k, so a cluster keeps its colour and shape when k changes. Centroids are a ring on the board colour holding the cluster's shape.

## Canvas rendering

The canvas is the figure. All paint code shares `src/ui/lab/canvasKit.ts`.

### Pixels

- **Must:** grid geometry is computed in device pixels (`geometry(…, dpr)`), so every cell edge lands on a whole device pixel at 1×, 1.25×, 1.5×, 2× and 2.5×. Verified by `canvas.test.ts`.
- Hairlines (grid lines, ruler ticks, wall contours) are drawn on half-device-pixel centres with `crisp()`, one device pixel wide.
- Hatches are `CanvasPattern` tiles built at device resolution and anchored to the canvas origin, so hatch lines run continuously across neighbouring cells and stay sharp on a 4K projector. Mud dots sit on one lattice anchored to the canvas origin for the same reason.

### Text on the canvas

- **Must:** no canvas or SVG text under 12px. `canvasFont()` clamps every size; a source scan in `canvas.test.ts` rejects literal sizes below 12px anywhere in `src/ui`.
- Coordinates, indices and values use Atkinson Hyperlegible Mono; words on the canvas ("Heap", "Merge buffer", "Empty") use Atkinson Hyperlegible Next at weight 700.
- Labels never sit on a busy mark without a halo: rank badges have a board-coloured ring, paths have a board-coloured underlay, graph weights sit on a field-coloured plate.

### Pathfinding grid

| Element              | Drawing                                                                                                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Open cell            | `field`, with one-device-pixel `grid-line` hairlines between cells from 6px cells up                                                                                                              |
| Wall                 | Solid `enc-wall`; every edge that meets an open cell gets a `enc-wall-edge` contour                                                                                                               |
| Mud                  | Dot stipple in `enc-cost` at 75%; spacing falls from 7.5px to 3.6px as the weight rises, weight digit in the corner from 24px cells                                                               |
| Settled              | `enc-done` at 12% plus the "/" hatch                                                                                                                                                              |
| In the heap or queue | Outline inset 16% from the cell edge                                                                                                                                                              |
| Heap rank            | The three cells the heap will settle next carry numbered badges 1 to 3, from 14px cells, single run only                                                                                          |
| Current              | Solid `enc-current` and a ring 2.5px outside the cell                                                                                                                                             |
| Board-work trail     | The six most recently settled cells keep a `enc-current` wash, oldest faintest (8% to 34%). Computed from `closedAt` in the trace, so scrubbing in either direction shows exactly the right trail |
| Path                 | `enc-path` line, 20% of the cell, on a board-coloured halo                                                                                                                                        |
| Comparison           | Run A: "/" hatch in `enc-a`, solid path. Run B: "\\" hatch in `enc-b`, dashed path, outlined current. Both: ink at 16%                                                                            |
| Start, target        | From 16px cells, ink tiles lettered S and T (the target tile turns the path colour when found); below that, a ringed disc and a crosshair                                                         |

### Sorting and searching

- Unsorted values are ink at 34%; sorted values are the heavy neutral `enc-done`, plus the hatch where bars are at least 7px wide; compared values get a heap-coloured outline; a moved or written value is solid `enc-current`; the pivot is solid ink with its pointer.
- The active range (quicksort's current call, the heap region, the candidate range in search) is a faint ink lift (7%), never a darker hole.
- Search: the probe is `enc-current`, the found value is `enc-path`, and the target value is a neutral dashed reference line labelled in ink, so the "now" colour means only now.
- Pointer labels are 12px, joined by a space, on up to two staggered rows 14px apart.

### Spanning trees

- Tree edges are 4px `enc-path` on a halo; the edge under test is 4.5px `enc-current` on a halo; candidate edges are dashed `enc-heap`; rejected edges are faint with a small × at the midpoint; untouched edges are ink at 30%.
- Nodes in the tree are filled ink, others are open; node radius is at least 11px so two-digit 12px labels fit.

### Reversible motion

Cell transitions are symmetric, so stepping back reads as the exact inverse of stepping forward: a cell joining the heap fades in while its outline grows from 65% to full size, and a cell leaving it fades out while the outline shrinks to 65%; a settled hatch fades in or out over the same duration; a cell being settled flashes a fading `enc-current` outline. Durations follow the playback rate (70 to 240ms, 200ms when paused) and are skipped entirely under reduced motion.

## Components

### Primitives (`src/ui/primitives.tsx`)

- Buttons: 8px radius; heights 32 (`sm`), 36 (`md`), 44 (`lg`); icon buttons 36 or 44. One `primary` per view, ink-filled. Press scales to 0.97.
- **Must:** on a coarse pointer (`@media (pointer: coarse)`) every button, icon button and segmented option is at least 44 by 44px. Desktop density is unchanged. Verified by a script at 320, 360 and 390px in the gate checks.
- Icons inside buttons never shrink, so a fixed-width button cannot squeeze its icon to a dot.
- Menus scale in from their trigger (`--radix-dropdown-menu-content-transform-origin`), tooltips from theirs.
- Dialogs fade and rise when opened by a click. Dialogs opened from the keyboard (keyboard help on `?`, the command palette on Ctrl K or `/`) appear instantly: they are opened many times a session, and motion there only adds delay.

### Transport (`src/ui/lab/Transport.tsx`)

- Order: jump to start, previous milestone, step back, play (labelled Run, Pause, Resume or Replay), step forward, next milestone, jump to end, bookmark, then the hide-the-answer toggle.
- **Phase rail.** The scrubber track is divided at the run's own checkpoints ("Target discovered", "Half the tree", "Converged", …), each segment as long as its share of operations, passed segments in ink. Run B's checkpoints and bookmarks are thin ticks above it. It replaces a per-pixel colour barcode of event types that had no legend.
- **Readout:** "Step 60 of 659" in bold, then the operation count, the rate ("55 steps a second") and "Next milestone: Target discovered" in quieter text. No middle-dot strings, no units in monospace.
- Phones: three rows (rail; buttons with the answers toggle; step size, counter, a single speed button that cycles). Below 360px the play button is icon-only, its label kept for screen readers.

### Narration (`NowCaption`, `Line`)

- The caption grows to fit; nothing is clamped or cut with an ellipsis. The stage grid gives it an `auto` row with the old fixed height as its minimum, and an explicit `minmax(0,1fr)` column so long text wraps instead of widening the stage.
- Each run's caption has four parts, in order: what happened (bold, 16px; 22px in presentation mode), why it was allowed, the **invariant** (what stays true at every step), and what happens next.
- Invariants live in `src/core/invariants.ts`, one per algorithm. Until they are approved they render with a dotted underline (`.ph`), the same mark used for any copy awaiting approval.

### Structure panels (`StatePanel`)

- Heaps and queues are real tables (`table`, `row`, `columnheader`, `cell`) so screen readers announce row and column. Rows keep their identity and move to their new rank by transform; the row that leaves next is tinted `hot-soft` and bold; stale heap entries are struck through and announced as stale; a row that just entered is coloured `hot-ink` with no entrance animation.
- The highlighted pseudocode line is a full-width `hot-soft` tint (run B: cyan at 15%) with bold text, never a coloured left border.

### Hide the answer

`A` or the eye button hides what gives the answer away: the caption narration (replaced by "Answers hidden" and a Reveal button), the path, the target's found state and the heap-rank badges on the grid, and the Compare verdict. The structure panels stay, because they are the evidence a student reasons from. Nothing is announced to screen readers while answers are hidden.

### States

- Loading: the lab chunk's fallback appears only after 300ms, so a fast load never flashes a loader.
- Error: an unhandled error shows the message, says saved experiments are safe, and offers Back to Explore. A malformed share link loads a default experiment under an alert banner with a 36px dismiss button.
- Errors are bold `hot-ink` text with `role="alert"`; no coloured rules.

## Views

### Lab (desktop, 1024px and wider)

```
┌ header: wordmark · nav · [Setup] [family / algorithm ▾] [Compare] ……… Search · Save · Share · More ┐
├ experiment bar: question as h1 (28px) · question line (16px) · Result when finished ·  ‹ 2 of 14 › ┤
├ board 1: run metrics strip                                    │ board 2 (380px, 440px from 1600px) │
│          canvas (the figure)                                  │  Inspect · Compare · Log · About  │
│          one legend                                           │  run toggle (comparisons)         │
│          narration: A │ B   (what happened, why, invariant,   │  structure: Now, heap or queue    │
│                       next)                                   │  pseudocode                       │
│          transport: buttons · phase rail · readout            │  totals                           │
└──────────────────────────────────────────────────────────────┴───────────────────────────────────┘
```

- The setup column is gone. Setup opens as a drawer from the header's labelled Setup button at every desktop width, so the canvas gains 272px and the first thing on screen is the question, the board and the structure, not 31 editing controls.
- **Experiment bar.** For a prepared experiment the `h1` is its title and the line under it is its question (the existing copy in `scenarios.ts`). For an ad-hoc run it is the algorithm's name and its one-line summary, or "A vs B" in a comparison. When a comparison reaches its end, a Result line shows the engine's first comparison insight; it is hidden while answers are hidden. Previous and next arrows step through the 14 experiments in order.
- The experiment id travels in the URL as `x=` next to `e=`, so a share link opened by a student still shows the question. Links without `x=` open exactly as before.
- **Board 2 order.** The structure the algorithm decides from comes first, then the pseudocode, then the totals (the pseudocode is slotted in before the Totals block in every family).
- **One legend.** In an overlay comparison the legend lists only A, only B, both, the two paths, current, wall and mud; frontier and expanded are not drawn there, so they are not listed.

### Lab (phone and side panel, under 1024px)

Experiment bar (22px title), canvas, narration, legend, then the Inspector inline with Setup as its first tab; the transport is fixed to the bottom edge with the safe-area inset.

### Explore

- Hero: the existing headline and paragraph without an eyebrow; "Open the lab" is the primary action and the tour is secondary; the hero figure's legend uses drawn swatches.
- **Experiments are the front door, grouped by family** (Pathfinding, Sorting, Searching, Spanning trees, Learning, with each family's existing blurb). Each experiment is a row, not a card: the question is the 18px bold headline, the title and the algorithms (with A and B tags) sit under it, and a thumbnail of the finished run sits at the right. Rows are separated by hairlines; two family columns from 1024px.
- The algorithm reference table follows, unchanged in content.

### Saved

A bold `h1`, the browser-only storage note, then the list; the empty state is a sunken panel aligned to the reading edge with one action, Open the lab.

## Type

Atkinson Hyperlegible Next for text and Atkinson Hyperlegible Mono for code, coordinates and figures, self-hosted from `src/fonts.css` (woff2 only, Latin and Latin Extended). Chosen because it was designed for low-vision legibility: 0 and O, 1, l and I stay distinct at the back of a lecture hall, which matters for coordinates such as (1, 6) and pseudocode.

| Token  | Size / line | Use                                                  |
| ------ | ----------- | ---------------------------------------------------- |
| `2xs`  | 12 / 16     | The smallest text anywhere; legend detail, footnotes |
| `xs`   | 13 / 18     | Labels (`.label`, weight 700, sentence case)         |
| `sm`   | 14 / 20     | Dense panels, tables                                 |
| `base` | 15 / 22     | Body and controls                                    |
| `md`   | 16 / 24     | Captions in the narration row                        |
| `lg`   | 18 / 26     | Narration headline                                   |
| `xl`   | 22 / 28     | Panel titles in presentation mode                    |
| `2xl`  | 28 / 34     | The experiment question                              |
| `3xl`  | 40 / 44     | Explore display                                      |

Rules:

- No text under 12px, on the page or on a canvas.
- Labels are sentence case, weight 700, no letter-spacing. No uppercase tracked micro-labels.
- Monospace is for code, coordinates and numbers that line up, never as a "technical" costume. Numbers that line up use tabular figures (`.readout`).
- Weights in use: 400, 500, 700. Hierarchy comes from size first, then weight.
- Headings use `text-wrap: balance`.

## Shape and space

- Spacing is on a 4px grid.
- Radius by size: 4px for small marks and chips, 6px for controls, 8px for buttons and inputs, 12px for panels and dialogs. Nested radius is the outer radius minus the gap, never under 4px.
- Touch targets are at least 44px on coarse pointers. A control may look 32px on desktop while keeping a 44px hit area on touch.

## Motion tokens

| Token           | Value                             | Use                                                   |
| --------------- | --------------------------------- | ----------------------------------------------------- |
| `--ease-out`    | `cubic-bezier(0.23, 1, 0.32, 1)`  | Entering, exiting, state changes                      |
| `--ease-inout`  | `cubic-bezier(0.77, 0, 0.175, 1)` | Something moving on screen                            |
| `--ease-drawer` | `cubic-bezier(0.32, 0.72, 0, 1)`  | Drawers and sheets                                    |
| `--dur-fast`    | 140ms                             | Press, hover, colour                                  |
| `--dur-med`     | 180ms                             | Menus, popovers, row reranking                        |
| `--dur-slow`    | 240ms                             | Dialogs and drawers                                   |
| `--travel`      | 1, or 0 under reduced motion      | Multiplies every translate and scale in the keyframes |

Rules:

- Pressable controls scale to 0.97 on press.
- UI motion stays under 300ms; drawers may take 280ms.
- Under `prefers-reduced-motion: reduce` (or the in-app motion setting), travel is 0 and transitions are immediate. The full motion rules, including the canvas, arrive with the motion gate.

## Killed and why

| Removed                                                                  | Why                                                                                          |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Warm cream ground, vermilion action (`--signal`), IBM Plex Sans and Mono | One of the most common generated-UI looks; it read as a template, not a teaching instrument  |
| `.label` as 11px uppercase mono with 0.06em tracking                     | A generic tell, and screen readers can spell uppercase strings letter by letter              |
| Hue-only grid states (`st-open`, `st-closed`, `st-path`)                 | Failed colour-vision checks: frontier and run A were ΔE 3.9 apart under deuteranopia in dark |
| The `pulse` keyframe                                                     | An infinite attention loop; unused, so deleted before anything used it                       |
| `active:translate-y-px` press                                            | Replaced by a 0.97 scale that reads as a press at any size                                   |
| Cyrillic font subsets and woff fallbacks                                 | Never needed by the content; they doubled the font files in `dist/`                          |
