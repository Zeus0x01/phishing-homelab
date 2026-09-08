import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const hashSchema = z.string().regex(/^[a-f0-9]{64}$/i, "A SHA-256 hash is required");

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });
}

export const Route = createFileRoute("/api/attachment-lookup")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const hash = hashSchema.parse(new URL(request.url).searchParams.get("hash"));
          const apiKey = process.env.VIRUSTOTAL_API_KEY;
          if (!apiKey) return json({ ok: false, error: "VirusTotal is disabled. Configure VIRUSTOTAL_API_KEY on the server to enable hash-only lookups." }, 503);
          const response = await fetch(`https://www.virustotal.com/api/v3/files/${hash}`, { headers: { "x-apikey": apiKey, accept: "application/json" } });
          if (response.status === 404) return json({ ok: true, data: { status: "not_found", positives: 0, total: 0 } });
          if (!response.ok) return json({ ok: false, error: `VirusTotal returned HTTP ${response.status}` }, 502);
          const body = (await response.json()) as { data?: { id?: string; attributes?: { last_analysis_stats?: { malicious?: number; suspicious?: number; harmless?: number; undetected?: number } } } };
          const stats = body.data?.attributes?.last_analysis_stats ?? {};
          const positives = (stats.malicious ?? 0) + (stats.suspicious ?? 0);
          const total = positives + (stats.harmless ?? 0) + (stats.undetected ?? 0);
          return json({ ok: true, data: { status: positives ? "flagged" : "clean", positives, total, permalink: body.data?.id ? `https://www.virustotal.com/gui/file/${body.data.id}` : undefined } });
        } catch (error) {
          return json({ ok: false, error: error instanceof Error ? error.message : "Invalid hash" }, 400);
        }
      },
    },
  },
});