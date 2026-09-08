import { Link } from "@tanstack/react-router";
import { Activity, BookOpen, FileSearch, LayoutGrid, Menu, QrCode, Settings2, Shield } from "lucide-react";
import { TrainingBanner } from "@/components/training-banner";
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutGrid, search: undefined },
  { to: "/labs", label: "Labs", icon: BookOpen, search: undefined },
  { to: "/engine", label: "Engine", icon: Activity, search: undefined },
  { to: "/lab", label: "Attachment", icon: FileSearch, search: { tab: "attach" } },
  { to: "/lab", label: "Other vectors", icon: QrCode, search: { tab: "vectors" } },
  { to: "/admin", label: "Admin", icon: Settings2, search: undefined },
] as const;

export function AppShell({
  children,
  eyebrow,
  title,
}: {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
}) {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <div className="flex min-h-dvh">
        <aside className="hidden w-sidebar shrink-0 border-r border-border bg-surface/90 lg:flex lg:flex-col">
          <div className="flex h-16 items-center gap-3 border-b border-border px-5"><Shield className="size-5 text-primary" /><div><p className="font-semibold tracking-tight">Sentinel Range</p><p className="font-mono text-[9px] tracking-[0.16em] text-muted uppercase">Training operations</p></div></div>
          <nav aria-label="Primary navigation" className="flex-1 space-y-1 p-3">{nav.map((item) => <Link key={item.label} to={item.to} search={item.search} className="flex min-h-11 items-center gap-3 rounded-control px-3 text-sm text-muted transition-colors hover:bg-raised hover:text-fg" activeProps={{ className: "bg-primary/10 text-primary" }}><item.icon className="size-4" />{item.label}</Link>)}</nav>
          <div className="border-t border-border p-4"><p className="font-mono text-[10px] text-primary">TRAINING MODE</p><p className="mt-1 text-xs leading-relaxed text-muted">Fictional artifacts only. Nothing is sent or stored outside this app.</p></div>
        </aside>
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur lg:hidden"><div className="flex min-h-14 items-center justify-between px-4"><Link to="/" className="inline-flex items-center gap-2"><Shield className="size-4 text-primary" /><span className="font-medium">Sentinel Range</span></Link><button type="button" aria-label="Open navigation" className="rounded-control p-2 text-muted hover:bg-raised hover:text-fg"><Menu className="size-5" /></button></div><nav aria-label="Mobile navigation" className="flex gap-1 overflow-x-auto border-t border-border px-2 py-2">{nav.map((item) => <Link key={item.label} to={item.to} search={item.search} className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-control px-3 text-xs text-muted" activeProps={{ className: "bg-primary/10 text-primary" }}><item.icon className="size-3.5" />{item.label}</Link>)}</nav></header>
          <TrainingBanner />
          {(eyebrow || title) && <div className="mx-auto max-w-7xl px-page pt-8">{eyebrow ? <p className="font-mono text-xs tracking-[0.18em] text-primary uppercase">{eyebrow}</p> : null}{title ? <h1 className="mt-1 text-3xl font-semibold tracking-tight">{title}</h1> : null}</div>}
          {children}
        </div>
      </div>
    </div>
  );
}
