import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Award, BookOpen, Shield } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { catalog } from "@/data/campaign";
import { useLab } from "@/lib/store";
import { cn } from "@/lib/cn";
import type { LabDefinition } from "@/lib/labs/schema";

export const Route = createFileRoute("/")({ component: Dashboard });

type RegistryLab = { definition: LabDefinition; source: string; readonly: boolean };

function Dashboard() {
  const nav = useNavigate();
  const labId = useLab((s) => s.labId);
  const setLab = useLab((s) => s.setLab);
  const startLab = useLab((s) => s.startLab);
  const [registry, setRegistry] = useState<RegistryLab[]>([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    void fetch("/api/labs")
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load lab registry");
        return (await response.json()) as RegistryLab[];
      })
      .then((records) => setRegistry(records))
      .catch((error: unknown) => setLoadError(error instanceof Error ? error.message : "Registry unavailable"));
  }, []);

  const published = useMemo(() => {
    const fromRegistry = registry
      .map((r) => r.definition)
      .filter((d) => d.published !== false);
    if (fromRegistry.length > 0) return fromRegistry;
    // Fallback only if registry empty (offline/dev)
    return catalog.map((l) => ({
      id: l.id,
      title: l.name,
      description: l.blurb,
      difficulty: "intro" as const,
      category: "email" as const,
      minutes: l.minutes,
      learningObjectives: [] as string[],
      steps: [] as LabDefinition["steps"],
      published: true,
    }));
  }, [registry]);

  function openLab(id: string) {
    setLab(id);
    startLab(id);
    void nav({ to: "/lab" });
  }

  return (
    <AppShell eyebrow="Operations" title="Dashboard">
      <main className="mx-auto max-w-6xl space-y-8 px-page py-8">
        <section className="grid gap-3 sm:grid-cols-3">
          <DashboardStat icon={BookOpen} label="Labs available" value={String(published.length)} note="From live registry" />
          <DashboardStat icon={Shield} label="Active lab" value={labId || "—"} note="Session selection" />
          <DashboardStat icon={Award} label="Mode" value="Training" note="Closed homelab" />
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium">Labs</h2>
            <Link to="/labs" className="text-sm text-primary underline">
              Open catalog
            </Link>
          </div>
          {loadError ? <p className="mb-3 text-sm text-muted">{loadError}</p> : null}
          <ul className="grid gap-3 sm:grid-cols-2">
            {published.map((lab) => (
              <li key={lab.id}>
                <button
                  type="button"
                  onClick={() => openLab(lab.id)}
                  className={cn(
                    "flex min-h-24 w-full flex-col items-start gap-1 rounded-xl border p-4 text-left",
                    labId === lab.id ? "border-primary bg-surface" : "border-border bg-surface",
                  )}
                >
                  <span className="font-mono text-[10px] uppercase text-primary">
                    {lab.category} · {lab.difficulty}
                  </span>
                  <span className="font-medium">{lab.title}</span>
                  <span className="line-clamp-2 text-sm text-muted">{lab.description}</span>
                  <span className="font-mono text-xs text-muted">
                    {lab.minutes} min · {(lab.steps ?? []).length} tasks
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </AppShell>
  );
}

function DashboardStat({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: typeof Award;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <article className="rounded-panel border border-border bg-surface p-4">
      <Icon className="size-4 text-primary" />
      <p className="mt-5 text-xs text-muted">{label}</p>
      <p className="mt-1 font-mono text-2xl text-fg">{value}</p>
      <p className="mt-1 text-xs text-muted">{note}</p>
    </article>
  );
}
