import { createFileRoute } from "@tanstack/react-router";
import { Activity, Award, Flame, Target } from "lucide-react";
import { catalog } from "@/data/campaign";
import { useLab } from "@/lib/store";
import { cn } from "@/lib/cn";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
  const labId = useLab((s) => s.labId);
  const setLab = useLab((s) => s.setLab);

  return (
    <AppShell eyebrow="Overview" title="Dashboard">
      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-page py-8">
        <header className="flex flex-col gap-2">
          <p className="max-w-2xl text-sm leading-relaxed text-muted">
            Practice detection decisions against fictional artifacts, review the evidence, and build a repeatable analyst habit.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardStat icon={Award} label="Labs completed" value="0" note="Start your first run" />
          <DashboardStat icon={Target} label="Average score" value="--" note="Awaiting scored attempts" />
          <DashboardStat icon={Flame} label="Current streak" value="0 days" note="Keep the signal alive" />
          <DashboardStat icon={Activity} label="Detection accuracy" value="--" note="No verdicts recorded" />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <div className="rounded-panel border border-border bg-surface p-5"><div className="flex items-center justify-between"><div><h2 className="font-medium">Weekly activity</h2><p className="mt-1 text-xs text-muted">Training attempts remain inside this app.</p></div><span className="font-mono text-xs text-primary">last 7 days</span></div><div className="mt-7 flex h-32 items-end gap-3 border-b border-l border-border px-4">{[28, 42, 22, 58, 36, 74, 48].map((height, index) => <div key={index} className="group flex flex-1 flex-col items-center gap-2"><div className="w-full max-w-12 rounded-t bg-primary/65 group-hover:bg-primary" style={{ height: `${height}%` }} /><span className="font-mono text-[10px] text-muted">{["M", "T", "W", "T", "F", "S", "S"][index]}</span></div>)}</div></div>
          <div className="rounded-panel border border-border bg-surface p-5"><h2 className="font-medium">Recent activity</h2><p className="mt-1 text-xs text-muted">Completed simulations and verdicts will appear here.</p><div className="mt-6 rounded-control border border-dashed border-border p-5 text-center text-sm text-muted">No activity recorded yet.</div></div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium">Labs</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {catalog.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => setLab(l.id)}
                  className={cn(
                    "flex min-h-24 w-full flex-col items-start gap-1 rounded-xl border p-4 text-left",
                    labId === l.id ? "border-primary bg-surface" : "border-border bg-surface",
                  )}
                >
                  <span className="font-mono text-[10px] text-primary">{l.code}</span>
                  <span className="font-medium">{l.name}</span>
                  <span className="text-sm text-muted">{l.blurb}</span>
                  <span className="font-mono text-xs text-muted">{l.minutes} min · {l.questions.length} Q</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

      </main>
    </AppShell>
  );
}

function DashboardStat({ icon: Icon, label, value, note }: { icon: typeof Award; label: string; value: string; note: string }) {
  return <article className="rounded-panel border border-border bg-surface p-4"><Icon className="size-4 text-primary" /><p className="mt-5 text-xs text-muted">{label}</p><p className="mt-1 font-mono text-2xl text-fg">{value}</p><p className="mt-1 text-xs text-muted">{note}</p></article>;
}
