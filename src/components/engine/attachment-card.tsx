import { useState } from "react";
import { ExternalLink, FileWarning, Paperclip } from "lucide-react";
import type { Artifact } from "@/lib/labs/artifacts";
import { cn } from "@/lib/cn";

const RISKY_EXTS = new Set([
  "exe", "scr", "js", "jse", "vbs", "vbe", "bat", "cmd", "ps1", "msi",
  "iso", "img", "html", "htm", "hta", "lnk", "docm", "xlsm", "pptm", "zip", "rar", "7z",
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

type VtState = {
  loading?: boolean;
  enabled?: boolean;
  found?: boolean;
  message?: string;
  stats?: { malicious: number; suspicious: number; harmless: number; undetected: number };
  guiUrl?: string;
  error?: string;
};

export function AttachmentCard({ artifact }: { artifact: Artifact }) {
  const ext = String(artifact.meta.ext ?? "");
  const sha = String(artifact.meta.sha256 ?? artifact.value);
  const sizeBytes = Number(artifact.meta.sizeBytes ?? 0);
  const type = String(artifact.meta.type ?? "application/octet-stream");
  const risky = RISKY_EXTS.has(ext.toLowerCase());
  const validHash = /^[a-f0-9]{64}$/i.test(sha);
  const [vt, setVt] = useState<VtState | null>(null);

  async function lookupVt() {
    if (!validHash) return;
    setVt({ loading: true });
    try {
      const res = await fetch(`/api/vt-hash?hash=${encodeURIComponent(sha)}`);
      const data = (await res.json()) as VtState;
      setVt({ ...data, loading: false });
    } catch (err) {
      setVt({
        loading: false,
        enabled: false,
        error: err instanceof Error ? err.message : "lookup failed",
        guiUrl: virusTotalUrl(sha),
      });
    }
  }

  return (
    <article className={cn("rounded-lg border p-4", risky ? "border-crit/40 bg-crit/5" : "border-border bg-surface")}>
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
          <p className="mt-1 text-[10px] text-muted">
            Hash inspection uses this lab&apos;s attachment fixture only — no binary is stored or executed in the app.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {validHash ? (
              <>
                <button
                  type="button"
                  onClick={() => void lookupVt()}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-3 text-xs text-primary"
                >
                  Inspect hash (VirusTotal API)
                </button>
                <a
                  href={virusTotalUrl(sha)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-border px-3 text-xs text-primary hover:bg-raised"
                >
                  <ExternalLink className="size-3.5" />
                  Open VT GUI
                </a>
              </>
            ) : (
              <span className="text-[11px] text-muted">Hash not in SHA-256 format — VT skipped</span>
            )}
            <button
              type="button"
              className="inline-flex min-h-9 items-center rounded-md border border-border px-3 text-xs"
              onClick={() => void navigator.clipboard.writeText(sha)}
            >
              Copy hash
            </button>
          </div>
          {vt?.loading ? <p className="mt-2 text-[11px] text-muted">Looking up hash…</p> : null}
          {vt && !vt.loading ? (
            <div className="mt-2 rounded-md border border-border bg-raised/50 p-2 text-[11px]">
              {vt.enabled === false ? (
                <p className="text-warn">
                  {vt.message ??
                    "VirusTotal is disabled. Configure VIRUSTOTAL_API_KEY on the server to enable hash-only lookups."}
                </p>
              ) : null}
              {vt.error ? <p className="text-crit">{vt.error}</p> : null}
              {vt.enabled && vt.found === false ? <p className="text-muted">{vt.message}</p> : null}
              {vt.stats ? (
                <p className="text-fg">
                  VT engines — malicious: {vt.stats.malicious}, suspicious: {vt.stats.suspicious}, harmless:{" "}
                  {vt.stats.harmless}, undetected: {vt.stats.undetected}
                </p>
              ) : null}
              {vt.guiUrl ? (
                <a href={vt.guiUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-primary underline">
                  Open full report
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
