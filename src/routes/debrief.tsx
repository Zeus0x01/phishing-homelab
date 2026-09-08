import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { computeScore, useLab } from "@/lib/store";
import { computeLabScore } from "@/lib/engine/scoring";
import { getLab, totalFor } from "@/data/campaign";
import { loadFileLabs } from "@/lib/labs/loader";
import { listLabs } from "@/lib/labs/service";
import type { LabDefinition } from "@/lib/labs/schema";
import { recordProgressAttempt } from "@/lib/services/progress";

export const Route = createFileRoute("/debrief")({ component: Debrief });

/** Map campaign pack ids to JSON training lab ids when they differ. */
function templateIdFor(labId: string): string {
  if (labId === "nightwire") return "email-analysis";
  return labId;
}

function Debrief() {
  const nav = useNavigate();
  const answers = useLab((s) => s.answers);
  const reset = useLab((s) => s.reset);
  const sessionId = useLab((s) => s.sessionId);
  const labId = useLab((s) => s.labId);
  const extra = useLab((s) => s.extra);
  const lureVisited = useLab((s) => s.lureVisited);

  const [registry, setRegistry] = useState<LabDefinition[]>(() =>
    loadFileLabs().map((record) => record.definition),
  );

  useEffect(() => {
    void listLabs()
      .then((records) => setRegistry(records.map((r) => r.definition)))
      .catch(() => undefined);
  }, []);

  const templateId = templateIdFor(labId);
  const definition = registry.find((lab) => lab.id === templateId);

  const result = useMemo(() => {
    // Prefer scoring the JSON lab tasks the learner actually answered in TaskList.
    if (definition && definition.steps.length > 0) {
      const labResult = computeLabScore(definition, answers, lureVisited);
      return {
        mode: "lab-tasks" as const,
        score: labResult.score,
        total: labResult.total,
        detail: labResult.detail.map((d) => {
          const step = definition.steps.find((s) => s.id === d.id);
          return {
            id: d.id,
            ok: d.ok,
            points: d.points,
            prompt: step?.prompt ?? d.title,
            answer: answers[d.id] ?? "",
          };
        }),
      };
    }

    // Fallback: campaign pack exam questions for this labId (not always catalog[0]).
    const pack = getLab(labId);
    const scored = computeScore(labId, extra, answers);
    return {
      mode: "campaign" as const,
      score: scored.score,
      total: scored.total || totalFor(pack.questions),
      detail: scored.detail.map((d) => {
        const q = pack.questions.find((x) => x.id === d.id);
        return {
          id: d.id,
          ok: d.ok,
          points: d.points,
          prompt: q?.prompt ?? d.id,
          answer: answers[d.id] ?? "",
        };
      }),
    };
  }, [definition, answers, lureVisited, labId, extra]);

  const cutoff = Math.round(result.total * 0.64);

  useEffect(() => {
    void recordProgressAttempt({
      data: {
        sessionId,
        labId: definition?.id ?? labId,
        score: result.score,
        total: result.total,
      },
    }).catch(() => undefined);
  }, [sessionId, definition?.id, labId, result.score, result.total]);

  return (
    <main className="min-h-dvh bg-bg px-4 py-10 text-fg">
      <div className="mx-auto max-w-2xl space-y-6">
        <p className="font-mono text-xs tracking-widest text-primary uppercase">Debrief</p>
        <h1 className="text-3xl font-semibold">Qualification result</h1>
        <p className="text-sm text-muted">
          Lab: <span className="text-fg">{definition?.title ?? getLab(labId).title}</span>
          {result.mode === "lab-tasks" ? " · scored from lab tasks" : " · scored from campaign exam"}
        </p>
        <p className="font-mono text-5xl tabular-nums text-primary">
          {result.score}
          <span className="text-lg text-muted">/{result.total}</span>
        </p>
        <p className="text-muted">
          Indicative cutoff ~{cutoff}. Training scorer only — not a live event.
        </p>
        <ul className="space-y-2">
          {result.detail.map((d) => (
            <li
              key={d.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm"
            >
              <span>
                {d.prompt}
                <span className="mt-1 block font-mono text-xs text-muted">
                  Your answer: {d.answer.trim() ? d.answer : "—"}
                </span>
              </span>
              <span className={d.ok ? "text-pass" : "text-crit"}>{d.ok ? d.points : 0}</span>
            </li>
          ))}
        </ul>
        {result.detail.length === 0 ? (
          <p className="rounded-lg border border-warn/40 bg-warn/10 p-4 text-sm text-warn">
            No questions were scored. Open the lab, answer the tasks, then submit again.
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <Link to="/lab" className="min-h-11 rounded-md border border-border px-4 py-2 text-sm">
            Review lab
          </Link>
          <Link to="/labs" className="min-h-11 rounded-md border border-border px-4 py-2 text-sm">
            All labs
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
