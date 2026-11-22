import * as DialogPrimitive from "@radix-ui/react-dialog";
import { STAGE_ROWS_PX, useIsCompact, useLayout } from "@/lib/layout";
import { navigate } from "@/lib/router";
import { useLab } from "@/store/lab";
import { useUI } from "@/store/ui";
import { Close, Warn } from "../icons";
import { useCommitCounter } from "../perf";
import { Button, IconButton } from "../primitives";
import { Inspector } from "./Inspector";
import { Present } from "./Present";
import { Setup } from "./Setup";
import { ExperimentBar } from "./ExperimentBar";
import { Legend, NowCaption, Stage } from "./Stage";
import { Transport } from "./Transport";
import { usePlaybackDriver } from "./playback";
import { useLabRoute } from "./useLabRoute";

function StageColumn() {
  useCommitCounter("stage column");
  return (
    <section
      className="grid min-h-0 min-w-0 bg-field"
      style={{
        gridTemplateColumns: "minmax(0,1fr)",
        gridTemplateRows: `minmax(0,1fr) auto ${STAGE_ROWS_PX.legend}px ${STAGE_ROWS_PX.transport}px`,
      }}
      aria-label="Visualization"
    >
      <div className="min-h-0 min-w-0 [contain:strict]">
        <Stage />
      </div>
      <NowCaption />
      <div className="h-7 overflow-hidden border-t border-rule bg-surface px-4">
        <Legend />
      </div>
      <Transport />
    </section>
  );
}

export function Lab({
  query,
  setupOpen,
  setSetupOpen,
}: {
  query: URLSearchParams;
  setupOpen: boolean;
  setSetupOpen: (o: boolean) => void;
}) {
  const layout = useLayout();
  const compact = useIsCompact();
  const present = useUI((s) => s.present);
  const [error, dismiss] = useLabRoute(query);
  usePlaybackDriver();
  const gridAspect = useLab((s) =>
    s.exp.family === "grid" && !s.exp.b ? s.exp.input.h / s.exp.input.w : 0,
  );

  const banner = error && (
    <div
      role="alert"
      className="flex items-start gap-3 border-b border-action/40 bg-hot-soft px-4 py-2.5 text-sm"
    >
      <Warn className="mt-0.5 shrink-0 text-hot-ink" />
      <p className="flex-1">{error} A default experiment is loaded instead.</p>
      <Button size="sm" variant="ghost" onClick={() => navigate("/")}>
        Explore
      </Button>
      <IconButton label="Dismiss" size="icon" onClick={dismiss} className="-my-1.5">
        <Close />
      </IconButton>
    </div>
  );

  if (present) return <Present />;

  if (layout === "narrow") {
    return (
      <div className="flex flex-col pb-[calc(148px+env(safe-area-inset-bottom))]">
        {banner}
        <ExperimentBar compact />
        <div
          className="h-[min(56dvh,600px)] min-h-[280px] shrink-0 border-b border-rule bg-field [contain:strict]"
          style={
            gridAspect
              ? {
                  height: `min(56dvh, 600px, calc((100vw - 24px) * ${gridAspect.toFixed(4)} + 72px))`,
                }
              : undefined
          }
        >
          <Stage narrow={compact} />
        </div>
        <NowCaption flow />
        <div className="h-7 overflow-hidden border-b border-rule px-4">
          <Legend narrow />
        </div>
        <Inspector inline withSetup />
        <div className="fixed inset-x-0 bottom-0 z-30 overflow-x-clip shadow-[0_-8px_24px_-12px_rgb(0_0_0/0.25)]">
          <Transport compact />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {banner}
      <ExperimentBar />
      <div
        className={
          layout === "wide"
            ? "grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_380px] 2xl:grid-cols-[minmax(0,1fr)_440px]"
            : "grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_340px]"
        }
      >
        {
          <DialogPrimitive.Root open={setupOpen} onOpenChange={setSetupOpen}>
            <DialogPrimitive.Portal>
              <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-ink/20 data-[state=open]:animate-fade-in" />
              <DialogPrimitive.Content
                className="fixed inset-y-0 left-0 z-50 w-[320px] overflow-y-auto border-r border-rule-strong bg-surface shadow-pop data-[state=open]:animate-slide-in-left"
                aria-describedby={undefined}
              >
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-rule bg-surface px-4 py-3">
                  <DialogPrimitive.Title className="text-md font-semibold">
                    Setup
                  </DialogPrimitive.Title>
                  <DialogPrimitive.Close asChild>
                    <Button variant="ghost" size="icon" aria-label="Close setup">
                      <Close />
                    </Button>
                  </DialogPrimitive.Close>
                </div>
                <Setup />
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          </DialogPrimitive.Root>
        }
        <StageColumn />
        <aside className="min-h-0 border-l border-rule bg-surface" aria-label="Inspector">
          <Inspector />
        </aside>
      </div>
    </div>
  );
}
