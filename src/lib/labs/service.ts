import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { loadFileLabs, mergeLabs } from "@/lib/labs/loader";
import { labDefinitionSchema, parseLabDefinition, type LabDefinition } from "@/lib/labs/schema";
import { builtinRules, detectionRuleSchema, type DetectionRule } from "@/lib/engine/rules";

type LabRow = { id: string; definition: string };
type RuleRow = { id: string; name: string; enabled: boolean; logic: string; conditions: string; pack: string };
type IocRow = { id: string; kind: string; value: string; note: string };
type QueryRow = { id: string; name: string; query: string };
type VerdictRow = { id: string; sample_id: string; lab_id: string; action: string; created_at: string };
type EventRow = {
  id: string;
  event: string;
  sample_id: string | null;
  lab_id: string | null;
  rule_id: string | null;
  duration_ms: number | null;
};

function nid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

async function dbLabs(): Promise<LabDefinition[]> {
  const sql = await getSql();
  const rows = await sql<LabRow>`select id, definition from lab_definitions order by updated_at desc`;
  const out: LabDefinition[] = [];
  for (const row of rows) {
    try {
      out.push(parseLabDefinition(JSON.parse(row.definition)));
    } catch {
      /* skip corrupt */
    }
  }
  return out;
}

export const listLabs = createServerFn({ method: "GET" }).handler(async () => {
  return mergeLabs(loadFileLabs(), await dbLabs());
});

export const getLabById = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const all = mergeLabs(loadFileLabs(), await dbLabs());
    return all.find((r) => r.definition.id === data.id) ?? null;
  });

export const upsertLab = createServerFn({ method: "POST" })
  .inputValidator(z.object({ definition: z.unknown() }))
  .handler(async ({ data }) => {
    const definition = labDefinitionSchema.parse(data.definition);
    const files = loadFileLabs();
    if (files.some((f) => f.definition.id === definition.id)) {
      throw new Error("File-based labs are read-only. Use a new id to save a copy.");
    }
    const sql = await getSql();
    const payload = JSON.stringify(definition);
    const existing = await sql<{ id: string }>`select id from lab_definitions where id = ${definition.id}`;
    if (existing[0]) {
      await sql`update lab_definitions set definition = ${payload}, updated_at = now() where id = ${definition.id}`;
    } else {
      await sql`insert into lab_definitions (id, definition) values (${definition.id}, ${payload})`;
    }
    return { ok: true as const, id: definition.id };
  });

export const deleteLab = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    if (loadFileLabs().some((f) => f.definition.id === data.id)) {
      throw new Error("Cannot delete a file-based lab.");
    }
    const sql = await getSql();
    await sql`delete from lab_definitions where id = ${data.id}`;
    return { ok: true as const };
  });

export const listRules = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<RuleRow>`select id, name, enabled, logic, conditions, pack from detection_rules`;
  const custom: DetectionRule[] = rows.map((r) =>
    detectionRuleSchema.parse({
      id: r.id,
      name: r.name,
      enabled: r.enabled,
      logic: r.logic,
      pack: r.pack,
      conditions: JSON.parse(r.conditions),
    }),
  );
  return [...builtinRules, ...custom];
});

export const saveRule = createServerFn({ method: "POST" })
  .inputValidator(z.object({ rule: detectionRuleSchema }))
  .handler(async ({ data }) => {
    const rule = { ...data.rule, pack: "custom" as const };
    const sql = await getSql();
    const conditions = JSON.stringify(rule.conditions);
    const existing = await sql<{ id: string }>`select id from detection_rules where id = ${rule.id}`;
    if (existing[0]) {
      await sql`update detection_rules set name = ${rule.name}, enabled = ${rule.enabled}, logic = ${rule.logic}, conditions = ${conditions} where id = ${rule.id}`;
    } else {
      await sql`insert into detection_rules (id, name, enabled, logic, conditions, pack) values (${rule.id}, ${rule.name}, ${rule.enabled}, ${rule.logic}, ${conditions}, ${"custom"})`;
    }
    return { ok: true as const, id: rule.id };
  });

export const deleteRule = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    if (builtinRules.some((r) => r.id === data.id)) throw new Error("Built-in rules cannot be deleted.");
    const sql = await getSql();
    await sql`delete from detection_rules where id = ${data.id}`;
    return { ok: true as const };
  });

export const listIocs = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  return sql<IocRow>`select id, kind, value, note from ioc_entries order by created_at desc`;
});

export const addIoc = createServerFn({ method: "POST" })
  .inputValidator(z.object({ kind: z.enum(["domain", "hash", "sender"]), value: z.string().min(1), note: z.string().optional() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const id = nid("ioc");
    await sql`insert into ioc_entries (id, kind, value, note) values (${id}, ${data.kind}, ${data.value.toLowerCase()}, ${data.note ?? ""})`;
    return { ok: true as const, id };
  });

export const deleteIoc = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`delete from ioc_entries where id = ${data.id}`;
    return { ok: true as const };
  });

export const listSavedQueries = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  return sql<QueryRow>`select id, name, query from saved_queries order by created_at desc`;
});

export const saveQuery = createServerFn({ method: "POST" })
  .inputValidator(z.object({ name: z.string().min(1), query: z.string().min(1) }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const id = nid("q");
    await sql`insert into saved_queries (id, name, query) values (${id}, ${data.name}, ${data.query})`;
    return { ok: true as const, id };
  });

export const recordVerdict = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      sampleId: z.string(),
      labId: z.string(),
      action: z.enum(["phishing", "quarantine", "release", "escalate"]),
      durationMs: z.number().int().nonnegative().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const id = nid("v");
    await sql`insert into verdict_audit (id, sample_id, lab_id, action) values (${id}, ${data.sampleId}, ${data.labId}, ${data.action})`;
    const eid = nid("e");
    await sql`insert into engine_analytics (id, event, sample_id, lab_id, duration_ms) values (${eid}, ${"verdict"}, ${data.sampleId}, ${data.labId}, ${data.durationMs ?? null})`;
    return { ok: true as const, id };
  });

export const recordEngineEvent = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      event: z.enum(["sample_opened", "rule_hit", "harvest_attempt"]),
      sampleId: z.string().optional(),
      labId: z.string().optional(),
      ruleId: z.string().optional(),
      durationMs: z.number().int().nonnegative().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const id = nid("e");
    await sql`insert into engine_analytics (id, event, sample_id, lab_id, rule_id, duration_ms) values (${id}, ${data.event}, ${data.sampleId ?? null}, ${data.labId ?? null}, ${data.ruleId ?? null}, ${data.durationMs ?? null})`;
    return { ok: true as const };
  });

export const listVerdicts = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  return sql<VerdictRow>`select id, sample_id, lab_id, action, created_at::text as created_at from verdict_audit order by created_at desc limit 80`;
});

export const engineDashboard = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const events = await sql<EventRow>`select id, event, sample_id, lab_id, rule_id, duration_ms from engine_analytics`;
  const verdicts = await sql<VerdictRow>`select id, sample_id, lab_id, action, created_at::text as created_at from verdict_audit`;
  const opened = events.filter((e) => e.event === "sample_opened").length;
  const verdictCount = events.filter((e) => e.event === "verdict").length;
  const harvest = events.filter((e) => e.event === "harvest_attempt").length;
  const fp = verdicts.filter((v) => v.action === "release").length;
  const durations = events.filter((e) => e.event === "verdict" && e.duration_ms != null).map((e) => e.duration_ms ?? 0);
  const avgTtV = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
  const ruleHits: Record<string, number> = {};
  for (const e of events.filter((x) => x.event === "rule_hit" && x.rule_id)) {
    ruleHits[e.rule_id!] = (ruleHits[e.rule_id!] ?? 0) + 1;
  }
  return {
    samplesAnalyzed: opened,
    verdicts: verdictCount,
    detectionRate: opened ? Math.round((verdicts.filter((v) => v.action !== "release").length / Math.max(opened, 1)) * 100) : 0,
    falsePositives: fp,
    harvestAttempts: harvest,
    avgTimeToVerdictMs: avgTtV,
    ruleHits,
    actions: {
      phishing: verdicts.filter((v) => v.action === "phishing").length,
      quarantine: verdicts.filter((v) => v.action === "quarantine").length,
      release: verdicts.filter((v) => v.action === "release").length,
      escalate: verdicts.filter((v) => v.action === "escalate").length,
    },
  };
});
