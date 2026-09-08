import { useCallback, useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";

type LabRecord = { definition: Record<string, unknown>; source: "file" | "database"; readonly: boolean };

export function LabAdminPanel() {
  const [labs, setLabs] = useState<LabRecord[]>([]);
  const [selected, setSelected] = useState("");
  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState("");

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
    }
  }, [draft, labs, selected]);

  function choose(id: string) {
    const record = labs.find((item) => item.definition.id === id);
    setSelected(id);
    setDraft(record ? JSON.stringify(record.definition, null, 2) : "");
    setMessage("");
  }

  function newDraft() {
    setSelected("");
    setDraft(JSON.stringify({ id: "new-training-lab", title: "New training lab", description: "A fictional defensive security training scenario.", difficulty: "intro", category: "email", minutes: 20, learningObjectives: ["Identify a training artifact"], steps: [{ id: "step-1", title: "Review the artifact", prompt: "What should the trainee notice?", checkType: "manual", points: 10 }], hints: ["Use only fictional template data."], scoringRubric: [{ id: "rubric-1", description: "Completes the review", points: 10 }], flags: [], renderer: "generic", emailSamples: [], published: false }, null, 2));
  }

  async function save() {
    try {
      const payload = JSON.parse(draft) as Record<string, unknown>;
      const response = await fetch(selected ? `/api/labs/${encodeURIComponent(String(payload.id))}` : "/api/labs", { method: selected ? "PUT" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Save failed");
      setMessage("Saved to the database registry.");
      await refresh();
      setSelected(String(payload.id));
      setDraft(JSON.stringify(payload, null, 2));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Invalid JSON or lab definition");
    }
  }

  async function remove() {
    if (!selected) return;
    const response = await fetch(`/api/labs/${encodeURIComponent(selected)}`, { method: "DELETE" });
    if (!response.ok) {
      const result = (await response.json()) as { error?: string };
      setMessage(result.error ?? "Delete failed");
      return;
    }
    setMessage("Removed from the database registry.");
    setSelected("");
    setDraft("");
    await refresh();
  }

  const selectedRecord = labs.find((item) => item.definition.id === selected);
  return <section className="rounded-xl border border-border bg-surface p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-medium">Lab registry</h2><p className="mt-1 text-xs text-muted">Validated file templates are read-only. Database labs can be added, edited, and removed at runtime.</p></div><button type="button" onClick={newDraft} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border px-3 text-sm"><Plus className="size-4" /> New lab</button></div><details className="mt-4 rounded-md border border-border bg-raised p-3"><summary className="cursor-pointer text-sm font-medium">How to add a lab</summary><ol className="mt-3 list-decimal space-y-2 pl-5 text-xs leading-relaxed text-muted"><li>Click <strong className="text-fg">New lab</strong>.</li><li>Edit the JSON definition. Use the schema template in <span className="font-mono text-primary">labs/README.md</span>.</li><li>Include an id, title, description, category, learning objectives, at least one step, renderer, and email samples.</li><li>Click <strong className="text-fg">Save definition</strong>. The lab appears in Labs and Engine after the registry refresh.</li><li>File-based labs are read-only; only database labs can be removed.</li></ol></details><div className="mt-4 grid gap-4 lg:grid-cols-[220px_1fr]"><div className="space-y-1">{labs.map((record) => <button key={String(record.definition.id)} type="button" onClick={() => choose(String(record.definition.id))} className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs ${selected === record.definition.id ? "bg-raised" : "hover:bg-raised/60"}`}><span className="truncate">{String(record.definition.title)}</span><span className="ml-2 text-[10px] text-muted">{record.readonly ? "file" : "db"}</span></button>)}</div><div><textarea value={draft} onChange={(event) => setDraft(event.target.value)} spellCheck={false} className="min-h-72 w-full rounded-md border border-border bg-raised p-3 font-mono text-[11px] leading-relaxed" placeholder="Select a lab or create a new definition" /><div className="mt-2 flex flex-wrap gap-2"><button type="button" onClick={() => void save()} disabled={!draft} className="inline-flex min-h-10 items-center gap-2 rounded-md bg-primary px-3 text-sm text-bg"><Save className="size-4" /> Save definition</button><button type="button" onClick={() => void remove()} disabled={!selected || selectedRecord?.readonly} title={selectedRecord?.readonly ? "File-based labs are read-only" : "Remove selected database lab"} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-crit/40 px-3 text-sm text-crit"><Trash2 className="size-4" /> Remove database lab</button></div>{selectedRecord?.readonly ? <p className="mt-2 text-xs text-muted">This file template is read-only. Create a database lab with New lab before using Remove.</p> : null}{message ? <p className="mt-2 text-xs text-muted">{message}</p> : null}</div></div></section>;
}