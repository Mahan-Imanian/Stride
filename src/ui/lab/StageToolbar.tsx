import type { GridExp } from "@/core/experiment";
import { randomSeed } from "@/core/rng";
import { cn } from "@/lib/utils";
import { useLab, type GraphTool, type Tool } from "@/store/lab";
import { useUI } from "@/store/ui";
import { useElementSize } from "../hooks";
import {
  Captions,
  Dice,
  Erase,
  Fullscreen,
  PanelRight,
  StartPin,
  TargetPin,
  Trash,
  Wall,
  Weight,
} from "../icons";
import { enterPresentation } from "../presentation";
import { Button, Kbd } from "../primitives";
import { regenerate } from "./variants";

export const TOOLBAR_PX = 48;

const GRID_TOOLS: { id: Tool; label: string; icon: React.ReactNode; key: string; hint: string }[] =
  [
    { id: "wall", label: "Wall", icon: <Wall />, key: "1", hint: "Drag to draw walls" },
    {
      id: "weight",
      label: "Mud",
      icon: <Weight />,
      key: "2",
      hint: "Drag to draw mud, which costs more to cross",
    },
    { id: "erase", label: "Erase", icon: <Erase />, key: "3", hint: "Drag to clear cells" },
    {
      id: "start",
      label: "Start",
      icon: <StartPin />,
      key: "4",
      hint: "Click a cell to move the start",
    },
    {
      id: "target",
      label: "Target",
      icon: <TargetPin />,
      key: "5",
      hint: "Click a cell to move the target",
    },
  ];

const GRAPH_TOOLS: { id: GraphTool; label: string; hint: string }[] = [
  { id: "move", label: "Move", hint: "Drag nodes; click a node to set the root" },
  { id: "edge", label: "Edge", hint: "Click two nodes to add or remove an edge" },
  { id: "node", label: "Node", hint: "Click empty space to add a node" },
  { id: "delete", label: "Delete", hint: "Click a node or edge to delete it" },
];

function ToolButton({
  on,
  onClick,
  label,
  hint,
  keyName,
  icon,
  showLabel,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
  hint: string;
  keyName?: string;
  icon?: React.ReactNode;
  showLabel: boolean;
}) {
  return (
    <button
      role="radio"
      aria-checked={on}
      aria-label={label}
      title={keyName ? `${hint} (${keyName})` : hint}
      onClick={onClick}
      className={cn(
        "flex h-9 items-center gap-1.5 rounded-md border px-2.5 text-sm font-medium transition-colors duration-fast [@media(pointer:coarse)]:min-h-11",
        on
          ? "border-ink bg-ink text-surface"
          : "border-rule-strong bg-surface text-ink-2 hover:bg-sunken hover:text-ink",
      )}
    >
      {icon}
      {showLabel && label}
    </button>
  );
}

function ViewToggle({
  on,
  onClick,
  label,
  keyName,
  icon,
  showLabel,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
  keyName: string;
  icon: React.ReactNode;
  showLabel: boolean;
}) {
  return (
    <Button
      size="md"
      variant="outline"
      aria-pressed={on}
      aria-label={showLabel ? undefined : label}
      title={`${on ? "Hide" : "Show"} ${label.toLowerCase()} (${keyName})`}
      onClick={onClick}
      className={cn(on && "border-ink bg-sunken text-ink")}
    >
      {icon}
      {showLabel && label}
      <span
        aria-hidden="true"
        className={cn(
          "ml-0.5 h-2 w-2 rounded-full border border-current",
          on ? "bg-current" : "bg-transparent",
        )}
      />
    </Button>
  );
}

/** View controls for the board: captions, the side panel and presentation mode. */
export function ViewControls() {
  const explain = useUI((s) => s.panels.explain);
  const togglePanel = useUI((s) => s.togglePanel);
  const side = useUI((s) => s.side);
  const setSide = useUI((s) => s.setSide);
  return (
    <div className="flex shrink-0 items-center gap-1.5" role="group" aria-label="View">
      <ViewToggle
        on={explain}
        onClick={() => togglePanel("explain")}
        label="Explanation"
        keyName="E"
        icon={<Captions />}
        showLabel
      />
      <ViewToggle
        on={side}
        onClick={() => setSide(!side)}
        label="Side panel"
        keyName="I"
        icon={<PanelRight />}
        showLabel
      />
      <Button
        size="md"
        variant="primary"
        onClick={enterPresentation}
        title="Full screen with large type (P)"
      >
        <Fullscreen />
        Present
        <Kbd className="ml-1 border-action-on/40 bg-transparent text-action-on">P</Kbd>
      </Button>
    </div>
  );
}

/** The always-visible editing controls above the board. */
export function StageToolbar() {
  const [box, size] = useElementSize<HTMLDivElement>();
  const family = useLab((s) => s.exp.family);
  const tool = useLab((s) => s.tool);
  const setTool = useLab((s) => s.setTool);
  const graphTool = useLab((s) => s.graphTool);
  const setGraphTool = useLab((s) => s.setGraphTool);
  const update = useLab((s) => s.update);
  const toolLabels = (size.w || 1200) >= 660;

  const clear = () =>
    update((e) =>
      e.family === "grid"
        ? ({
            ...e,
            input: {
              ...e.input,
              cells: new Uint8Array(e.input.cells.length).fill(1),
              terrain: "open",
            },
          } as GridExp)
        : e,
    );

  const fresh = family === "grid" ? "New layout" : family === "graph" ? "New graph" : "New data";

  return (
    <div
      ref={box}
      className="flex shrink-0 items-center gap-2 overflow-hidden border-b border-rule bg-surface px-3"
      style={{ height: TOOLBAR_PX }}
      role="toolbar"
      aria-label="Board tools"
    >
      {family === "grid" && (
        <>
          <span className="label mr-1 shrink-0 text-ink-2">Draw</span>
          <div
            className="flex shrink-0 items-center gap-1"
            role="radiogroup"
            aria-label="Drawing tool"
          >
            {GRID_TOOLS.map((t) => (
              <ToolButton
                key={t.id}
                on={tool === t.id}
                onClick={() => setTool(t.id)}
                label={t.label}
                hint={t.hint}
                keyName={t.key}
                icon={t.icon}
                showLabel={toolLabels}
              />
            ))}
          </div>
          <Button
            size="md"
            variant="ghost"
            onClick={clear}
            title="Remove every wall and mud cell"
            aria-label="Clear walls and mud"
          >
            <Trash />
            {toolLabels && "Clear"}
          </Button>
        </>
      )}
      {family === "graph" && (
        <>
          <span className="label mr-1 shrink-0 text-ink-2">Edit</span>
          <div
            className="flex shrink-0 items-center gap-1"
            role="radiogroup"
            aria-label="Graph tool"
          >
            {GRAPH_TOOLS.map((t) => (
              <ToolButton
                key={t.id}
                on={graphTool === t.id}
                onClick={() => setGraphTool(t.id)}
                label={t.label}
                hint={t.hint}
                showLabel
              />
            ))}
          </div>
        </>
      )}
      <Button
        size="md"
        variant="ghost"
        onClick={() => update((e) => regenerate(e, randomSeed()))}
        title={`${fresh} (N)`}
        aria-label={fresh}
      >
        <Dice />
        {(toolLabels || family !== "grid") && fresh}
      </Button>
    </div>
  );
}
