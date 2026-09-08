import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clipboard,
  ExternalLink,
  FileWarning,
  GitBranch,
  Paperclip,
  Search,
  ShieldAlert,
} from "lucide-react";
import { EmailViewer } from "@/components/engine/email-viewer";
import { collectAllSamples, type Artifact } from "@/lib/labs/artifacts";
import { loadFileLabs } from "@/lib/labs/loader";
import type { LabDefinition } from "@/lib/labs/schema";
import { evaluateRules, builtinRules, type DetectionRule, type RuleHit } from "@/lib/engine/rules";
import { buildAttackGraph } from "@/lib/engine/graph";
import { runHuntQuery } from "@/lib/engine/query";
import {
  addIoc,
  engineDashboard,
  listIocs,
  listLabs,
  listRules,
  listSavedQueries,
  recordEngineEvent,
  recordVerdict,
  saveQuery,
  saveRule,
} from "@/lib/labs/service";
import { cn } from "@/lib/cn";
import { Group, Panel, Separator } from "react-resizable-panels";

type View = "sample" | "artifacts" | "graph";
type Verdict = "phishing" | "quarantine" | "release" | "escalate";

const verdicts: { id: Verdict; label: string }[] = [
  { id: "phishing", label: "Mark phishing" },
  { id: "quarantine", label: "Quarantine" },
  { id: "release", label: "Release" },
  { id: "escalate", label: "Escalate" },
];

const RISKY_EXTS = new Set([
  "exe",
  "scr",
  "js",
  "jse",
  "vbs",
  "vbe",
  "bat",
  "cmd",
  "ps1",
  "msi",
  "iso",
  "img",
  "html",
  "htm",
  "hta",
  "lnk",
  "docm",
  "xlsm",
  "pptm",
  "zip",
  "rar",
  "7z",
]);

function virusTotalUrl(sha256: string): string {
  return `https://www.virustotal.com/gui/file/${encodeURIComponent(sha256)}`;
}

function formatBytes(n: number): string {
  if (!n || n <= 0) return "size unknown (training metadata)";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function EngineConsole({ initialSampleId }: { initialSampleId?: string }) {
  const [labs, setLabs] = useState<LabDefinition[]>(() => loadFileLabs().map((record) => record.definition));
  const samples = useMemo(() => collectAllSamples(labs), [labs]);
  const initialMatch = samples.find(
    (item) => item.sampleId === initialSampleId || item.sampleId.endsWith(`:${initialSampleId ?? ""}`),
  );
  const [sampleId, setSampleId] = useState(initialMatch?.sampleId ?? samples[0]?.sampleId ?? "");
  const [view, setView] = useState<View>("sample");
  const [query, setQuery] = useState("");
  const [iocText, setIocText] = useState("");
  const [iocs, setIocs] = useState<{ kind: string; value: string; note: string }[]>([]);
  const [savedQueries, setSavedQueries] = useState<{ name: string; query: string }[]>([]);
  const [metrics, setMetrics] = useState<{
    samplesAnalyzed: number;
    detectionRate: number;
    falsePositives: number;
    avgTimeToVerdictMs: number;
  } | null>(null);
  const [ruleField, setRuleField] = useState("url.tld");
  const [ruleOp, setRuleOp] = useState<"in" | "contains" | "eq" | "gt">("in");
  const [ruleValue, setRuleValue] = useState("xyz,top");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [rules, setRules] = useState<DetectionRule[]>(builtinRules);
  const [notes, setNotes] = useState("");
  const [audit, setAudit] = useState<{ action: Verdict; at: string }[]>([]);
  const sample = samples.find((item) => item.sampleId === sampleId) ?? samples[0];
  const hits = useMemo(() => (sample ? evaluateRules(sample, rules, iocs) : []), [sample, rules, iocs]);
  const huntHits = useMemo(() => runHuntQuery(query, samples), [query, samples]);
  const graph = useMemo(() => buildAttackGraph(samples), [samples]);
  const selectedLab = labs.find((lab) => lab.id === sample?.labId);

  useEffect(() => {
    void listLabs()
      .then((records) => setLabs(records.map((record) => record.definition)))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    void listRules()
      .then(setRules)
      .catch(() => undefined);
  }, []);

  const saveVerdict = useCallback(
    async (action: Verdict) => {
      if (!sample) return;
      setVerdict(action);
      setAudit((entries) => [{ action, at: new Date().toLocaleTimeString() }, ...entries]);
      try {
        await recordVerdict({ data: { sampleId: sample.sampleId, labId: sample.labId, action } });
      } catch {
        // The in-app verdict remains visible when the optional local database is unavailable.
      }
    },
    [sample],
  );

  useEffect(() => {
    void Promise.all([listIocs(), listSavedQueries(), engineDashboard()])
      .then(([loadedIocs, loadedQueries, dashboard]) => {
        setIocs(loadedIocs);
        setSavedQueries(loadedQueries);
        setMetrics(dashboard);
      })
      .catch(() => undefined);
    if (sample)
      void recordEngineEvent({
        data: { event: "sample_opened", sampleId: sample.sampleId, labId: sample.labId },
      }).catch(() => undefined);
  }, [sample]);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      const action = { "1": "phishing", "2": "quarantine", "3": "release", "4": "escalate" }[event.key] as
        | Verdict
        | undefined;
      if (action) void saveVerdict(action);
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [sample, saveVerdict]);

  function selectSample(id: string) {
    setSampleId(id);
    setVerdict(null);
    setView("sample");
  }

  async function addIndicator() {
    const value = iocText.trim();
    if (!value) return;
    try {
      await addIoc({
        data: {
          kind: value.includes("@") ? "sender" : value.length > 40 ? "hash" : "domain",
          value,
          note: "Analyst training IOC",
        },
      });
      setIocText("");
      setIocs(await listIocs());
    } catch {
      /* optional database */
    }
  }

  async function composeRule() {
    try {
      await saveRule({
        data: {
          rule: {
            id: `custom-${Date.now()}`,
            name: `${ruleField} ${ruleOp} ${ruleValue}`,
            enabled: true,
            logic: "and",
            pack: "custom",
            conditions: [{ id: "condition-1", field: ruleField, op: ruleOp, value: ruleValue }],
          },
        },
      });
      setIocText("Rule saved to the custom training pack.");
    } catch {
      setIocText("Rule could not be saved in this session.");
    }
  }

  async function saveCurrentQuery() {
    if (!query.trim()) return;
    try {
      await saveQuery({ data: { name: query.trim().slice(0, 40), query: query.trim() } });
      setSavedQueries(await listSavedQueries());
    } catch {
      /* optional database */
    }
  }

  if (!sample) {
    return <p className="p-6 text-sm text-muted">No validated email samples are available.</p>;
  }

  return (
    <div className="mx-auto grid max-w-[1500px] gap-4 p-4 sm:p-6">
      <div className="rounded-xl border border-warn/40 bg-warn/10 p-4 text-sm text-warn">
        <strong>TRAINING SIMULATION</strong> · Discover console uses fictional lab templates only. No message, URL,
        attachment, or form data leaves this app.
      </div>
      <Group
        id="engine-console"
        orientation="horizontal"
        defaultLayout={{ samples: 20, workspace: 80 }}
        className="min-h-[720px] overflow-hidden rounded-panel border border-border bg-surface lg:flex"
      >
        <Panel id="samples" defaultSize="20" minSize="18" maxSize="35" className="min-w-0">
          <aside className="h-full overflow-auto p-3">
            <div className="mb-3 flex items-center gap-2 px-2 text-sm font-medium">
              <Activity className="size-4 text-primary" /> Sample inbox
            </div>
            <div className="space-y-1">
              {samples.map((item) => (
                <button
                  key={item.sampleId}
                  type="button"
                  onClick={() => selectSample(item.sampleId)}
                  className={cn(
                    "w-full rounded-lg p-3 text-left",
                    item.sampleId === sample.sampleId ? "bg-raised" : "hover:bg-raised/60",
                  )}
                >
                  <span className="block truncate text-sm font-medium">{item.subject}</span>
                  <span className="mt-1 block truncate text-xs text-muted">{item.fromAddr}</span>
                  <span className="mt-1 block text-[10px] uppercase text-primary">{item.labTitle}</span>
                </button>
              ))}
            </div>
          </aside>
        </Panel>
        <Separator id="sample-separator" className="w-1 bg-border transition-colors hover:bg-primary" />
        <Panel id="workspace" defaultSize="80" minSize="55" className="min-w-0">
          <section className="min-w-0 space-y-4 overflow-auto p-1">
            <header className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
                  {selectedLab?.category} · {selectedLab?.difficulty} · {sample.folder}
                </p>
                <h2 className="mt-1 text-lg font-semibold">{sample.subject}</h2>
                <p className="text-xs text-muted">
                  {sample.fromName} <{sample.fromAddr}> · Reply-To: {sample.replyTo}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={cn(
                    "rounded px-2 py-1",
                    hits.length >= 3
                      ? "bg-crit/15 text-crit"
                      : hits.length
                        ? "bg-warn/15 text-warn"
                        : "bg-pass/15 text-pass",
                  )}
                >
                  {hits.length >= 3 ? "high risk" : hits.length ? "review" : "low risk"}
                </span>
                <span className="rounded bg-raised px-2 py-1 text-muted">{hits.length} detections</span>
                {verdict ? <span className="rounded bg-primary/15 px-2 py-1 text-primary">{verdict}</span> : null}
              </div>
            </header>
            <div className="flex flex-wrap gap-1 border-b border-border">
              {(["sample", "artifacts", "graph"] as View[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setView(item)}
                  className={cn(
                    "min-h-10 rounded-t-md px-3 text-sm capitalize",
                    view === item ? "bg-surface text-fg" : "text-muted",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
            {view === "sample" && <EmailViewer sample={sample} />}
            {view === "artifacts" && <ArtifactPanel sample={sample} />}
            {view === "graph" && <GraphPanel graph={graph} />}
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <section className="rounded-xl border border-border bg-surface p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Search className="size-4 text-primary" />
                  <h3 className="text-sm font-medium">Threat hunting</h3>
                </div>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="domain:secure-* · tld:xyz · header.reply-to != sender"
                  className="min-h-10 w-full rounded-md border border-border bg-raised px-3 font-mono text-xs"
                />
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span>
                    {huntHits.length} matching template sample{huntHits.length === 1 ? "" : "s"}
                  </span>
                  <button type="button" onClick={() => void saveCurrentQuery()} className="text-primary underline">
                    Save query
                  </button>
                </div>
                <div className="mt-2 space-y-1 text-xs">
                  {huntHits.slice(0, 4).map((hit) => (
                    <button
                      key={hit.sample.sampleId}
                      type="button"
                      onClick={() => selectSample(hit.sample.sampleId)}
                      className="block w-full truncate text-left text-primary hover:underline"
                    >
                      {hit.sample.subject} · {hit.why}
                    </button>
                  ))}
                </div>
                {savedQueries.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {savedQueries.slice(0, 5).map((saved) => (
                      <button
                        key={`${saved.name}:${saved.query}`}
                        type="button"
                        onClick={() => setQuery(saved.query)}
                        className="rounded bg-raised px-2 py-1 text-[10px] text-muted"
                      >
                        {saved.name}
                      </button>
                    ))}
                  </div>
                )}
              </section>
              <section className="rounded-xl border border-border bg-surface p-4">
                <h3 className="mb-3 text-sm font-medium">Simulated response</h3>
                <div className="flex flex-wrap gap-2">
                  {verdicts.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => void saveVerdict(item.id)}
                      className={cn(
                        "min-h-10 rounded-md border px-3 text-xs",
                        verdict === item.id ? "border-primary bg-primary/10 text-primary" : "border-border",
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted">Actions update an in-app audit trail only.</p>
              </section>
            </div>
            <section className="grid gap-4 lg:grid-cols-2">
              <section className="rounded-xl border border-border bg-surface p-4">
                <h3 className="mb-3 text-sm font-medium">No-code rule builder</h3>
                <div className="grid gap-2 sm:grid-cols-3">
                  <select
                    value={ruleField}
                    onChange={(event) => setRuleField(event.target.value)}
                    className="min-h-10 rounded-md border border-border bg-raised px-2 text-xs"
                  >
                    <option value="url.tld">URL TLD</option>
                    <option value="sender.domain">Sender domain</option>
                    <option value="attachment.ext">Attachment extension</option>
                    <option value="tone.urgency">Urgency score</option>
                  </select>
                  <select
                    value={ruleOp}
                    onChange={(event) => setRuleOp(event.target.value as typeof ruleOp)}
                    className="min-h-10 rounded-md border border-border bg-raised px-2 text-xs"
                  >
                    <option value="in">is in</option>
                    <option value="contains">contains</option>
                    <option value="eq">equals</option>
                    <option value="gt">greater than</option>
                  </select>
                  <input
                    value={ruleValue}
                    onChange={(event) => setRuleValue(event.target.value)}
                    className="min-h-10 rounded-md border border-border bg-raised px-2 font-mono text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void composeRule()}
                  className="mt-3 min-h-10 rounded-md border border-primary px-3 text-xs text-primary"
                >
                  Save custom rule
                </button>
              </section>
              <section className="rounded-xl border border-border bg-surface p-4">
                <h3 className="mb-3 text-sm font-medium">Training engine analytics</h3>
                {metrics ? (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <Metric label="Analyzed" value={metrics.samplesAnalyzed} />
                    <Metric label="Detection rate" value={`${metrics.detectionRate}%`} />
                    <Metric label="False positives" value={metrics.falsePositives} />
                    <Metric label="Avg time to verdict" value={`${Math.round(metrics.avgTimeToVerdictMs / 1000)}s`} />
                  </div>
                ) : (
                  <p className="text-xs text-muted">Analytics become available after the local store is initialized.</p>
                )}
              </section>
            </section>
            <section className="rounded-xl border border-border bg-surface p-4">
              <div className="mb-3 flex items-center gap-2">
                <ShieldAlert className="size-4 text-crit" />
                <h3 className="text-sm font-medium">Detection evidence</h3>
                <span className="ml-auto text-xs text-muted">{rules.length} active rules</span>
              </div>
              {hits.length === 0 ? (
                <p className="text-sm text-muted">No active rules matched this sample.</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {hits.map((hit) => (
                    <RuleHitCard key={hit.rule.id} hit={hit} onInspect={() => setView("artifacts")} />
                  ))}
                </div>
              )}
            </section>
            <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <div className="rounded-xl border border-border bg-surface p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Clipboard className="size-4 text-primary" />
                  <h3 className="text-sm font-medium">Analyst notes</h3>
                </div>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Record investigation reasoning for this training case..."
                  className="min-h-24 w-full resize-y rounded-md border border-border bg-raised p-3 text-sm"
                />
                <p className="mt-2 text-[11px] text-muted">
                  Session-only notes. They are never sent with the sample or stored as credentials.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-4">
                <h3 className="mb-3 text-sm font-medium">Case activity</h3>
                {audit.length ? (
                  <ul className="space-y-2 text-xs">
                    {audit.map((entry, index) => (
                      <li
                        key={`${entry.at}-${index}`}
                        className="flex items-center justify-between rounded bg-raised px-3 py-2"
                      >
                        <span className="text-primary">{entry.action}</span>
                        <span className="font-mono text-muted">{entry.at}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted">No response action recorded for this sample.</p>
                )}
              </div>
            </section>
            <p className="text-xs text-muted">
              {iocText ? `IOC staging: ${iocText}` : "IOC matching is available from the template-backed analyst service."}
            </p>
            <div className="flex gap-2">
              <input
                aria-label="Training IOC staging"
                value={iocText}
                onChange={(event) => setIocText(event.target.value)}
                placeholder="Add a domain, sender, or hash to the training IOC list"
                className="min-h-9 min-w-0 flex-1 rounded-md border border-border bg-raised px-3 text-xs"
              />
              <button
                type="button"
                onClick={() => void addIndicator()}
                className="min-h-9 rounded-md border border-border px-3 text-xs"
              >
                Add IOC
              </button>
            </div>
          </section>
        </Panel>
      </Group>
    </div>
  );
}

function RuleHitCard({ hit, onInspect }: { hit: RuleHit; onInspect: () => void }) {
  return (
    <article className="rounded-lg border border-crit/30 bg-crit/5 p-3">
      <button type="button" onClick={onInspect} className="text-left text-sm font-medium text-crit hover:underline">
        {hit.rule.name}
      </button>
      <ul className="mt-2 space-y-1 text-xs text-muted">
        {hit.matched.map((e) => (
          <li key={`${e.conditionId}:${e.artifactId}`}>
            <CheckCircle2 className="mr-1 inline size-3 text-pass" />
            {e.evidence}
          </li>
        ))}
      </ul>
    </article>
  );
}

function AttachmentCard({ artifact }: { artifact: Artifact }) {
  const ext = String(artifact.meta.ext ?? "");
  const sha = String(artifact.meta.sha256 ?? artifact.value);
  const sizeBytes = Number(artifact.meta.sizeBytes ?? 0);
  const type = String(artifact.meta.type ?? "application/octet-stream");
  const risky = RISKY_EXTS.has(ext.toLowerCase());
  const validHash = /^[a-f0-9]{64}$/i.test(sha);

  return (
    <article
      className={cn(
        "rounded-lg border p-4",
        risky ? "border-crit/40 bg-crit/5" : "border-border bg-surface",
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("rounded-md p-2", risky ? "bg-crit/15 text-crit" : "bg-raised text-primary")}>
          {risky ? <FileWarning className="size-5" /> : <Paperclip className="size-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{artifact.label}</p>
          <p className="mt-1 text-[11px] text-muted">
            {type} · {formatBytes(sizeBytes)}
            {ext ? ` · .${ext}` : ""}
            {risky ? " · elevated-risk extension" : ""}
          </p>
          <p className="mt-2 break-all font-mono text-[10px] text-muted">SHA-256: {sha}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {validHash ? (
              <a
                href={virusTotalUrl(sha)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-border px-3 text-xs text-primary hover:bg-raised"
              >
                <ExternalLink className="size-3.5" />
                Open on VirusTotal
              </a>
            ) : (
              <span className="text-[11px] text-muted">Hash not in SHA-256 format — VT link skipped</span>
            )}
            <button
              type="button"
              className="inline-flex min-h-9 items-center rounded-md border border-border px-3 text-xs"
              onClick={() => void navigator.clipboard.writeText(sha)}
            >
              Copy hash
            </button>
          </div>
          <p className="mt-2 text-[10px] text-muted">
            Lookup is by hash only (no file upload). Fictional training hashes may show "not found" on VirusTotal — that is
            expected.
          </p>
        </div>
      </div>
    </article>
  );
}

function ArtifactPanel({ sample }: { sample: ReturnType<typeof collectAllSamples>[number] }) {
  const attachments = sample.artifacts.filter((a) => a.kind === "attachment");
  const others = sample.artifacts.filter((a) => a.kind !== "attachment");

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-border bg-surface p-4">
        <div className="mb-3 flex items-center gap-2">
          <Paperclip className="size-4 text-primary" />
          <h3 className="text-sm font-medium">Attachments</h3>
          <span className="ml-auto text-xs text-muted">{attachments.length} file{attachments.length === 1 ? "" : "s"}</span>
        </div>
        {attachments.length === 0 ? (
          <p className="text-sm text-muted">No attachment metadata on this template sample.</p>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {attachments.map((artifact) => (
              <AttachmentCard key={artifact.id} artifact={artifact} />
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-2 sm:grid-cols-2">
        {others.map((artifact) => (
          <article key={artifact.id} className="rounded-lg border border-border bg-surface p-3">
            <p className="text-[10px] uppercase tracking-wide text-primary">{artifact.kind}</p>
            <p className="mt-1 break-all font-mono text-xs">
              {artifact.label}: {artifact.value}
            </p>
            <p className="mt-1 break-all text-[10px] text-muted">
              {Object.entries(artifact.meta)
                .map(([key, value]) => `${key}=${value}`)
                .join(" · ")}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

function GraphPanel({ graph }: { graph: ReturnType<typeof buildAttackGraph> }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-center gap-2">
        <GitBranch className="size-4 text-primary" />
        <h3 className="text-sm font-medium">Attack graph · template relationships</h3>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {graph.nodes.map((node) => (
          <div key={node.id} className="rounded-md bg-raised p-2 text-xs">
            <span className="mr-2 text-[10px] uppercase text-primary">{node.kind}</span>
            {node.label}
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">
        {graph.edges.length} static relationships across {graph.nodes.length} nodes. No network lookups are performed.
      </p>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md bg-raised p-2">
      <p className="text-muted">{label}</p>
      <p className="mt-1 font-mono text-lg text-primary">{value}</p>
    </div>
  );
}
