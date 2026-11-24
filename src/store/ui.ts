import { create } from "zustand";
import { readJson, writeJson } from "@/lib/storage";

export type DialogId = "palette" | "share" | "save" | "shortcuts" | "settings" | "import" | null;
export type PresentPanel = "code" | "state" | "explain" | "metrics";

/** Lab panels a viewer can show, minimize or close, like panels in a desktop editor. */
export type PaneState = "open" | "min" | "closed";
export interface Workspace {
  toolbar: boolean;
  legend: boolean;
  explain: PaneState;
  /** "min" collapses the side panel to a strip of icons. */
  side: PaneState;
}
export type InspectorTab = "setup" | "inspect" | "compare" | "log" | "about";

export const WORKSPACES = {
  essentials: { toolbar: true, legend: true, explain: "open", side: "open" },
  lecture: { toolbar: true, legend: true, explain: "min", side: "min" },
  board: { toolbar: false, legend: false, explain: "closed", side: "closed" },
} satisfies Record<string, Workspace>;
export type WorkspaceId = keyof typeof WORKSPACES;

const WORKSPACE_KEY = "stride.workspace.v1";

function loadWorkspace(): Workspace {
  const saved = readJson<Partial<Workspace>>(WORKSPACE_KEY, {});
  const states: PaneState[] = ["open", "min", "closed"];
  const w: Workspace = { ...WORKSPACES.essentials };
  if (typeof saved.toolbar === "boolean") w.toolbar = saved.toolbar;
  if (typeof saved.legend === "boolean") w.legend = saved.legend;
  if (saved.explain && states.includes(saved.explain)) w.explain = saved.explain;
  if (saved.side && states.includes(saved.side)) w.side = saved.side;
  return w;
}

interface UIStore {
  dialog: DialogId;
  setupOpen: boolean;
  tour: number | null;
  present: boolean;
  panels: Record<PresentPanel, boolean>;
  hud: boolean;
  answersHidden: boolean;
  workspace: Workspace;
  inspectorTab: InspectorTab;
  scenario: string | null;
  open(d: DialogId): void;
  close(): void;
  setSetupOpen(o: boolean): void;
  setTour(step: number | null): void;
  setPresent(on: boolean): void;
  togglePanel(p: PresentPanel): void;
  setHud(on: boolean): void;
  setAnswersHidden(on: boolean): void;
  setPane<K extends keyof Workspace>(pane: K, value: Workspace[K]): void;
  applyWorkspace(id: WorkspaceId): void;
  setInspectorTab(tab: InspectorTab): void;
  setScenario(id: string | null): void;
}

export const useUI = create<UIStore>((set, get) => {
  const save = (workspace: Workspace) => {
    set({ workspace });
    writeJson(WORKSPACE_KEY, workspace);
  };
  return {
    dialog: null,
    setupOpen: false,
    tour: null,
    present: false,
    panels: { code: true, state: true, explain: true, metrics: true },
    hud: false,
    answersHidden: false,
    workspace: loadWorkspace(),
    inspectorTab: "inspect",
    scenario: null,
    open: (dialog) => set({ dialog }),
    close: () => set({ dialog: null }),
    setSetupOpen: (setupOpen) => set({ setupOpen }),
    setTour: (tour) => set({ tour }),
    setPresent: (present) => set({ present }),
    togglePanel: (p) => set({ panels: { ...get().panels, [p]: !get().panels[p] } }),
    setHud: (hud) => set({ hud }),
    setAnswersHidden: (answersHidden) => set({ answersHidden }),
    setPane: (pane, value) => save({ ...get().workspace, [pane]: value }),
    applyWorkspace: (id) => save({ ...WORKSPACES[id] }),
    setInspectorTab: (inspectorTab) => set({ inspectorTab }),
    setScenario: (scenario) => set({ scenario }),
  };
});

export function workspaceId(w: Workspace): WorkspaceId | null {
  for (const [id, preset] of Object.entries(WORKSPACES) as [WorkspaceId, Workspace][])
    if (
      preset.toolbar === w.toolbar &&
      preset.legend === w.legend &&
      preset.explain === w.explain &&
      preset.side === w.side
    )
      return id;
  return null;
}
