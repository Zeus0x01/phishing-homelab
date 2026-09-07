import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  FileSearch,
  Inbox,
  QrCode,
  Radio,
  Shield,
} from "lucide-react";
import { getLab, LAB_BANNER, type LabEmail, type LabPack } from "@/data/campaign";
import { computeScore, mergedQuestions, useLab } from "@/lib/store";
import { Timer } from "@/components/timer";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/lab")({ component: Lab });

const tabs = [
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "engine", label: "Engine", icon: Activity },
  { id: "attach", label: "Attachment", icon: FileSearch },
  { id: "vectors", label: "Other vectors", icon: QrCode },
  { id: "exam", label: "Questions", icon: Shield },
] as const;

type TabId = (typeof tabs)[number]["id"];

function Lab() {
  const nav = useNavigate();
  const startedAt = useLab((s) => s.startedAt);
  const submitted = useLab((s) => s.submitted);
  const submit = useLab((s) => s.submit);
  const labId = useLab((s) => s.labId);
  const minutes = useLab((s) => s.minutes);
  const extra = useLab((s) => s.extra);
  const callsign = useLab((s) => s.callsign);
  const pack = getLab(labId);
  const [tab, setTab] = useState<TabId>("inbox");
  const [sel, setSel] = useState(pack.emails[0]?.id ?? "e1");
  const [hydrated, setHydrated] = useState(false);
  const email = pack.emails.find((e) => e.id === sel) ?? pack.emails[0];

  useEffect(() => setHydrated(true), []);
  useEffect(() => {
    setSel(pack.emails[0]?.id ?? "e1");
  }, [pack.id]);

  useEffect(() => setHydrated(true), []);

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
        <span className="font-medium">{pack.name}</span>
        {callsign ? <span className="text-xs text-muted">{callsign}</span> : null}
        <span className="ml-auto flex items-center gap-4">
          <Timer startedAt={startedAt} minutes={minutes} onExpire={() => submit()} />
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
            onClick={() => setTab(t.id)}
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
        {tab === "inbox" && email && (
          <InboxPane emails={pack.emails} email={email} sel={sel} setSel={setSel} />
        )}
        {tab === "engine" && <EnginePane pack={pack} />}
        {tab === "attach" && <AttachPane pack={pack} />}
        {tab === "vectors" && <VectorsPane pack={pack} />}
        {tab === "exam" && (
          <ExamPane submitted={submitted} labId={labId} extra={extra} />
        )}
      </div>
    </div>
  );
}

function AuthPill({ v, label }: { v: string; label: string }) {
  const ok = v === "pass";
  const bad = v === "fail";
  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 font-mono text-[10px] uppercase",
        ok && "bg-pass/15 text-pass",
        bad && "bg-crit/15 text-crit",
        !ok && !bad && "bg-muted/15 text-muted",
      )}
    >
      {label} {v}
    </span>
  );
}

function InboxPane({
  emails,
  email,
  sel,
  setSel,
}: {
  emails: LabEmail[];
  email: LabEmail;
  sel: string;
  setSel: (id: string) => void;
}) {
  const [showHdr, setShowHdr] = useState(true);
  return (
    <div className="grid lg:grid-cols-[280px_1fr]">
      <aside className="border-b border-border lg:border-r lg:border-b-0">
        {emails.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => setSel(e.id)}
            className={cn(
              "flex w-full flex-col items-start gap-0.5 border-b border-border px-4 py-3 text-left",
              sel === e.id ? "bg-raised" : "bg-transparent",
            )}
          >
            <div className="flex w-full items-center justify-between gap-2">
              <span className="truncate text-sm font-medium">{e.fromName}</span>
              <span className="font-mono text-[10px] text-muted">{e.folder}</span>
            </div>
            <span className="truncate text-xs text-fg">{e.subject}</span>
            <span className="line-clamp-1 text-xs text-muted">{e.preview}</span>
          </button>
        ))}
      </aside>
      <article className="min-w-0 p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap gap-2">
          <AuthPill label="spf" v={email.auth.spf} />
          <AuthPill label="dkim" v={email.auth.dkim} />
          <AuthPill label="dmarc" v={email.auth.dmarc} />
          <span className="rounded bg-raised px-1.5 py-0.5 font-mono text-[10px] text-muted uppercase">
            {email.kind}
          </span>
        </div>
        <h2 className="text-lg font-semibold">{email.subject}</h2>
        <p className="mt-1 break-all text-sm text-muted">
          {email.fromName} · {email.fromAddr} → {email.to}
        </p>
        <p className="font-mono text-xs text-muted">{email.date}</p>
        <div
          className="email-body mt-6 space-y-3 text-sm leading-relaxed [&_.urg]:font-medium [&_.urg]:text-crit [&_.mono]:break-all [&_.mono]:font-mono [&_.mono]:text-xs [&_.mono]:text-primary [&_a]:text-primary [&_a]:underline"
          dangerouslySetInnerHTML={{
            __html: email.html.replace(
              'data-href="lure"',
              'href="/web"',
            ),
          }}
        />
        {email.attachments.length > 0 && (
          <p className="mt-4 text-sm text-warn">
            Attachment: {email.attachments[0].name} — inspect in Attachment tab
          </p>
        )}
        <button
          type="button"
          className="mt-6 text-xs text-primary underline"
          onClick={() => setShowHdr((s) => !s)}
        >
          {showHdr ? "Hide" : "Show"} raw headers
        </button>
        {showHdr && (
          <pre className="mt-3 max-h-64 overflow-auto rounded-lg border border-border bg-raised p-3 font-mono text-[11px] leading-relaxed text-muted whitespace-pre-wrap">
            {email.headers}
          </pre>
        )}
      </article>
    </div>
  );
}

function EnginePane({ pack }: { pack: LabPack }) {
  const engine = pack.engine;
  return (
    <div className="mx-auto grid max-w-4xl gap-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-xl border border-border bg-surface p-5">
        <div>
          <p className="font-mono text-xs text-muted">Campaign {engine.campaignId}</p>
          <h2 className="text-xl font-semibold">Discover-Phish</h2>
          <p className="text-sm text-crit">{engine.status}</p>
        </div>
        <p className="font-mono text-4xl font-medium tabular-nums text-primary">
          {engine.score}
          <span className="text-base text-muted">/100</span>
        </p>
      </div>
      <section className="rounded-xl border border-border bg-surface p-5">
        <h3 className="mb-3 text-sm font-medium">Techniques</h3>
        <ul className="flex flex-wrap gap-2">
          {engine.techniques.map((t) => (
            <li key={t} className="rounded-md bg-raised px-2 py-1 text-xs text-muted">
              {t}
            </li>
          ))}
        </ul>
      </section>
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="mb-3 text-sm font-medium">URL chain</h3>
          <ol className="space-y-2 font-mono text-xs break-all text-primary">
            <li>0 {engine.url.original}</li>
            <li>1 {engine.url.hop1}</li>
            <li>2 {engine.url.final}</li>
          </ol>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="mb-3 text-sm font-medium">Infrastructure</h3>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
            <dt className="text-muted">IP</dt>
            <dd className="font-mono">{engine.infra.ip}</dd>
            <dt className="text-muted">ASN</dt>
            <dd>{engine.infra.asn}</dd>
            <dt className="text-muted">Domain</dt>
            <dd className="font-mono">{engine.infra.domain}</dd>
            <dt className="text-muted">Created</dt>
            <dd>
              {engine.infra.created} ({engine.infra.ageDays} days)
            </dd>
            <dt className="text-muted">SSL</dt>
            <dd>{engine.infra.ssl}</dd>
            <dt className="text-muted">Registrar</dt>
            <dd>{engine.infra.registrar} · privacy {engine.infra.privacy ? "on" : "off"}</dd>
          </dl>
        </div>
      </section>
      <p className="text-sm text-muted">{engine.sandbox} Similar mails in org: {engine.similar}.</p>
    </div>
  );
}

function AttachPane({ pack }: { pack: LabPack }) {
  const mark = useLab((s) => s.markAttach);
  const file = pack.emails.flatMap((e) => e.attachments)[0];
  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
      <h2 className="text-lg font-semibold">Attachment inspector</h2>
      <p className="text-sm text-muted">
        Static sample only — it does not execute.
      </p>
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="font-mono text-sm">
          {file ? `${file.name} · ${file.size} · ${file.type}` : "No file in this lab"}
        </p>
        <button
          type="button"
          className="mt-3 min-h-10 rounded-md border border-border px-3 text-sm"
          onClick={mark}
        >
          Mark inspected
        </button>
      </div>
      <pre className="overflow-auto rounded-xl border border-border bg-raised p-4 font-mono text-[11px] leading-relaxed text-muted">
        {pack.attachmentSource}
      </pre>
    </div>
  );
}

function VectorsPane({ pack }: { pack: LabPack }) {
  const qrScanned = useLab((s) => s.qrScanned);
  const markQr = useLab((s) => s.markQr);
  const { sms, voice } = pack;
  return (
    <div className="mx-auto grid max-w-3xl gap-4 p-4 sm:p-6">
      <section className="rounded-xl border border-border bg-surface p-5">
        <div className="mb-3 flex items-center gap-2">
          <QrCode className="size-4 text-primary" />
          <h2 className="font-medium">QR (quishing)</h2>
        </div>
        <p className="text-sm text-muted">
          Printed as a benefits enrollment code. Lab decode only — no camera required.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div
            className="grid size-28 grid-cols-7 gap-0.5 rounded-md bg-fg p-2"
            aria-hidden
          >
            {Array.from({ length: 49 }).map((_, i) => (
              <span
                key={i}
                className={cn("rounded-[1px]", (i * 7 + 3) % 5 === 0 ? "bg-bg" : "bg-fg")}
              />
            ))}
          </div>
          <button type="button" className="min-h-11 rounded-md bg-primary px-4 text-sm font-medium text-bg" onClick={markQr}>
            Decode in lab
          </button>
        </div>
        {qrScanned && (
          <p className="mt-3 break-all font-mono text-xs text-primary">
            Payload: {pack.engine.url.final}
          </p>
        )}
      </section>
      <section className="rounded-xl border border-border bg-surface p-5">
        <div className="mb-3 flex items-center gap-2">
          <Radio className="size-4 text-primary" />
          <h2 className="font-medium">SMS</h2>
        </div>
        <p className="text-xs text-muted">{sms.time} · from {sms.from}</p>
        <p className="mt-2 rounded-lg bg-raised p-3 text-sm">{sms.body}</p>
      </section>
      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="font-medium">Callback / vishing ticket {voice.ticket}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{voice.note}</p>
      </section>
      <p className="text-sm">
        Open the cloned portal:{" "}
        <Link to="/web" className="text-primary underline">
          /web
        </Link>
      </p>
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
