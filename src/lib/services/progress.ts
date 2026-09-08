import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";

const attemptInput = z.object({
  sessionId: z.string().min(8).max(128),
  labId: z.string().min(1),
  score: z.number().int().nonnegative(),
  total: z.number().int().positive(),
});

type AttemptRow = { id: string; lab_id: string; score: number; total: number; completed_at: string };

function id() {
  return `attempt_${crypto.randomUUID()}`;
}

export const recordProgressAttempt = createServerFn({ method: "POST" })
  .inputValidator(attemptInput)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const attemptId = id();
    await sql`insert into progress_attempts (id, session_id, lab_id, score, total) values (${attemptId}, ${data.sessionId}, ${data.labId}, ${data.score}, ${data.total})`;
    return { ok: true as const, data: { id: attemptId } };
  });

export const getProgress = createServerFn({ method: "POST" })
  .inputValidator(z.object({ sessionId: z.string().min(8).max(128) }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const attempts = await sql<AttemptRow>`select id, lab_id, score, total, completed_at::text as completed_at from progress_attempts where session_id = ${data.sessionId} order by completed_at desc limit 100`;
    const completed = attempts.length;
    const average = completed ? Math.round(attempts.reduce((sum, attempt) => sum + (attempt.score / attempt.total) * 100, 0) / completed) : 0;
    return { ok: true as const, data: { attempts, completed, average } };
  });
