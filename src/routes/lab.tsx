import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  FileSearch,
  LayoutGrid,
  BookOpen,
  QrCode,
  Radio,
  Settings2,
} from "lucide-react";
import { getLab, LAB_BANNER, type LabPack } from "@/data/campaign";
import { computeScore, mergedQuestions, useLab } from "@/lib/store";
import { EngineConsole } from "@/components/engine/engine-console";
import { EmailViewer } from "@/components/engine/email-viewer";
import { TaskList } from "@/components/lab/task-list";
import { extractArtifacts, type ExtractedSample } from "@/lib/labs/artifacts";
import { loadFileLabs } from "@/lib/labs/loader";
import { listLabs } from "@/lib/labs/service";
import type { LabDefinition } from "@/lib/labs/schema";
import { cn } from "@/lib/cn";
import { z } from "zod";

export const Route = createFileRoute("/lab")({
  validateSearch: z.object({ tab: z.enum(["inbox", "engine", "attach", "vectors", "exam"]).optional() }),
  component: Lab,
});

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid, route: "/" },
  { id: "labs", label: "Labs", icon: BookOpen, route: "/labs" },
  { id: "engine", label: "Engine", icon: Activity },
  { id: "attach", label: "Attachment", icon: FileSearch },
  { id: "vectors", label: "Other vectors", icon: QrCode },
  { id: "admin", label: "Admin", icon: Settings2, route: "/admin" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function Lab() {
  const nav = useNavigate();
  const startedAt = useLab((s) => s.startedAt);
  const submit = useLab((s) => s.submit);
  const labId = useLab((s) => s.labId);
  const callsign = useLab((s) => s.callsign);
  const pack = getLab(labId);
  const search = useSearch({ from: "/lab" });
  const templateLabId = labId === "nightwire" ? "email-analysis" : labId;
  const [registryLabs, setRegistryLabs] = useState<LabDefinition[]>(() => loadFileLabs().map((record) => record.definition));
  const templateLab = registryLabs.find((definition) => definition.id === templateLabId);
  const trainingSamples = templateLab ? templateLab.emailSamples.map((sample) => extractArtifacts(templateLab, sample)) : [];
  const [tab, setTab] = useState<TabId | "overview">(search.tab === "attach" || search.tab === "vectors" ? search.tab : "overview");
  const [hydrated, setHydrated] = useState(false);
  const email = trainingSamples[0];

  useEffect(() => setHydrated(true), []);
  useEffect(() => {
    void listLabs().then((records) => setRegistryLabs(records.map((record) => record.definition))).catch(() => undefined);
  }, []);
  useEffect(() => {
    setTab(search.tab === "attach" || search.tab === "vectors" ? search.tab : "overview");
  }, [search.tab]);

  if (!hydrated) {
    return <main className="min-h-dvh bg-bg" />;
  }

  if (!startedAt) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-bg p-6 text-fg">
        <div className="max-w-md space-y-4 text-center">
          <p className="text-muted">Clock has not started.</p>
          <Link to="/" className="text-primary underline">
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <header className="flex flex-wrap items-center gap-3 border-b border-border bg-surface px-4 py-3">
        <Link to="/" className="font-mono text-xs tracking-widest text-primary uppercase">
          PhishLab
        </Link>
        <span className="hidden text-muted sm:inline">·</span>
        <span className="font-medium">{templateLab?.title ?? pack.name}</span>
        {callsign ? <span className="text-xs text-muted">{callsign}</span> : null}
        <span className="ml-auto flex items-center gap-4">
          <button
            type="button"
            className="min-h-10 rounded-md bg-primary px-3 text-sm font-medium text-bg"
            onClick={() => {
              submit();
              void nav({ to: "/debrief" });
            }}
          >
            Submit
          </button>
        </span>
      </header>
      <p className="border-b border-warn/30 bg-warn/10 px-4 py-1.5 text-[11px] text-warn">{LAB_BANNER}</p>

      <nav className="flex gap-1 overflow-x-auto border-b border-border px-2 py-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              if (t.id === "dashboard") {
                void nav({ to: "/" });
                return;
              }
              if (t.id === "labs") {
                void nav({ to: "/labs" });
                return;
              }
              if (t.id === "admin") {
                void nav({ to: "/admin" });
                return;
              }
              setTab(t.id);
            }}
            className={cn(
              "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm",
              tab === t.id ? "bg-raised text-fg" : "text-muted",
            )}
          >
            <t.icon className="size-4" />
            {t.label}
          </button>
        ))}
      </nav>

      <div className="flex-1">
        {tab === "overview" && <LabOverview pack={pack} definition={templateLab} sample={email} />}
        {tab === "engine" && <EnginePane sampleId={email?.sampleId} />}
        {tab === "attach" && <AttachPane sample={email} pack={pack} />}
        {tab === "vectors" && <VectorsPane pack={pack} sample={email} />}
      </div>
    </div>
  );
}

function LabOverview({ pack, definition, sample }: { pack: LabPack; definition?: LabDefinition; sample?: ExtractedSample }) {
  const answers = useLab((state) => state.answers);
  const setAnswer = useLab((state) => state.setAnswer);
  return (
    <main className="mx-auto grid max-w-5xl gap-6 p-4 sm:p-8">
      <section className="rounded-panel border border-border bg-surface p-6">
        <p className="font-mono text-xs tracking-[0.16em] text-primary uppercase">Lab scenario</p>
        <h1 className="mt-2 text-2xl font-semibold">{definition?.title ?? pack.name}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{definition?.description ?? pack.blurb}</p>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-panel border border-border bg-surface p-5"><h2 className="font-medium">Mission brief</h2><p className="mt-2 text-sm leading-relaxed text-muted">Work through the fictional evidence, inspect the training artifacts, and record your answers. Every item stays inside this simulation.</p></div>
        <div className="rounded-panel border border-border bg-surface p-5"><h2 className="font-medium">Available tools</h2><ul className="mt-3 space-y-2 text-sm text-muted"><li>Engine: analyze the shared template email and evidence.</li><li>Attachment: inspect or download the training fixture.</li><li>Other vectors: review SMS, QR, and vishing examples.</li></ul></div>
      </section>
      {sample && (
        <section className="space-y-3">
          <div>
            <p className="font-mono text-xs tracking-[0.16em] text-primary uppercase">Training email</p>
            <h2 className="mt-1 text-lg font-semibold">{sample.subject}</h2>
            <p className="mt-1 break-all text-sm text-muted">{sample.fromName} · {sample.fromAddr} → {sample.to}</p>
          </div>
          <EmailViewer sample={sample} />
        </section>
      )}
      {definition && <TaskList lab={definition} answers={answers} onCheck={setAnswer} />}
      <p className="text-sm text-muted">Choose a workflow tab above to begin the investigation.</p>
    </main>
  );
}

function InboxPane({
  samples,
  sample,
  sel,
  setSel,
}: {
  samples: ExtractedSample[];
  sample: ExtractedSample;
  sel: string;
  setSel: (id: string) => void;
}) {
  return (
    <div className="grid lg:grid-cols-[280px_1fr]">
      <aside className="border-b border-border lg:border-r lg:border-b-0">
        {samples.map((item) => (
          <button
            key={item.sampleId}
            type="button"
            onClick={() => setSel(item.sampleId)}
            className={cn(
              "flex w-full flex-col items-start gap-0.5 border-b border-border px-4 py-3 text-left",
              sel === item.sampleId ? "bg-raised" : "bg-transparent",
            )}
          >
            <div className="flex w-full items-center justify-between gap-2">
              <span className="truncate text-sm font-medium">{item.fromName}</span>
              <span className="font-mono text-[10px] text-muted">{item.folder}</span>
            </div>
            <span className="truncate text-xs text-fg">{item.subject}</span>
            <span className="line-clamp-1 text-xs text-muted">{item.fromAddr}</span>
          </button>
        ))}
      </aside>
      <article className="min-w-0 p-4 sm:p-6">
        <div className="mb-4"><h2 className="text-lg font-semibold">{sample.subject}</h2><p className="mt-1 break-all text-sm text-muted">{sample.fromName} · {sample.fromAddr} → {sample.to}</p><p className="font-mono text-xs text-muted">{sample.date}</p></div>
        <EmailViewer sample={sample} />
      </article>
    </div>
  );
}

function EnginePane({ sampleId }: { sampleId?: string }) {
  return <EngineConsole initialSampleId={sampleId} />;
}

function AttachPane({ sample, pack }: { sample?: ExtractedSample; pack: LabPack }) {
  const mark = useLab((s) => s.markAttach);
  const file = sample?.artifacts.find((artifact) => artifact.kind === "attachment");
  const attachmentLabel = file?.label ?? "training-attachment.html";
  const attachmentSource = pack.attachmentSource || "TRAINING SIMULATION\nNo attachment source is included in this lab template.";
  const [fixtureHash, setFixtureHash] = useState(file?.value ?? "");
  const [hash, setHash] = useState(file?.value ?? "");
  const [lookup, setLookup] = useState<{ local: boolean; remote?: { status: string; positives: number; total: number; permalink?: string }; error?: string } | null>(null);

  useEffect(() => {
    if (file?.value) {
      setFixtureHash(file.value);
      setHash(file.value);
      return;
    }
    void crypto.subtle.digest("SHA-256", new TextEncoder().encode(attachmentSource)).then((digest) => {
      const derived = Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
      setFixtureHash(derived);
      setHash((current) => current || derived);
    });
  }, [attachmentSource, file?.value]);

  async function inspectHash() {
    const normalized = hash.trim().toLowerCase();
    const local = Boolean(fixtureHash && fixtureHash.toLowerCase() === normalized);
    try {
      const response = await fetch(`/api/attachment-lookup?hash=${encodeURIComponent(normalized)}`);
      const result = (await response.json()) as { ok: boolean; data?: { status: string; positives: number; total: number; permalink?: string }; error?: string };
      setLookup({ local, remote: result.data, error: result.ok ? undefined : result.error });
    } catch {
      setLookup({ local, error: "VirusTotal lookup is unavailable in this environment." });
    }
    mark();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
      <h2 className="text-lg font-semibold">Attachment inspector</h2>
      <p className="text-sm text-muted">Engine provides the attachment SHA-256. Inspect that hash here; no attachment upload or download is required.</p>
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="font-mono text-sm">{attachmentLabel}{file ? ` · ${String(file.meta.sizeBytes)} bytes · ${String(file.meta.type)}` : " · source fixture"}</p>
        <button
          type="button"
          className="mt-3 min-h-10 rounded-md border border-border px-3 text-sm"
          onClick={mark}
        >
          Mark inspected
        </button>
        {fixtureHash && <><label className="mt-4 block text-sm"><span className="mb-1 block text-muted">Attachment SHA-256</span><input value={hash} onChange={(event) => setHash(event.target.value)} placeholder="64-character SHA-256" className="min-h-10 w-full rounded-md border border-border bg-raised px-3 font-mono text-xs" /></label><button type="button" onClick={() => void inspectHash()} disabled={hash.trim().length !== 64} className="mt-3 min-h-10 rounded-md bg-primary px-3 text-sm font-medium text-bg disabled:cursor-not-allowed disabled:opacity-50">Inspect hash</button></>}
        {lookup && <div className="mt-4 rounded-md border border-primary/40 bg-primary/5 p-3 text-xs"><p className="font-medium text-primary">Hash inspection</p><p className="mt-1">{lookup.local ? "Matches this lab's attachment fixture." : "Hash does not match this lab's fixture."}</p>{lookup.remote ? <p className="mt-1">VirusTotal: {lookup.remote.status} · {lookup.remote.positives}/{lookup.remote.total} detections {lookup.remote.permalink ? <a className="text-primary underline" href={lookup.remote.permalink} target="_blank" rel="noreferrer">Open report</a> : null}</p> : lookup.error ? <p className="mt-1 text-muted">{lookup.error}</p> : null}</div>}
      </div>
      <pre className="overflow-auto rounded-xl border border-border bg-raised p-4 font-mono text-[11px] leading-relaxed text-muted">
        {attachmentSource}
      </pre>
    </div>
  );
}

function VectorsPane({ pack, sample }: { pack: LabPack; sample?: ExtractedSample }) {
  const qrScanned = useLab((s) => s.qrScanned);
  const markQr = useLab((s) => s.markQr);
  const [smsReviewed, setSmsReviewed] = useState(false);
  const [voiceReviewed, setVoiceReviewed] = useState(false);
  const sampleUrl = sample?.artifacts.find((artifact) => artifact.kind === "url");
  const language = sample?.artifacts.find((artifact) => artifact.kind === "language");
  const smsBody = pack.sms?.body || `${sample?.fromName ?? "Training sender"}: review this message at ${sampleUrl?.value ?? "the training portal"}`;
  const voiceNote = pack.voice?.note || `A caller claims to represent ${sample?.fromName ?? "the sender"} and asks for an urgent account action.`;
  return (
    <div className="mx-auto grid max-w-3xl gap-4 p-4 sm:p-6">
      <section className="rounded-xl border border-border bg-surface p-5">
        <div className="mb-3 flex items-center gap-2">
          <QrCode className="size-4 text-primary" />
          <h2 className="font-medium">QR (quishing)</h2>
        </div>
        <p className="text-sm text-muted">Simulated QR artifact derived from the selected template email. Decode is local and does not use a camera or network request.</p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="rounded-md border border-border bg-raised p-4"><p className="font-mono text-xs text-muted">QR-TRAINING-{sample?.sampleId ?? "sample"}</p><p className="mt-1 text-xs text-muted">Payload sealed until decode</p></div><button type="button" className="min-h-11 rounded-md bg-primary px-4 text-sm font-medium text-bg" onClick={markQr}>Decode in lab</button>
        </div>
        {qrScanned && (
          <p className="mt-3 break-all font-mono text-xs text-primary">
            Payload: {sampleUrl?.value ?? pack.engine.url.final}
          </p>
        )}
      </section>
      <section className="rounded-xl border border-border bg-surface p-5">
        <div className="mb-3 flex items-center gap-2">
          <Radio className="size-4 text-primary" />
          <h2 className="font-medium">SMS</h2>
        </div>
        <p className="text-xs text-muted">Template-derived SMS simulation · from {pack.sms?.from ?? sample?.fromAddr ?? "unknown sender"}</p>
        <p className="mt-2 rounded-lg bg-raised p-3 text-sm">{smsBody}</p>
        <button type="button" onClick={() => setSmsReviewed(true)} className="mt-3 min-h-10 rounded-md border border-border px-3 text-sm">Analyze SMS indicators</button>
        {smsReviewed && <ul className="mt-3 space-y-1 text-xs text-warn"><li>Link is treated as inert training data.</li><li>Urgency score: {String(language?.meta.urgencyScore ?? "not provided")}/100.</li><li>Do not reply or call back from the message.</li></ul>}
      </section>
      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="font-medium">Callback / vishing simulation</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{voiceNote}</p>
        <button type="button" onClick={() => setVoiceReviewed(true)} className="mt-3 min-h-10 rounded-md border border-border px-3 text-sm">Review callback indicators</button>
        {voiceReviewed && <ul className="mt-3 space-y-1 text-xs text-warn"><li>Verify identity through a trusted channel.</li><li>Never disclose passwords or MFA codes.</li><li>Escalate the request as a training incident.</li></ul>}
      </section>
    </div>
  );
}

function ExamPane({
  submitted,
  labId,
  extra,
}: {
  submitted: boolean;
  labId: string;
  extra: { prompt: string; answer: string; points: number }[];
}) {
  const answers = useLab((s) => s.answers);
  const setAnswer = useLab((s) => s.setAnswer);
  const questions = mergedQuestions(labId, extra);
  const result = useMemo(
    () => computeScore(labId, extra, answers),
    [labId, extra, answers],
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <p className="text-sm text-muted">
        {questions.length} questions · {result.total} points. Submit from the header when done.
      </p>
      {questions.map((q, i) => (
        <fieldset key={q.id} className="space-y-2 rounded-xl border border-border bg-surface p-4">
          <legend className="px-1 text-sm font-medium">
            {i + 1}. {q.prompt}{" "}
            <span className="font-mono text-xs text-muted">{q.points} pts</span>
          </legend>
          <p className="text-xs text-muted">{q.hint}</p>
          {q.kind === "choice" && q.choices ? (
            <div className="space-y-2">
              {q.choices.map((c) => (
                <label key={c} className="flex min-h-11 cursor-pointer items-start gap-2 text-sm">
                  <input
                    type="radio"
                    name={q.id}
                    className="mt-1"
                    checked={answers[q.id] === c}
                    onChange={() => setAnswer(q.id, c)}
                    disabled={submitted}
                  />
                  <span>{c}</span>
                </label>
              ))}
            </div>
          ) : (
            <input
              className="min-h-11 w-full rounded-md border border-border bg-raised px-3 text-sm"
              value={answers[q.id] ?? ""}
              onChange={(e) => setAnswer(q.id, e.target.value)}
              disabled={submitted}
              placeholder="Answer"
            />
          )}
        </fieldset>
      ))}
      {submitted && (
        <p className="font-mono text-primary">
          Live tally {result.score}/{result.total}
        </p>
      )}
    </div>
  );
}
