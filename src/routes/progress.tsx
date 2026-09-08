import { createFileRoute } from "@tanstack/react-router";
import { Activity, Award, Flame, Target } from "lucide-react";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/progress")({ component: Progress });

function Progress() {
  const bars = [72, 48, 86, 64, 92, 58, 78];
  return <AppShell eyebrow="Learning record" title="Progress"><main className="mx-auto max-w-7xl space-y-6 px-page py-8"><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat icon={Award} label="Labs completed" value="0" note="Start your first run" /><Stat icon={Target} label="Average score" value="--" note="No scored attempts yet" /><Stat icon={Flame} label="Current streak" value="0 days" note="Consistency compounds" /><Stat icon={Activity} label="Detection accuracy" value="--" note="Engine verdicts pending" /></section><section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]"><div className="rounded-panel border border-border bg-surface p-5"><div className="flex items-center justify-between"><div><h2 className="font-medium">Weekly activity</h2><p className="mt-1 text-xs text-muted">Training activity stays in this app.</p></div><span className="font-mono text-xs text-primary">last 7 days</span></div><div className="mt-8 flex h-48 items-end gap-3 border-b border-l border-border px-4 pb-0 pt-4">{bars.map((height, index) => <div key={index} className="group flex flex-1 flex-col items-center gap-2"><div className="w-full max-w-10 rounded-t bg-primary/70 transition-colors group-hover:bg-primary" style={{ height: `${height}%` }} /><span className="font-mono text-[10px] text-muted">{["M", "T", "W", "T", "F", "S", "S"][index]}</span></div>)}</div></div><div className="rounded-panel border border-border bg-surface p-5"><h2 className="font-medium">Recent activity</h2><p className="mt-1 text-xs text-muted">Your completed simulations will appear here.</p><div className="mt-6 rounded-control border border-dashed border-border p-5 text-center text-sm text-muted">No activity recorded yet.</div></div></section></main></AppShell>;
}

function Stat({ icon: Icon, label, value, note }: { icon: typeof Award; label: string; value: string; note: string }) {
  return <article className="rounded-panel border border-border bg-surface p-4"><Icon className="size-4 text-primary" /><p className="mt-5 text-xs text-muted">{label}</p><p className="mt-1 font-mono text-2xl text-fg">{value}</p><p className="mt-1 text-xs text-muted">{note}</p></article>;
}
