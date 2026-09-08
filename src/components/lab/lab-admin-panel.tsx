import { useCallback, useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { EmlImportHelper } from "@/components/lab/eml-import-helper";
import { useLab, type ExtraQ } from "@/lib/store";

type LabRecord = { definition: Record<string, unknown>; source: "file" | "database"; readonly: boolean };

type StepLike = {
  id?: string;
  title?: string;
  prompt?: string;
  checkType?: string;
  expected?: string[];
  choices?: string[];
  points?: number;
  hint?: string;
};

function instructorStepsFromExtra(extra: ExtraQ[]): StepLike[] {
  return extra
    .filter((row) => row.prompt.trim().length > 0)
    .map((row, index) => ({
      id: `instructor-${index + 1}`,
      title: `Instructor Q${index + 1}`,
      prompt: row.prompt.trim(),
      checkType: "flag",
      expected: row.answer.trim() ? [row.answer.trim()] : [],
      points: Number(row.points) > 0 ? Number(row.points) : 10,
    }));
}

function extraFromInstructorSteps(steps: unknown): ExtraQ[] {
  if (!Array.isArray(steps)) return [];
  return steps
    .filter((step): step is StepLike => {
      if (!step || typeof step !== "object") return false;
      const id = String((step as StepLike).id ?? "");
      return id.startsWith("instructor-");
    })
    .map((step) => ({
      prompt: String(step.prompt ?? ""),
      answer: Array.isArray(step.expected) && step.expected[0] ? String(step.expected[0]) : "",
      points: typeof step.points === "number" ? step.points : 10,
    }));
}

export function LabAdminPanel() {
  const [labs, setLabs] = useState<LabRecord[]>([]);
  const [selected, setSelected] = useState("");
  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState("");
  const extra = useLab((s) => s.extra);
  const setExtra = useLab((s) => s.setExtra);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/labs");
    if (!response.ok) throw new Error("Could not load lab registry");
    const records = (await response.json()) as LabRecord[];
    setLabs(records);
  }, []);

  useEffect(() => {
    void refresh().catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Registry unavailable"));
  }, [refresh]);

  useEffect(() => {
    if (!selected && !draft && labs[0]) {
      setSelected(String(labs[0].definition.id));
      setDraft(JSON.stringify(labs[0].definition, null, 2));
      setExtra(extraFromInstructorSteps(labs[0].definition.steps));
    }
  }, [draft, labs, selected, setExtra]);

  function choose(id: string) {
    const record = labs.find((item) => item.definition.id === id);
    setSelected(id);
    setDraft(record ? JSON.stringify(record.definition, null, 2) : "");
    setExtra(extraFromInstructorSteps(record?.definition.steps));
    setMessage("");
  }

  function newDraft() {
    setSelected("");
    setExtra([]);
    setDraft(
      JSON.stringify(
        {
          id: "new-training-lab",
          title: "New training lab",
          description: "A fictional defensive security training scenario.",
          difficulty: "intro",
          category: "email",
          minutes: 20,
          learningObjectives: ["Identify a training artifact"],
          steps: [
            {
              id: "step-1",
              title: "Review the artifact",
              prompt: "What should the trainee notice?",
              checkType: "manual",
              points: 10,
            },
          ],
          hints: ["Use only fictional template data."],
          scoringRubric: [{ id: "rubric-1", description: "Completes the review", points: 10 }],
          flags: [],
          renderer: "generic",
          emailSamples: [],
          published: false,
        },
        null,
        2,
      ),
    );
  }

  function applyImportedDraft(json: string) {
    setSelected("");
    setDraft(json);
    try {
      const parsed = JSON.parse(json) as { steps?: unknown };
      setExtra(extraFromInstructorSteps(parsed.steps));
    } catch {
      /* ignore */
    }
    setMessage("Imported .eml draft loaded into the editor. Review, set published:true when ready, then Save.");
  }

  async function save() {
    try {
      const payload = JSON.parse(draft) as Record<string, unknown>;
      const existingSteps = Array.isArray(payload.steps) ? (payload.steps as StepLike[]) : [];
      const baseSteps = existingSteps.filter((step) => !String(step?.id ?? "").startsWith("instructor-"));
      const instructorSteps = instructorStepsFromExtra(extra);
      payload.steps = [...baseSteps, ...instructorSteps];

      // Keep rubric in sync for instructor items (best-effort).
      const rubric = Array.isArray(payload.scoringRubric) ? [...(payload.scoringRubric as Record<string, unknown>[])] : [];
      const baseRubric = rubric.filter((item) => !String(item?.id ?? "").startsWith("instructor-"));
      payload.scoringRubric = [
        ...baseRubric,
        ...instructorSteps.map((step) => ({
          id: step.id,
          description: step.title,
          points: step.points,
        })),
      ];

      const response = await fetch("/api/labs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Save failed");

      const savedJson = JSON.stringify(payload, null, 2);
      setDraft(savedJson);
      setSelected(String(payload.id ?? selected));
      await refresh();
      setMessage(
        instructorSteps.length
          ? `Saved lab with ${instructorSteps.length} instructor question(s) in steps.`
          : "Saved to the database registry.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Invalid JSON or lab definition");
    }
  }

  async function remove() {
    if (!selected) return;
    const response = await fetch(`/api/labs?id=${encodeURIComponent(selected)}`, { method: "DELETE" });
    if (!response.ok) {
      setMessage("Could not delete lab (file-backed labs are read-only).");
      return;
    }
    setSelected("");
    setDraft("");
    setExtra([]);
    await refresh();
    setMessage("Deleted database lab.");
  }

  const selectedRecord = labs.find((item) => item.definition.id === selected);

  return (
    <div className="mx-auto grid max-w-6xl gap-6 p-4 sm:p-6">
      <EmlImportHelper onDraft={applyImportedDraft} />

      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-1 font-medium">Lab registry editor</h2>
        <p className="mb-4 text-xs text-muted">
          Edit the JSON definition. Instructor questions from <strong className="text-fg">Your questions</strong> are written
          into <code className="font-mono">steps</code> when you click <strong className="text-fg">Save definition</strong>.
          File-backed labs stay read-only; save creates/updates a database copy.
        </p>

        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
          <div className="space-y-1">
            {labs.map((record) => (
              <button
                key={String(record.definition.id)}
                type="button"
                onClick={() => choose(String(record.definition.id))}
                className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm ${
                  selected === record.definition.id ? "bg-raised" : "hover:bg-raised/60"
                }`}
              >
                <span className="truncate">{String(record.definition.title)}</span>
                <span className="shrink-0 text-[10px] uppercase text-muted">{record.source}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={newDraft}
              className="mt-2 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-border text-sm"
            >
              <Plus className="size-4" /> New lab
            </button>
          </div>

          <div className="space-y-3">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              spellCheck={false}
              className="min-h-[420px] w-full rounded-md border border-border bg-raised p-3 font-mono text-xs leading-relaxed"
              placeholder="Select a lab or create a new definition"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void save()}
                className="inline-flex min-h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-bg"
              >
                <Save className="size-4" /> Save definition
              </button>
              <button
                type="button"
                onClick={() => void remove()}
                disabled={!selected || selectedRecord?.readonly}
                className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border px-4 text-sm disabled:opacity-40"
              >
                <Trash2 className="size-4" /> Delete
              </button>
            </div>
            {message ? <p className="text-sm text-muted">{message}</p> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
