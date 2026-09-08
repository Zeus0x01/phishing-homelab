import { createFileRoute } from "@tanstack/react-router";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const SHA256_RE = /^[a-f0-9]{64}$/i;

/**
 * Hash-only VirusTotal lookup for training.
 * Never accepts file uploads — SHA-256 query only.
 * Set VIRUSTOTAL_API_KEY in the server environment to enable live lookups.
 */
export const Route = createFileRoute("/api/vt-hash")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const hash = (url.searchParams.get("hash") ?? "").trim().toLowerCase();

        if (!SHA256_RE.test(hash)) {
          return json({ error: "hash must be a 64-character SHA-256 hex string" }, 400);
        }

        const apiKey = process.env.VIRUSTOTAL_API_KEY?.trim();
        if (!apiKey) {
          return json({
            enabled: false,
            hash,
            message:
              "VirusTotal API is not configured. Set VIRUSTOTAL_API_KEY on the server for hash-only lookups. GUI link remains available.",
            guiUrl: `https://www.virustotal.com/gui/file/${hash}`,
          });
        }

        try {
          const res = await fetch(`https://www.virustotal.com/api/v3/files/${hash}`, {
            headers: { "x-apikey": apiKey, accept: "application/json" },
          });

          if (res.status === 404) {
            return json({
              enabled: true,
              hash,
              found: false,
              message: "Hash not found on VirusTotal (common for fictional training fixtures).",
              guiUrl: `https://www.virustotal.com/gui/file/${hash}`,
            });
          }

          if (!res.ok) {
            const body = await res.text().catch(() => "");
            return json(
              {
                enabled: true,
                hash,
                error: `VirusTotal responded ${res.status}`,
                detail: body.slice(0, 200),
                guiUrl: `https://www.virustotal.com/gui/file/${hash}`,
              },
              502,
            );
          }

          const payload = (await res.json()) as {
            data?: {
              attributes?: {
                last_analysis_stats?: Record<string, number>;
                meaningful_name?: string;
                type_description?: string;
                reputation?: number;
              };
            };
          };

          const attrs = payload.data?.attributes ?? {};
          const stats = attrs.last_analysis_stats ?? {};

          return json({
            enabled: true,
            hash,
            found: true,
            stats: {
              malicious: stats.malicious ?? 0,
              suspicious: stats.suspicious ?? 0,
              harmless: stats.harmless ?? 0,
              undetected: stats.undetected ?? 0,
            },
            name: attrs.meaningful_name ?? null,
            typeDescription: attrs.type_description ?? null,
            reputation: attrs.reputation ?? null,
            guiUrl: `https://www.virustotal.com/gui/file/${hash}`,
            message: "Hash-only lookup complete. No file was uploaded from this app.",
          });
        } catch (err) {
          return json(
            {
              enabled: true,
              hash,
              error: err instanceof Error ? err.message : "lookup failed",
              guiUrl: `https://www.virustotal.com/gui/file/${hash}`,
            },
            502,
          );
        }
      },
    },
  },
});
