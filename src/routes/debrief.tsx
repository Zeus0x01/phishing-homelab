import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useLab } from "@/lib/store";
import { computeLabScore } from "@/lib/engine/scoring";
import { getLab, gradeQuestion } from "@/data/campaign";
import { loadFileLabs } from "@/lib/labs/loader";
import { listLabs } from "@/lib/labs/service";
import type { LabDefinition } from "@/lib/labs/schema";
import { recordProgressAttempt } from "@/lib/services/progress";

export const Route = createFileRoute("/debrief")({ component: Debrief });

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
  const usableExtra = extra.filter((row) => row.prompt.trim().length > 0);

  const result = useMemo(() => {
    const detail: {
      id: string;
      ok: boolean;
      points: number;
      prompt: string;
      answer: string;
    }[] = [];
    let score = 0;
    let total = 0;

    if (definition && definition.steps.length > 0) {
      const labResult = computeLabScore(definition, answers, lureVisited);
      score += labResult.score;
      total += labResult.total;
      for (const d of labResult.detail) {
        const step = definition.steps.find((s) => s.id === d.id);
        detail.push({
          id: d.id,
          ok: d.ok,
          points: d.points,
          prompt: step?.prompt ?? d.title,
          answer: answers[d.id] ?? "",
        });
      }
    } else {
      const pack = getLab(labId);
      for (const q of pack.questions) {
        total += q.points;
        const ok = gradeQuestion(q, answers[q.id] ?? "");
        if (ok) score += q.points;
        detail.push({
          id: q.id,
          ok,
          points: q.points,
          prompt: q.prompt,
          answer: answers[q.id] ?? "",
        });
      }
    }

    // Always append instructor/custom questions from Admin (browser session).
    usableExtra.forEach((row, index) => {
      const id = `extra-${index}`;
      const q = {
        id,
        points: row.points,
        prompt: row.prompt,
        hint: "Instructor question",
        kind: "text" as const,
        accept: [row.answer],
      };
      total += row.points;
      const ok = gradeQuestion(q, answers[id] ?? "");
      if (ok) score += row.points;
      detail.push({
        id,
        ok,
        points: row.points,
        prompt: row.prompt,
        answer: answers[id] ?? "",
      });
    });

    return {
      mode: definition ? ("lab-tasks" as const) : ("campaign" as const),
      score,
      total,
      detail,
    };
  }, [definition, answers, lureVisited, labId, usableExtra]);

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
          {usableExtra.length > 0 ? ` · +${usableExtra.length} instructor question(s)` : null}
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
