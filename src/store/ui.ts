import { create } from "zustand";

export type DialogId = "palette" | "share" | "save" | "shortcuts" | "settings" | "import" | null;
export type PresentPanel = "code" | "state" | "explain" | "metrics";

interface UIStore {
  dialog: DialogId;
  setupOpen: boolean;
  tour: number | null;
  present: boolean;
  panels: Record<PresentPanel, boolean>;
  hud: boolean;
  answersHidden: boolean;
  side: boolean;
  scenario: string | null;
  open(d: DialogId): void;
  close(): void;
  setSetupOpen(o: boolean): void;
  setTour(step: number | null): void;
  setPresent(on: boolean): void;
  togglePanel(p: PresentPanel): void;
  setHud(on: boolean): void;
  setAnswersHidden(on: boolean): void;
  setSide(on: boolean): void;
  setScenario(id: string | null): void;
}

export const useUI = create<UIStore>((set, get) => ({
  dialog: null,
  setupOpen: false,
  tour: null,
  present: false,
  panels: { code: true, state: true, explain: true, metrics: true },
  hud: false,
  answersHidden: false,
  side: true,
  scenario: null,
  open: (dialog) => set({ dialog }),
  close: () => set({ dialog: null }),
  setSetupOpen: (setupOpen) => set({ setupOpen }),
  setTour: (tour) => set({ tour }),
  setPresent: (present) => set({ present }),
  togglePanel: (p) => set({ panels: { ...get().panels, [p]: !get().panels[p] } }),
  setHud: (hud) => set({ hud }),
  setAnswersHidden: (answersHidden) => set({ answersHidden }),
  setSide: (side) => set({ side }),
  setScenario: (scenario) => set({ scenario }),
}));
