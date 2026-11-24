import { useLab } from "@/store/lab";
import { useUI, workspaceId, type InspectorTab, type WorkspaceId } from "@/store/ui";
import {
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Close,
  Compare,
  Fullscreen,
  Info,
  List,
  Minus,
  PanelRight,
  Plus,
  Search,
} from "../icons";
import { enterPresentation } from "../presentation";
import {
  Button,
  IconButton,
  Kbd,
  MenuCheckItem,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuRoot,
  MenuSeparator,
  MenuTrigger,
} from "../primitives";

export const PANE_BAR_PX = 30;

/** A small square control in a panel header: minimize, collapse, close. */
export function PaneButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <IconButton
      label={label}
      onClick={onClick}
      className="h-6 w-6 rounded-sm text-ink-3 hover:bg-rule hover:text-ink [@media(pointer:coarse)]:min-h-9 [@media(pointer:coarse)]:min-w-9"
    >
      {children}
    </IconButton>
  );
}

/**
 * Panel header with the controls on the right. Double-clicking the bar toggles between open and
 * minimized, the way docked panels behave in desktop editors.
 */
export function PaneBar({
  title,
  minimized,
  onToggleMin,
  onClose,
  minLabel = minimized ? "Expand" : "Minimize",
  children,
}: {
  title: string;
  minimized: boolean;
  onToggleMin: () => void;
  onClose: () => void;
  minLabel?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="flex shrink-0 select-none items-center gap-2 border-t border-rule bg-sunken pl-3 pr-1"
      style={{ height: PANE_BAR_PX }}
      onDoubleClick={(e) => {
        if ((e.target as Element).closest("button")) return;
        onToggleMin();
      }}
    >
      <span className="shrink-0 text-xs font-bold text-ink">{title}</span>
      <div className="min-w-0 flex-1 truncate text-xs text-ink-2">{children}</div>
      <PaneButton label={`${minLabel} ${title.toLowerCase()}`} onClick={onToggleMin}>
        {minimized ? <Plus size={14} /> : <Minus size={14} />}
      </PaneButton>
      <PaneButton label={`Close ${title.toLowerCase()}`} onClick={onClose}>
        <Close size={14} />
      </PaneButton>
    </div>
  );
}

const SIDE_TABS: { id: InspectorTab; label: string; icon: React.ReactNode; needsB?: boolean }[] = [
  { id: "inspect", label: "Inspect", icon: <Search /> },
  { id: "compare", label: "Compare", icon: <Compare />, needsB: true },
  { id: "log", label: "Log", icon: <List /> },
  { id: "about", label: "About", icon: <Info /> },
];

/** The side panel collapsed to a strip of icons. Each icon reopens the panel on its tab. */
export function SideIcons() {
  const hasB = useLab((s) => !!s.runB);
  const setPane = useUI((s) => s.setPane);
  const setTab = useUI((s) => s.setInspectorTab);
  return (
    <nav
      aria-label="Side panel, collapsed"
      className="flex h-full w-12 flex-col items-center gap-1 border-l border-rule bg-surface py-1.5"
    >
      <IconButton
        label="Expand side panel"
        keys="I"
        tipSide="left"
        onClick={() => setPane("side", "open")}
      >
        <ChevronsLeft />
      </IconButton>
      <div className="my-1 h-px w-7 bg-rule" />
      {SIDE_TABS.filter((t) => !t.needsB || hasB).map((t) => (
        <IconButton
          key={t.id}
          label={t.label}
          tipSide="left"
          onClick={() => {
            setTab(t.id);
            setPane("side", "open");
          }}
        >
          {t.icon}
        </IconButton>
      ))}
    </nav>
  );
}

/** Collapse and close controls shown at the right end of the side panel's tab row. */
export function SideControls() {
  const setPane = useUI((s) => s.setPane);
  return (
    <div className="ml-auto flex shrink-0 items-center gap-0.5 pl-2">
      <PaneButton label="Collapse side panel to icons" onClick={() => setPane("side", "min")}>
        <ChevronsRight size={14} />
      </PaneButton>
      <PaneButton label="Close side panel" onClick={() => setPane("side", "closed")}>
        <Close size={14} />
      </PaneButton>
    </div>
  );
}

const PRESETS: { id: WorkspaceId; label: string; hint: string }[] = [
  { id: "essentials", label: "Essentials", hint: "Every panel open" },
  { id: "lecture", label: "Lecture", hint: "Explanation minimized, side panel as icons" },
  { id: "board", label: "Board only", hint: "Just the board and the controls" },
];

/** The header's Window menu: show or hide each panel, or switch to a saved arrangement. */
export function WindowMenu() {
  const w = useUI((s) => s.workspace);
  const setPane = useUI((s) => s.setPane);
  const apply = useUI((s) => s.applyWorkspace);
  const current = workspaceId(w);
  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <Button variant="outline" data-tour="window">
          <PanelRight />
          Window
          <ChevronDown className="text-ink-2" />
        </Button>
      </MenuTrigger>
      <MenuContent align="start" className="w-[300px]">
        <MenuLabel>Panels</MenuLabel>
        <MenuCheckItem checked={w.toolbar} onCheckedChange={(on) => setPane("toolbar", on)}>
          Toolbar
        </MenuCheckItem>
        <MenuCheckItem
          checked={w.explain !== "closed"}
          onCheckedChange={(on) => setPane("explain", on ? "open" : "closed")}
          keys="E"
        >
          Explanation
        </MenuCheckItem>
        <MenuCheckItem checked={w.legend} onCheckedChange={(on) => setPane("legend", on)}>
          Legend
        </MenuCheckItem>
        <MenuCheckItem
          checked={w.side !== "closed"}
          onCheckedChange={(on) => setPane("side", on ? "open" : "closed")}
          keys="I"
        >
          Side panel
        </MenuCheckItem>
        <MenuSeparator />
        <MenuLabel>Workspace</MenuLabel>
        <MenuRadioGroup value={current ?? ""} onValueChange={(v) => apply(v as WorkspaceId)}>
          {PRESETS.map((p) => (
            <MenuRadioItem key={p.id} value={p.id} hint={p.hint}>
              {p.label}
            </MenuRadioItem>
          ))}
        </MenuRadioGroup>
        <MenuItem onSelect={() => apply("essentials")}>Reset workspace</MenuItem>
        <MenuSeparator />
        <MenuItem onSelect={enterPresentation} keys="P">
          <Fullscreen /> Present full screen
        </MenuItem>
      </MenuContent>
    </MenuRoot>
  );
}

export function PresentButton() {
  return (
    <Button variant="primary" onClick={enterPresentation} title="Full screen with large type (P)">
      <Fullscreen />
      Present
      <Kbd className="ml-1 border-action-on/40 bg-transparent text-action-on">P</Kbd>
    </Button>
  );
}
