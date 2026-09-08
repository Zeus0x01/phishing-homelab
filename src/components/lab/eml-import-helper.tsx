import { useCallback, useState } from "react";
import { FileUp, Copy, Wand2, AlertTriangle } from "lucide-react";
import { parseEml, buildLabDraftFromSample } from "@/lib/labs/eml-parser";

type Props = {
  onDraftReady?: (json: string) => void;
};

export function EmlImportHelper({ onDraftReady }: Props) {
  const [status, setStatus] = useState("");
  const [preview, setPreview] = useState<{ subject: string; from: string; urls: number; atts: number } | null>(null);
  const [draftJson, setDraftJson] = useState("");

  const handleFile = useCallback(
    async (file: File | null) => {
      if (!file) return;
      if (!/\.eml$/i.test(file.name) && file.type && !file.type.includes("message") && !file.type.includes("text")) {
        setStatus("Please choose a .eml file (plain text email export).");
        return;
      }
      if (file.size > 2_000_000) {
        setStatus("File too large (max 2 MB for training import).");
        return;
      }
      try {
        const text = await file.text();
        const sample = parseEml(text);
        // Force training-safe defaults
        sample.rawSource = sample.rawSource.slice(0, 20_000);
        sample.html = sample.html.slice(0, 50_000);
        const lab = buildLabDraftFromSample(sample);
        const json = JSON.stringify(lab, null, 2);
        setDraftJson(json);
        setPreview({
          subject: sample.subject,
          from: `${sample.fromName} <${sample.fromAddr}>`,
          urls: sample.urls.length,
          atts: sample.attachments.length,
        });
        setStatus("Parsed successfully. Review the draft, then use Load into editor or Copy JSON.");
        onDraftReady?.(json);
      } catch (err) {
        setStatus(err instanceof Error ? err.message : "Could not parse this .eml file.");
        setPreview(null);
        setDraftJson("");
      }
    },
    [onDraftReady],
  );

  function loadIntoEditor() {
    if (draftJson) onDraftReady?.(draftJson);
  }

  async function copyJson() {
    if (!draftJson) return;
    try {
      await navigator.clipboard.writeText(draftJson);
      setStatus("JSON copied to clipboard.");
    } catch {
      setStatus("Could not copy — select the draft in the lab editor instead.");
    }
  }

  return (
    <section className="mt-6 rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-medium">Import .eml → lab template</h2>
          <p className="mt-1 text-xs text-muted">
            Upload a sanitized phishing sample (.eml). The helper extracts headers, auth results, links, and
            attachment names into a lab JSON draft. Attachment binaries are never stored — only metadata and a
            training hash are generated.
          </p>
        </div>
        <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-primary bg-primary/10 px-3 text-sm text-primary">
          <FileUp className="size-4" />
          Choose .eml
          <input
            type="file"
            accept=".eml,message/rfc822,text/plain"
            className="hidden"
            onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-md border border-warn/40 bg-warn/10 p-3 text-xs text-warn">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <p>
          Only use samples you are authorized to analyze. Strip personal data before import. Do not open real
          malware attachments on a production machine. Generated SHA-256 values are training placeholders unless
          you replace them with real hashes from a safe sandbox.
        </p>
      </div>

      {preview ? (
        <div className="mt-4 grid gap-2 rounded-md border border-border bg-raised p-3 text-xs sm:grid-cols-2">
          <p>
            <span className="text-muted">Subject:</span> {preview.subject}
          </p>
          <p>
            <span className="text-muted">From:</span> {preview.from}
          </p>
          <p>
            <span className="text-muted">URLs found:</span> {preview.urls}
          </p>
          <p>
            <span className="text-muted">Attachments named:</span> {preview.atts}
          </p>
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!draftJson}
          onClick={loadIntoEditor}
          className="inline-flex min-h-10 items-center gap-2 rounded-md bg-primary px-3 text-sm text-bg disabled:opacity-40"
        >
          <Wand2 className="size-4" /> Load into editor
        </button>
        <button
          type="button"
          disabled={!draftJson}
          onClick={() => void copyJson()}
          className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border px-3 text-sm disabled:opacity-40"
        >
          <Copy className="size-4" /> Copy JSON
        </button>
      </div>

      {status ? <p className="mt-2 text-xs text-muted">{status}</p> : null}
    </section>
  );
}
