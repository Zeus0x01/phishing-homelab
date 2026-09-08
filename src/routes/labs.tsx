import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BookOpen, ChevronRight, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { cn } from "@/lib/cn";
import { loadFileLabs } from "@/lib/labs/loader";
import { listLabs } from "@/lib/labs/service";
import type { LabDefinition } from "@/lib/labs/schema";
import { useLab } from "@/lib/store";

export const Route = createFileRoute("/labs")({ component: LabsCatalog });

function LabsCatalog() {
  const navigate = useNavigate();
  const startLab = useLab((state) => state.startLab);
  const [labs, setLabs] = useState<LabDefinition[]>(() => loadFileLabs().map((record) => record.definition));
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  useEffect(() => {
    void listLabs().then((records) => setLabs(records.map((record) => record.definition))).catch(() => undefined);
  }, []);
  const filtered = useMemo(
    () => labs.filter((lab) => `${lab.title} ${lab.description} ${lab.learningObjectives.join(" ")}`.toLowerCase().includes(query.toLowerCase()) && (category === "all" || lab.category === category) && (difficulty === "all" || lab.difficulty === difficulty)),
    [category, difficulty, labs, query],
  );

  function openLab(id: string) {
    startLab(id);
    void navigate({ to: "/lab" });
  }

  return (
    <AppShell eyebrow="Library" title="Training labs">
      <main className="mx-auto max-w-7xl space-y-6 px-page py-8">
        <div className="flex flex-col gap-3 rounded-panel border border-border bg-surface p-4 md:flex-row">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-3 size-4 text-muted" />
            <span className="sr-only">Search labs</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search lab titles and objectives" className="min-h-10 w-full rounded-control border border-border bg-raised pl-9 pr-3 text-sm" />
          </label>
          <select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)} className="min-h-10 rounded-control border border-border bg-raised px-3 text-sm"><option value="all">All categories</option><option value="email">Email</option><option value="web">Web</option><option value="SMS">SMS</option><option value="vishing">Vishing</option></select>
          <select aria-label="Filter by difficulty" value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="min-h-10 rounded-control border border-border bg-raised px-3 text-sm"><option value="all">All difficulty</option><option value="intro">Intro</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((lab) => <article key={lab.id} className="group flex min-h-64 flex-col rounded-panel border border-border bg-surface p-5 transition-colors hover:border-primary/60"><div className="flex items-start justify-between gap-3"><span className="rounded bg-primary/10 px-2 py-1 font-mono text-[10px] uppercase text-primary">{lab.difficulty}</span><BookOpen className="size-4 text-muted" /></div><h2 className="mt-5 text-lg font-semibold">{lab.title}</h2><p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{lab.description}</p><div className="mt-5 flex items-center justify-between border-t border-border pt-4"><span className="font-mono text-xs text-muted">{lab.steps.length} tasks · {lab.minutes} min</span><button type="button" onClick={() => openLab(lab.id)} className={cn("inline-flex min-h-10 items-center gap-1 text-sm text-primary")}><span>Start lab</span><ChevronRight className="size-4 transition-transform group-hover:translate-x-1" /></button></div></article>)}
        </div>
        {filtered.length === 0 && <p className="rounded-panel border border-border bg-surface p-8 text-center text-sm text-muted">No labs match those filters.</p>}
      </main>
    </AppShell>
  );
}
