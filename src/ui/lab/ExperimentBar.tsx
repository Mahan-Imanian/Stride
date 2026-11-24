import { compareInsights, variantLabel } from "@/core/experiment";
import { getAlgo } from "@/core/info";
import { getScenario, SCENARIOS } from "@/core/scenarios";
import { cn } from "@/lib/utils";
import { navigate } from "@/lib/router";
import { position, totalLength, useLab } from "@/store/lab";
import { useUI } from "@/store/ui";
import { ChevronRight } from "../icons";
import { IconButton } from "../primitives";
import { ViewControls } from "./StageToolbar";

export function ExperimentBar({ compact = false }: { compact?: boolean }) {
  const scenarioId = useUI((s) => s.scenario);
  const hidden = useUI((s) => s.answersHidden);
  const exp = useLab((s) => s.exp);
  const runA = useLab((s) => s.runA);
  const runB = useLab((s) => s.runB);
  const done = useLab((s) => position(s) >= totalLength(s));

  const scenario = scenarioId ? getScenario(scenarioId) : undefined;
  const algos = [exp.a.algo, exp.b?.algo].filter((a): a is NonNullable<typeof a> => !!a);
  const matches = !!scenario && algos.every((a) => scenario.algos.includes(a));
  const index = matches ? SCENARIOS.indexOf(scenario) : -1;

  const title = matches
    ? scenario.title
    : exp.b
      ? `${variantLabel(exp.a)} vs ${variantLabel(exp.b)}`
      : getAlgo(exp.a.algo).name;
  const question = matches ? scenario.question : getAlgo(exp.a.algo).summary;
  const result =
    done && runB && exp.b && !hidden
      ? (compareInsights(runA, runB, variantLabel(exp.a), variantLabel(exp.b))[0] ?? null)
      : null;

  const go = (d: number) => {
    const next = SCENARIOS[(index + d + SCENARIOS.length) % SCENARIOS.length];
    navigate(`/lab?s=${next.id}`);
  };

  const resultLine = (
    <p
      className={cn(
        "min-w-0 rounded bg-sunken px-2 py-0.5",
        compact ? "mt-1.5 line-clamp-2 h-11 text-sm" : "truncate text-md",
        !result && (compact ? "invisible" : "hidden"),
      )}
      role="status"
      title={result ?? undefined}
    >
      <span className="mr-1.5 font-bold">Result</span>
      {result ?? "Not finished yet"}
    </p>
  );

  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-4 border-b border-rule bg-bg",
        compact ? "px-4 py-3" : "px-5 py-3.5",
      )}
    >
      <div className="min-w-0 flex-1">
        {/* The result has a fixed slot, so the board below never moves when it appears. */}
        <div
          className={cn(
            "flex min-w-0 items-center gap-4 overflow-hidden",
            compact ? "h-7" : "h-[34px]",
          )}
        >
          <h1
            className={cn(
              "min-w-0 shrink-0 truncate font-bold",
              result && !compact && "max-w-[55%]",
              compact ? "text-xl" : "text-2xl",
            )}
          >
            {title}
          </h1>
          {!compact && resultLine}
        </div>
        <p className={cn("mt-0.5 truncate text-ink-2", compact ? "text-sm" : "text-md")}>
          {question}
        </p>
        {compact && resultLine}
      </div>
      {!compact && <ViewControls />}
      {matches && (
        <nav aria-label="Experiments" className="flex shrink-0 items-center gap-1">
          <IconButton label="Previous experiment" onClick={() => go(-1)}>
            <ChevronRight className="rotate-180" />
          </IconButton>
          {!compact && (
            <span className="readout whitespace-nowrap px-1 text-sm text-ink-2">
              {index + 1} of {SCENARIOS.length}
            </span>
          )}
          <IconButton label="Next experiment" onClick={() => go(1)}>
            <ChevronRight />
          </IconButton>
        </nav>
      )}
    </div>
  );
}
