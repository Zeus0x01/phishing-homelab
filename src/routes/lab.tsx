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
    void listLabs()
      .then((records) => setRegistryLabs(records.map((record) => record.definition)))
      .catch(() => undefined);
  }, []);

  if (!hydrated) {
    return <div className="min-h-dvh bg-bg p-8 text-sm text-muted">Loading session…</div>;
  }

  if (!startedAt) {
    return (
      <main className="mx-auto max-w-lg space-y-4 p-8">
        <p className="text-sm text-muted">No active attempt. Start a lab from the catalog.</p>
        <Link to="/labs" className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-medium text-bg">
          Open labs
        </Link>
      </main>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-primary">{pack.name}</p>
          <p className="text-sm text-muted">{callsign || "trainee"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="min-h-10 rounded-md bg-primary px-4 text-sm font-medium text-bg"
            onClick={() => {
              submit();
              void nav({ to: "/debrief" });
            }}
          >
            Submit
          </button>
        </div>
      </header>

      <nav className="flex gap-1 overflow-x-auto border-b border-border px-2 py-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              if ("route" in t && t.route) {
                void nav({ to: t.route });
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
  const extra = useLab((state) => state.extra);
  return (
    <main className="mx-auto grid max-w-5xl gap-6 p-4 sm:p-8">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-primary">Lab overview</p>
        <h1 className="mt-2 text-2xl font-semibold">{definition?.title ?? pack.name}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{definition?.description ?? pack.blurb}</p>
        <p className="mt-2 text-xs text-warn">{LAB_BANNER}</p>
      </div>
      {sample ? <EmailViewer sample={sample} /> : null}
      {definition && <TaskList lab={definition} answers={answers} onCheck={setAnswer} extra={extra} />}
      {!definition ? (
        <ExamPane submitted={useLab.getState().submitted} labId={pack.id} extra={extra} />
      ) : null}
    </main>
  );
}

function EnginePane({ sampleId }: { sampleId?: string }) {
  return <EngineConsole initialSampleId={sampleId} />;
}

function AttachPane({ sample, pack }: { sample?: ExtractedSample; pack: LabPack }) {
  const mark = useLab((s) => s.markAttach);
  return (
    <main className="mx-auto max-w-3xl space-y-4 p-4 sm:p-8">
      <h2 className="text-lg font-semibold">Attachment review</h2>
      <p className="text-sm text-muted">Metadata only — no binaries are stored or executed.</p>
      {sample?.artifacts
        .filter((a) => a.kind === "attachment")
        .map((a) => (
          <article key={a.id} className="rounded-xl border border-border bg-surface p-4 text-sm">
            <p className="font-medium">{a.label}</p>
            <p className="mt-1 font-mono text-xs text-muted">{a.value}</p>
            <button type="button" className="mt-3 text-xs text-primary underline" onClick={() => mark()}>
              Mark inspected
            </button>
          </article>
        ))}
      {!sample && <p className="text-sm text-muted">No attachment artifacts on this template.</p>}
      <p className="text-xs text-muted">Pack vectors: {pack.vectors?.join(", ") || "n/a"}</p>
    </main>
  );
}

function VectorsPane({ pack, sample }: { pack: LabPack; sample?: ExtractedSample }) {
  const qrScanned = useLab((s) => s.qrScanned);
  const markQr = useLab((s) => s.markQr);
  const [voiceReviewed, setVoiceReviewed] = useState(false);
  return (
    <div className="mx-auto grid max-w-3xl gap-4 p-4 sm:p-8">
      <section className="rounded-xl border border-border bg-surface p-4">
        <div className="mb-2 flex items-center gap-2">
          <QrCode className="size-4 text-primary" />
          <h2 className="font-medium">QR / alternate vector</h2>
        </div>
        <p className="text-sm text-muted">Simulated only. Mark scanned when you have reviewed the training vector.</p>
        <button type="button" className="mt-3 min-h-10 rounded-md border border-border px-3 text-sm" onClick={() => markQr()}>
          {qrScanned ? "Scanned (training)" : "Mark QR reviewed"}
        </button>
      </section>
      <section className="rounded-xl border border-border bg-surface p-4">
        <div className="mb-2 flex items-center gap-2">
          <Radio className="size-4 text-primary" />
          <h2 className="font-medium">Voice / callback indicators</h2>
        </div>
        <button
          type="button"
          className="min-h-10 rounded-md border border-border px-3 text-sm"
          onClick={() => setVoiceReviewed(true)}
        >
          Review callback indicators
        </button>
        {voiceReviewed && (
          <ul className="mt-3 space-y-1 text-xs text-warn">
            <li>Verify identity through a trusted channel.</li>
            <li>Never disclose passwords or MFA codes.</li>
            <li>Escalate the request as a training incident.</li>
          </ul>
        )}
        <p className="mt-2 text-xs text-muted">Pack notes: {pack.vectors?.join(" · ") || sample?.subject || "n/a"}</p>
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
  const result = useMemo(() => computeScore(labId, extra, answers), [labId, extra, answers]);

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
