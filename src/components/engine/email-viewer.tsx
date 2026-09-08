import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Copy, ExternalLink, Paperclip, Shield } from "lucide-react";
import type { ExtractedSample } from "@/lib/labs/artifacts";
import { sanitizeTrainingHtml } from "@/lib/labs/sanitize";
import { cn } from "@/lib/cn";

type MailTab = "rendered" | "headers" | "raw" | "urls";

function authTone(value: string): string {
  const v = value.toLowerCase();
  if (v === "pass") return "bg-pass/15 text-pass border-pass/30";
  if (v === "fail") return "bg-crit/15 text-crit border-crit/30";
  return "bg-warn/15 text-warn border-warn/30";
}

function AuthPill({ label, value }: { label: string; value: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-[10px] uppercase", authTone(value))}>
      <Shield className="size-3" />
      {label}={value}
    </span>
  );
}

function copyText(text: string) {
  void navigator.clipboard.writeText(text).catch(() => undefined);
}

export function EmailViewer({ sample }: { sample: ExtractedSample }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<MailTab>("rendered");
  const sanitized = useMemo(() => sanitizeTrainingHtml(sample.html), [sample.html]);

  const authArtifacts = sample.artifacts.filter((a) => a.kind === "auth");
  const spf = authArtifacts.find((a) => a.meta.protocol === "spf")?.value ?? "none";
  const dkim = authArtifacts.find((a) => a.meta.protocol === "dkim")?.value ?? "none";
  const dmarc = authArtifacts.find((a) => a.meta.protocol === "dmarc")?.value ?? "none";

  const urlArtifacts = sample.artifacts.filter((a) => a.kind === "url");
  const attachments = sample.artifacts.filter((a) => a.kind === "attachment");
  const replyTo = sample.artifacts.find((a) => a.kind === "reply-to");
  const replyMismatch = Boolean(replyTo?.meta.mismatch);

  const tabs: { id: MailTab; label: string }[] = [
    { id: "rendered", label: "Rendered" },
    { id: "headers", label: "Headers" },
    { id: "raw", label: "Raw source" },
    { id: "urls", label: `URLs (${urlArtifacts.length})` },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-raised/40 px-3 py-2">
        <AuthPill label="spf" value={String(spf)} />
        <AuthPill label="dkim" value={String(dkim)} />
        <AuthPill label="dmarc" value={String(dmarc)} />
        {replyMismatch ? (
          <span className="rounded-md border border-warn/40 bg-warn/10 px-2 py-1 text-[10px] uppercase text-warn">
            Reply-To domain mismatch
          </span>
        ) : null}
        <button
          type="button"
          onClick={() => copyText(tab === "headers" ? sample.headers : sample.rawSource)}
          className="ml-auto inline-flex min-h-8 items-center gap-1 rounded-md border border-border px-2 text-[11px] text-muted hover:text-fg"
          title="Copy headers or raw source"
        >
          <Copy className="size-3" /> Copy {tab === "rendered" || tab === "urls" ? "headers" : tab}
        </button>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-border p-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "min-h-10 rounded-md px-3 text-sm",
              tab === t.id ? "bg-raised text-fg" : "text-muted hover:text-fg",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "rendered" ? (
        <div className="relative">
          <iframe
            title="Sandboxed training message"
            sandbox=""
            referrerPolicy="no-referrer"
            srcDoc={sanitized.srcDoc}
            className="h-[420px] w-full bg-fg"
          />
          <div className="border-t border-border p-3">
            <p className="text-xs font-medium text-muted">Links extracted from body (template only)</p>
            <ul className="mt-2 space-y-2 font-mono text-xs break-all">
              {sanitized.links.length === 0 ? (
                <li className="text-muted">No links in rendered body.</li>
              ) : (
                sanitized.links.map((l) => (
                  <li key={l.href} className="flex flex-wrap items-center gap-2 rounded-md bg-raised/60 px-2 py-1.5">
                    <span className="text-fg">{l.text || "(no text)"}</span>
                    <span className="text-muted">→</span>
                    <span className="text-primary">{l.href}</span>
                    <button
                      type="button"
                      onClick={() => void navigate({ to: "/web" })}
                      className="inline-flex items-center gap-1 rounded border border-primary/40 px-2 py-1 font-sans text-[11px] text-primary"
                    >
                      <ExternalLink className="size-3" /> Training page
                    </button>
                    <button
                      type="button"
                      onClick={() => copyText(l.href)}
                      className="rounded border border-border px-2 py-1 font-sans text-[11px] text-muted"
                    >
                      Copy URL
                    </button>
                  </li>
                ))
              )}
            </ul>

            {attachments.length > 0 ? (
              <div className="mt-3">
                <p className="text-xs font-medium text-muted">Attachments (metadata only)</p>
                <ul className="mt-2 space-y-1 text-xs">
                  {attachments.map((a) => (
                    <li key={a.id} className="flex flex-wrap items-center gap-2 text-warn">
                      <Paperclip className="size-3.5" />
                      <span className="font-medium">{a.label}</span>
                      <span className="font-mono text-[10px] text-muted">sha256 {String(a.value).slice(0, 16)}…</span>
                      <button type="button" onClick={() => copyText(String(a.value))} className="text-[11px] text-primary underline">
                        Copy hash
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {tab === "urls" ? (
        <div className="max-h-[420px] space-y-2 overflow-auto p-4">
          {urlArtifacts.length === 0 ? (
            <p className="text-sm text-muted">No URL artifacts on this sample.</p>
          ) : (
            urlArtifacts.map((u) => (
              <article key={u.id} className="rounded-lg border border-border bg-raised/40 p-3">
                <p className="text-sm font-medium">{u.label}</p>
                <p className="mt-1 break-all font-mono text-xs text-primary">{u.value}</p>
                <p className="mt-2 text-[11px] text-muted">
                  host={String(u.meta.hostname ?? "")} · tld={String(u.meta.tld ?? "")}
                  {u.meta.suspiciousTld ? " · suspicious TLD" : ""}
                  {u.meta.chain ? ` · chain: ${String(u.meta.chain)}` : ""}
                </p>
                <button
                  type="button"
                  onClick={() => copyText(u.value)}
                  className="mt-2 inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px]"
                >
                  <Copy className="size-3" /> Copy href
                </button>
              </article>
            ))
          )}
        </div>
      ) : null}

      {tab === "headers" || tab === "raw" ? (
        <pre className="max-h-[420px] overflow-auto p-4 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-muted">
          {tab === "headers" ? sample.headers : sample.rawSource}
        </pre>
      ) : null}
    </div>
  );
}
