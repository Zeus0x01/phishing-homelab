import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { computeScore, useLab } from "@/lib/store";
import { questions, totalPoints } from "@/data/campaign";
import { recordProgressAttempt } from "@/lib/services/progress";

export const Route = createFileRoute("/debrief")({ component: Debrief });

function Debrief() {
  const nav = useNavigate();
  const answers = useLab((s) => s.answers);
  const reset = useLab((s) => s.reset);
  const sessionId = useLab((s) => s.sessionId);
  const { score, detail } = computeScore(answers);
  const cutoff = 70;

  useEffect(() => {
    void recordProgressAttempt({ data: { sessionId, labId: "nightwire", score, total: totalPoints } }).catch(() => undefined);
  }, [score, sessionId]);

  return (
    <main className="min-h-dvh bg-bg px-4 py-10 text-fg">
      <div className="mx-auto max-w-2xl space-y-6">
        <p className="font-mono text-xs tracking-widest text-primary uppercase">Debrief</p>
        <h1 className="text-3xl font-semibold">Qualification result</h1>
        <p className="font-mono text-5xl tabular-nums text-primary">
          {score}
          <span className="text-lg text-muted">/{totalPoints}</span>
        </p>
        <p className="text-muted">
          Indicative cutoff ~{cutoff}. Training scorer only — not the live event.
        </p>
        <ul className="space-y-2">
          {detail.map((d) => {
            const q = questions.find((x) => x.id === d.id);
            return (
              <li
                key={d.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm"
              >
                <span>
                  {q?.prompt}
                  <span className="mt-1 block font-mono text-xs text-muted">
                    Your answer: {answers[d.id] || "—"}
                  </span>
                </span>
                <span className={d.ok ? "text-pass" : "text-crit"}>{d.ok ? d.points : 0}</span>
              </li>
            );
          })}
        </ul>
        <div className="flex flex-wrap gap-3">
          <Link to="/lab" className="min-h-11 rounded-md border border-border px-4 py-2 text-sm">
            Review lab
          </Link>
          <button
            type="button"
            className="min-h-11 rounded-md bg-primary px-4 text-sm font-medium text-bg"
            onClick={() => {
              reset();
              void nav({ to: "/" });
            }}
          >
            Reset attempt
          </button>
        </div>
      </div>
    </main>
  );
}
