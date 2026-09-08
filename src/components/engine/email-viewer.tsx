import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { ExtractedSample } from "@/lib/labs/artifacts";
import { sanitizeTrainingHtml } from "@/lib/labs/sanitize";
import { cn } from "@/lib/cn";

export function EmailViewer({ sample }: { sample: ExtractedSample }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"rendered" | "headers" | "raw">("rendered");
  const sanitized = useMemo(() => sanitizeTrainingHtml(sample.html), [sample.html]);
  const tabs = [
    { id: "rendered" as const, label: "Rendered" },
    { id: "headers" as const, label: "Headers" },
    { id: "raw" as const, label: "Raw source" },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex flex-wrap gap-1 border-b border-border p-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "min-h-10 rounded-md px-3 text-sm",
              tab === t.id ? "bg-raised text-fg" : "text-muted",
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
            <p className="text-xs font-medium text-muted">Links and attachments (template data)</p>
            <ul className="mt-2 space-y-1 font-mono text-xs break-all text-primary">
              {sanitized.links.map((l) => (
                <li key={l.href} className="flex flex-wrap items-center gap-2">
                  <span>{l.text} → {l.href}</span>
                  <button type="button" onClick={() => void navigate({ to: "/web" })} className="rounded border border-primary/50 px-2 py-1 font-sans text-[11px] text-primary">Open training page</button>
                </li>
              ))}
              {sample.artifacts
                .filter((a) => a.kind === "attachment")
                .map((a) => (
                  <li key={a.id} className="text-warn">
                    attachment {a.label} · sha256 {a.value}
                  </li>
                ))}
            </ul>
          </div>
        </div>
      ) : (
        <pre className="max-h-[420px] overflow-auto p-4 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-muted">
          {tab === "headers" ? sample.headers : sample.rawSource}
        </pre>
      )}
    </div>
  );
}
