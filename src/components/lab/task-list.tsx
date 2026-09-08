import type { LabDefinition } from "@/lib/labs/schema";
import { useSession, type ExtraQ } from "@/lib/store";
import { cn } from "@/lib/cn";

export function TaskList({
  lab,
  answers,
  onCheck,
  extra = [],
}: {
  lab: LabDefinition;
  answers: Record<string, string>;
  onCheck: (stepId: string, value: string) => void;
  /** Instructor/custom questions from session admin (browser-local). */
  extra?: ExtraQ[];
}) {
  const submitted = useSession((s) => s.submitted);
  const usableExtra = extra.filter((row) => row.prompt.trim().length > 0);

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium">Tasks</h2>
      {lab.steps.length === 0 && usableExtra.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
          No tasks on this lab yet. Add questions in Admin → Your questions, then Save definition.
        </p>
      ) : null}
      {lab.steps.map((step, i) => (
        <fieldset key={step.id} className="rounded-xl border border-border bg-surface p-4">
          <legend className="px-1 text-sm font-medium">
            {i + 1}. {step.title}{" "}
            <span className="font-mono text-xs text-muted">{step.points} pts</span>
          </legend>
          <p className="mt-1 text-sm text-muted">{step.prompt}</p>
          {step.hint ? <p className="mt-1 text-xs text-muted">{step.hint}</p> : null}
          {step.checkType === "choice" && step.choices ? (
            <div className="mt-3 space-y-2">
              {step.choices.map((c) => (
                <label key={c} className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={step.id}
                    checked={(answers[step.id] ?? "") === c}
                    disabled={submitted}
                    onChange={() => onCheck(step.id, c)}
                  />
                  {c}
                </label>
              ))}
            </div>
          ) : step.checkType === "visit-lure" ? (
            <p className={cn("mt-3 text-sm", answers[step.id] === "visited" ? "text-pass" : "text-muted")}>
              {answers[step.id] === "visited"
                ? "Sandbox visit recorded (no secrets stored)."
                : "Open the sandboxed portal to complete this check."}
            </p>
          ) : (
            <input
              className="mt-3 min-h-11 w-full rounded-md border border-border bg-raised px-3 text-sm"
              value={answers[step.id] ?? ""}
              disabled={submitted}
              onChange={(e) => onCheck(step.id, e.target.value)}
              placeholder="Answer"
              autoComplete="off"
            />
          )}
        </fieldset>
      ))}

      {usableExtra.length > 0 ? (
        <>
          <h2 className="pt-2 text-sm font-medium">Instructor questions</h2>
          <p className="text-xs text-muted">Added from Admin · stored in this browser session only until Save definition.</p>
          {usableExtra.map((row, index) => {
            const id = `extra-${index}`;
            return (
              <fieldset key={id} className="rounded-xl border border-primary/30 bg-surface p-4">
                <legend className="px-1 text-sm font-medium">
                  E{index + 1}. {row.prompt}{" "}
                  <span className="font-mono text-xs text-muted">{row.points} pts</span>
                </legend>
                <input
                  className="mt-3 min-h-11 w-full rounded-md border border-border bg-raised px-3 text-sm"
                  value={answers[id] ?? ""}
                  disabled={submitted}
                  onChange={(e) => onCheck(id, e.target.value)}
                  placeholder="Answer"
                  autoComplete="off"
                />
              </fieldset>
            );
          })}
        </>
      ) : null}
    </div>
  );
}
