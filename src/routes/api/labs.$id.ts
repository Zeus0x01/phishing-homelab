import { createFileRoute } from "@tanstack/react-router";
import { deleteLab, getLabById, upsertLab } from "@/lib/labs/service";
import { labDefinitionSchema } from "@/lib/labs/schema";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const Route = createFileRoute("/api/labs/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const row = await getLabById({ data: { id: params.id } });
        if (!row) return json({ error: "not found" }, 404);
        return json(row);
      },
      PUT: async ({ params, request }) => {
        try {
          const body = await request.json();
          const definition = labDefinitionSchema.parse({ ...body, id: params.id });
          const result = await upsertLab({ data: { definition } });
          return json(result);
        } catch (err) {
          return json({ error: err instanceof Error ? err.message : "invalid lab" }, 400);
        }
      },
      DELETE: async ({ params }) => {
        try {
          await deleteLab({ data: { id: params.id } });
          return json({ ok: true });
        } catch (err) {
          return json({ error: err instanceof Error ? err.message : "delete failed" }, 400);
        }
      },
    },
  },
});
