import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getProgress, recordProgressAttempt } from "@/lib/services/progress";

const response = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });

export const Route = createFileRoute("/api/progress")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const sessionId = z.string().min(8).parse(new URL(request.url).searchParams.get("sessionId"));
          return response(await getProgress({ data: { sessionId } }));
        } catch (error) {
          return response({ ok: false, error: error instanceof Error ? error.message : "invalid progress request" }, 400);
        }
      },
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const parsed = z.object({ action: z.enum(["record", "read"]), sessionId: z.string().min(8), labId: z.string().optional(), score: z.number().int().nonnegative().optional(), total: z.number().int().positive().optional() }).parse(body);
          if (parsed.action === "read") return response(await getProgress({ data: { sessionId: parsed.sessionId } }));
          if (!parsed.labId || parsed.score === undefined || parsed.total === undefined) return response({ ok: false, error: "labId, score, and total are required" }, 400);
          return response(await recordProgressAttempt({ data: { sessionId: parsed.sessionId, labId: parsed.labId, score: parsed.score, total: parsed.total } }), 201);
        } catch (error) {
          return response({ ok: false, error: error instanceof Error ? error.message : "invalid progress request" }, 400);
        }
      },
    },
  },
});
