import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Radio, ShieldAlert } from "lucide-react";
import { LAB_BANNER, catalog, getLab } from "@/data/campaign";
import { useLab, type ExtraQ } from "@/lib/store";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
  const nav = useNavigate();
  const labId = useLab((s) => s.labId);
  const setLab = useLab((s) => s.setLab);
  const minutes = useLab((s) => s.minutes);
  const setMinutes = useLab((s) => s.setMinutes);
  const callsign = useLab((s) => s.callsign);
  const setCallsign = useLab((s) => s.setCallsign);
  const extra = useLab((s) => s.extra);
  const setExtra = useLab((s) => s.setExtra);
  const start = useLab((s) => s.start);
  const live = useLab((s) => s.live);
  const sessionCode = useLab((s) => s.sessionCode);
  const goLive = useLab((s) => s.goLive);
  const pack = getLab(labId);
  const [copied, setCopied] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  function shareUrl() {
    if (typeof window === "undefined") return "";
    const u = new URL(window.location.origin + window.location.pathname);
    u.searchParams.set("lab", labId);
    u.searchParams.set("mins", String(minutes));
    if (sessionCode) u.searchParams.set("session", sessionCode);
    return u.toString();
  }

  return (
    <main className="min-h-dvh bg-bg text-fg">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-5 py-8 sm:py-12">
        <p className="rounded-md border border-warn/40 bg-warn/10 px-3 py-2 text-xs leading-relaxed text-warn">
          {LAB_BANNER}
        </p>
        <header className="flex flex-col gap-2">
          <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">Instructor dashboard</p>
          <h1 className="text-3xl font-semibold tracking-tight">PhishLab</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted">
            Pick a lab, set the clock, add your own questions, then start. Going live opens a
            training session in this app for whoever you share the published link with. It does
            not send mail or run a real phish.
          </p>
        </header>

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

        <section className="grid gap-4 rounded-xl border border-border bg-surface p-5 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            Player / team
            <input
              className="min-h-11 rounded-md border border-border bg-raised px-3"
              value={hydrated ? callsign : ""}
              onChange={(e) => setCallsign(e.target.value)}
              placeholder="Callsign"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Minutes
            <input
              type="number"
              min={5}
              max={90}
              className="min-h-11 rounded-md border border-border bg-raised px-3"
              value={hydrated ? minutes : pack.minutes}
              onChange={(e) => setMinutes(Number(e.target.value) || pack.minutes)}
            />
          </label>
        </section>

        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-1 font-medium">Your questions</h2>
          <p className="mb-3 text-xs text-muted">Appended to the selected lab. Stored on this browser.</p>
          <div className="space-y-3">
            {(hydrated ? extra : []).map((row, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_5rem]">
                <input
                  className="min-h-11 rounded-md border border-border bg-raised px-3 text-sm"
                  placeholder="Prompt"
                  value={row.prompt}
                  onChange={(e) => {
                    const next: ExtraQ[] = extra.map((r, j) =>
                      j === i ? { ...r, prompt: e.target.value } : r,
                    );
                    setExtra(next);
                  }}
                />
                <input
                  className="min-h-11 rounded-md border border-border bg-raised px-3 text-sm"
                  placeholder="Accepted answer"
                  value={row.answer}
                  onChange={(e) => {
                    const next = extra.map((r, j) => (j === i ? { ...r, answer: e.target.value } : r));
                    setExtra(next);
                  }}
                />
                <input
                  type="number"
                  className="min-h-11 rounded-md border border-border bg-raised px-3 text-sm"
                  value={row.points}
                  onChange={(e) => {
                    const next = extra.map((r, j) =>
                      j === i ? { ...r, points: Number(e.target.value) || 10 } : r,
                    );
                    setExtra(next);
                  }}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-3 min-h-10 text-sm text-primary underline"
            onClick={() => setExtra([...extra, { prompt: "", answer: "", points: 10 }])}
          >
            Add question
          </button>
        </section>

        <section className="rounded-xl border border-border bg-surface p-5">
          <div className="mb-2 flex items-center gap-2">
            <Radio className="size-4 text-primary" />
            <h2 className="font-medium">Make it live</h2>
          </div>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted">
            <li>Use Publish in Grok so trainees get the public app link.</li>
            <li>Click Start live session. Copy the session URL (lab + minutes baked in).</li>
            <li>Players open that URL, then Start lab. Same browser settings apply here; extra questions stay on this device unless they use this same published app after you set them.</li>
          </ol>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 text-sm"
              onClick={goLive}
            >
              Start live session
            </button>
            {live && sessionCode && (
              <button
                type="button"
                className="min-h-11 rounded-lg border border-primary px-4 font-mono text-sm text-primary"
                onClick={() => {
                  void navigator.clipboard.writeText(shareUrl());
                  setCopied(true);
                }}
              >
                {copied ? "Copied" : `Copy link · ${sessionCode}`}
              </button>
            )}
          </div>
        </section>

        <button
          type="button"
          className="inline-flex min-h-12 w-fit items-center gap-2 rounded-lg bg-primary px-5 font-medium text-bg"
          onClick={() => {
            start();
            void nav({ to: "/lab" });
          }}
        >
          <ShieldAlert className="size-4" />
          Start {pack.name}
        </button>
      </div>
    </main>
  );
}
