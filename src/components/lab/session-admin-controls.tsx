import { useState } from "react";
import { Radio } from "lucide-react";
import { getLab } from "@/data/campaign";
import { useLab, type ExtraQ } from "@/lib/store";

export function SessionAdminControls() {
  const labId = useLab((state) => state.labId);
  const minutes = useLab((state) => state.minutes);
  const setMinutes = useLab((state) => state.setMinutes);
  const extra = useLab((state) => state.extra);
  const setExtra = useLab((state) => state.setExtra);
  const live = useLab((state) => state.live);
  const sessionCode = useLab((state) => state.sessionCode);
  const goLive = useLab((state) => state.goLive);
  const pack = getLab(labId);
  const [copied, setCopied] = useState(false);

  function shareUrl() {
    if (typeof window === "undefined" || !sessionCode) return "";
    return `${window.location.origin}/lab?session=${sessionCode}`;
  }

  return (
    <section className="mt-6 grid gap-6">
      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-1 font-medium">Your questions</h2>
        <p className="mb-3 text-xs text-muted">
          Added to the active lab as <code className="font-mono">instructor-*</code> steps when you click{" "}
          <strong className="text-fg">Save definition</strong> above. Until then they stay in this browser session only.
        </p>
        <div className="space-y-3">
          {extra.map((row, index) => (
            <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_5rem_auto]">
              <input
                className="min-h-11 rounded-md border border-border bg-raised px-3 text-sm"
                placeholder="Prompt"
                value={row.prompt}
                onChange={(event) =>
                  setExtra(
                    extra.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, prompt: event.target.value } : item,
                    ),
                  )
                }
              />
              <input
                className="min-h-11 rounded-md border border-border bg-raised px-3 text-sm"
                placeholder="Accepted answer"
                value={row.answer}
                onChange={(event) =>
                  setExtra(
                    extra.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, answer: event.target.value } : item,
                    ),
                  )
                }
              />
              <input
                type="number"
                className="min-h-11 rounded-md border border-border bg-raised px-3 text-sm"
                value={row.points}
                onChange={(event) =>
                  setExtra(
                    extra.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, points: Number(event.target.value) || 10 } : item,
                    ),
                  )
                }
              />
              <button
                type="button"
                className="min-h-11 rounded-md border border-border px-3 text-xs text-muted"
                onClick={() => setExtra(extra.filter((_, itemIndex) => itemIndex !== index))}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mt-3 min-h-10 text-sm text-primary underline"
          onClick={() => setExtra([...extra, { prompt: "", answer: "", points: 10 } as ExtraQ])}
        >
          Add question
        </button>
      </section>

      <section className="rounded-xl border border-border bg-surface p-5">
        <div className="mb-2 flex items-center gap-2">
          <Radio className="size-4 text-primary" />
          <h2 className="font-medium">Make it live</h2>
        </div>
        <p className="text-sm text-muted">
          Publish a simulated training session link for your selected lab. No mail or credentials are sent.
        </p>
        <label className="mt-4 block text-sm">
          Session length
          <input
            type="number"
            min={5}
            max={90}
            value={minutes}
            onChange={(event) => setMinutes(Number(event.target.value) || pack.minutes)}
            className="mt-1 min-h-10 w-full rounded-md border border-border bg-raised px-3"
          />
        </label>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 text-sm" onClick={goLive}>
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
    </section>
  );
}
