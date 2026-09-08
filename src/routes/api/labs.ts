import { createFileRoute } from "@tanstack/react-router";
import { deleteLab, listLabs, upsertLab } from "@/lib/labs/service";
import { labDefinitionSchema } from "@/lib/labs/schema";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const Route = createFileRoute("/api/labs")({
  server: {
    handlers: {
      GET: async () => json(await listLabs()),
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const definition = labDefinitionSchema.parse(body);
          const result = await upsertLab({ data: { definition } });
          return json(result, 201);
        } catch (err) {
          return json({ error: err instanceof Error ? err.message : "invalid lab" }, 400);
        }
      },
      DELETE: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const id = url.searchParams.get("id");
          if (!id) return json({ error: "id required" }, 400);
          await deleteLab({ data: { id } });
          return json({ ok: true });
        } catch (err) {
          return json({ error: err instanceof Error ? err.message : "delete failed" }, 400);
        }
      },
    },
  },
});
