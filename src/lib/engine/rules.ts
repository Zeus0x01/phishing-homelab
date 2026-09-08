import { z } from "zod";
import type { Artifact, ExtractedSample } from "../labs/artifacts.ts";

export const BRANDS = ["paypal", "microsoft", "google", "apple", "amazon", "northwind"] as const;
export const RISKY_TLDS = ["xyz", "top", "click", "zip", "mov", "country", "gq", "tk", "ml", "ga", "cf"];
export const RISKY_EXTS = ["exe", "scr", "iso", "img", "js", "vbs", "js", "hta", "iso"];

export const conditionSchema = z.object({
  id: z.string(),
  field: z.string(),
  op: z.enum(["eq", "neq", "in", "contains", "lookalike", "wildcard", "exists", "gt", "mismatch"]),
  value: z.string().default(""),
});

export const detectionRuleSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  enabled: z.boolean().default(true),
  logic: z.enum(["and", "or"]).default("and"),
  conditions: z.array(conditionSchema).min(1),
  pack: z.enum(["builtin", "custom"]).default("custom"),
});

export type DetectionCondition = z.infer<typeof conditionSchema>;
export type DetectionRule = z.infer<typeof detectionRuleSchema>;

export type RuleHit = {
  rule: DetectionRule;
  matched: { conditionId: string; artifactId: string; evidence: string }[];
};

function domainOf(addr: string) {
  const at = addr.lastIndexOf("@");
  return (at >= 0 ? addr.slice(at + 1) : addr).toLowerCase();
}

function levenshtein(a: string, b: string) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

export function isLookalikeHost(host: string, brand: string) {
  const h = host.toLowerCase().replace(/^www\./, "");
  const labels = h.split(".");
  const sld = labels.length >= 2 ? labels[labels.length - 2] : h;
  if (sld === brand) return false;
  if (sld.includes(brand) && sld !== brand) return true;
  if (h.includes(`${brand}-`) || h.includes(`-${brand}`)) return true;
  if (Math.abs(sld.length - brand.length) <= 2 && levenshtein(sld, brand) <= 2) return true;
  return false;
}

function wildcardMatch(text: string, pattern: string) {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".");
  return new RegExp(`^${escaped}$`, "i").test(text);
}

function fieldValues(sample: ExtractedSample, field: string): { artifact: Artifact; text: string }[] {
  const arts = sample.artifacts;
  switch (field) {
    case "url.tld":
      return arts.filter((a) => a.kind === "url").map((a) => ({ artifact: a, text: String(a.meta.tld ?? "") }));
    case "url.host":
    case "url.hostname":
      return arts.filter((a) => a.kind === "url").map((a) => ({ artifact: a, text: String(a.meta.hostname ?? "") }));
    case "sender.domain":
      return arts.filter((a) => a.kind === "domain").map((a) => ({ artifact: a, text: a.value }));
    case "sender.addr":
      return arts.filter((a) => a.kind === "sender").map((a) => ({ artifact: a, text: a.value }));
    case "attachment.ext":
      return arts.filter((a) => a.kind === "attachment").map((a) => ({ artifact: a, text: String(a.meta.ext ?? "") }));
    case "attachment.sha256":
      return arts.filter((a) => a.kind === "attachment").map((a) => ({ artifact: a, text: a.value }));
    case "auth.spf":
      return arts.filter((a) => a.meta.protocol === "spf").map((a) => ({ artifact: a, text: a.value }));
    case "auth.dkim":
      return arts.filter((a) => a.meta.protocol === "dkim").map((a) => ({ artifact: a, text: a.value }));
    case "auth.dmarc":
      return arts.filter((a) => a.meta.protocol === "dmarc").map((a) => ({ artifact: a, text: a.value }));
    case "tone.urgency":
      return arts.filter((a) => a.kind === "language").map((a) => ({ artifact: a, text: String(a.meta.urgencyScore ?? 0) }));
    default:
      return arts.map((a) => ({ artifact: a, text: a.value }));
  }
}

function aKindsHost(a: Artifact) {
  return a.kind === "url" || a.kind === "domain";
}

function evalCondition(
  sample: ExtractedSample,
  cond: DetectionCondition,
  iocs: { kind: string; value: string }[],
): { ok: boolean; artifactId: string; evidence: string }[] {
  if (cond.field === "replyTo.mismatch" || cond.op === "mismatch") {
    const from = domainOf(sample.fromAddr);
    const reply = domainOf(sample.replyTo);
    const art = sample.artifacts.find((a) => a.kind === "reply-to");
    const ok = from !== reply;
    return ok && art
      ? [{ ok: true, artifactId: art.id, evidence: `reply-to domain ${reply} != from ${from}` }]
      : [];
  }
  if (cond.field === "lookalike.brand" || cond.op === "lookalike") {
    const brand = (cond.value || BRANDS.join(",")).split(/[\s,]+/).filter(Boolean);
    const hits: { ok: boolean; artifactId: string; evidence: string }[] = [];
    for (const a of sample.artifacts.filter((x) => aKindsHost(x))) {
      const host = String(a.kind === "url" ? a.meta.hostname : a.value);
      for (const b of brand) {
        if (isLookalikeHost(host, b.toLowerCase())) {
          hits.push({ ok: true, artifactId: a.id, evidence: `${host} lookalike of ${b}` });
        }
      }
    }
    return hits;
  }
  if (cond.field === "credentialHarvest") {
    const art = sample.artifacts.find((a) => a.kind === "language");
    const ok = Boolean(art?.meta.credentialHarvest);
    return ok && art
      ? [
          {
            ok: true,
            artifactId: art.id,
            evidence: `credential-harvest flag on sample · tone: ${art.value || "n/a"} · urgency ${art.meta.urgencyScore ?? "?"}`,
          },
        ]
      : [];
  }
  if (cond.field === "fakeLogin") {
    const art = sample.artifacts.find((a) => a.kind === "language");
    const ok = Boolean(art?.meta.credentialHarvest);
    if (!ok || !art) return [];
    const indicators = String(art.meta.fakeLoginIndicators ?? "none");
    return [
      {
        ok: true,
        artifactId: art.id,
        evidence:
          indicators && indicators !== "none"
            ? `fake login signals: ${indicators}`
            : "credential-harvest sample without explicit indicator list",
      },
    ];
  }
  if (cond.field === "ioc") {
    const hits: { ok: boolean; artifactId: string; evidence: string }[] = [];
    for (const ioc of iocs) {
      const needle = ioc.value.toLowerCase();
      for (const a of sample.artifacts) {
        const blob = `${a.value} ${Object.values(a.meta).join(" ")}`.toLowerCase();
        if (needle && blob.includes(needle)) {
          hits.push({ ok: true, artifactId: a.id, evidence: `IOC ${ioc.kind}:${ioc.value}` });
        }
      }
    }
    return hits;
  }

  const rows = fieldValues(sample, cond.field);
  const hits: { ok: boolean; artifactId: string; evidence: string }[] = [];
  for (const row of rows) {
    const v = row.text;
    let ok = false;
    if (cond.op === "eq") ok = v.toLowerCase() === cond.value.toLowerCase();
    if (cond.op === "neq") ok = v.toLowerCase() !== cond.value.toLowerCase();
    if (cond.op === "contains") ok = v.toLowerCase().includes(cond.value.toLowerCase());
    if (cond.op === "in") {
      const set = cond.value.split(/[\s,]+/).filter(Boolean).map((x) => x.toLowerCase());
      ok = set.includes(v.toLowerCase());
    }
    if (cond.op === "wildcard") ok = wildcardMatch(v, cond.value);
    if (cond.op === "exists") ok = v.length > 0;
    if (cond.op === "gt") ok = Number(v) > Number(cond.value);
    if (ok) {
      const label = row.artifact.kind === "attachment" ? ` (${row.artifact.label})` : "";
      hits.push({
        ok: true,
        artifactId: row.artifact.id,
        evidence: `${cond.field} ${cond.op} ${cond.value} → ${v}${label}`,
      });
    }
  }
  return hits;
}

export function evaluateRule(
  sample: ExtractedSample,
  rule: DetectionRule,
  iocs: { kind: string; value: string }[],
): RuleHit | null {
  if (!rule.enabled) return null;
  const matched: RuleHit["matched"] = [];
  for (const cond of rule.conditions) {
    const hits = evalCondition(sample, cond, iocs);
    if (hits.length) {
      matched.push(
        ...hits.map((h) => ({ conditionId: cond.id, artifactId: h.artifactId, evidence: h.evidence })),
      );
    } else if (rule.logic === "and") {
      return null;
    }
  }
  if (!matched.length) return null;
  return { rule, matched };
}

export function evaluateRules(
  sample: ExtractedSample,
  rules: DetectionRule[],
  iocs: { kind: string; value: string }[],
): RuleHit[] {
  return rules.map((r) => evaluateRule(sample, r, iocs)).filter((x): x is RuleHit => x !== null);
}

export const builtinRules: DetectionRule[] = [
  {
    id: "pack-lookalike",
    name: "Lookalike / spoofed brand domain",
    enabled: true,
    logic: "or",
    pack: "builtin",
    conditions: [{ id: "c1", field: "lookalike.brand", op: "lookalike", value: BRANDS.join(",") }],
  },
  {
    id: "pack-replyto",
    name: "Reply-To mismatch",
    enabled: true,
    logic: "and",
    pack: "builtin",
    conditions: [{ id: "c1", field: "replyTo.mismatch", op: "mismatch", value: "" }],
  },
  {
    id: "pack-harvest",
    name: "Credential-harvest pattern",
    enabled: true,
    logic: "and",
    pack: "builtin",
    conditions: [{ id: "c1", field: "credentialHarvest", op: "exists", value: "" }],
  },
  {
    id: "pack-urgent",
    name: "Urgent-tone social engineering",
    enabled: true,
    logic: "and",
    pack: "builtin",
    conditions: [{ id: "c1", field: "tone.urgency", op: "gt", value: "50" }],
  },
  {
    id: "pack-attach",
    name: "Risky attachment type",
    enabled: true,
    logic: "and",
    pack: "builtin",
    conditions: [{ id: "c1", field: "attachment.ext", op: "in", value: "exe,scr,iso,img,hta,vbs" }],
  },
  {
    id: "pack-fakelogin",
    name: "Fake login page indicators",
    enabled: true,
    logic: "and",
    pack: "builtin",
    conditions: [{ id: "c1", field: "fakeLogin", op: "exists", value: "" }],
  },
  {
    id: "pack-risky-tld",
    name: "URL TLD in risky set",
    enabled: true,
    logic: "and",
    pack: "builtin",
    conditions: [{ id: "c1", field: "url.tld", op: "in", value: RISKY_TLDS.join(",") }],
  },
  {
    id: "pack-ioc",
    name: "IOC list match",
    enabled: true,
    logic: "or",
    pack: "builtin",
    conditions: [{ id: "c1", field: "ioc", op: "exists", value: "" }],
  },
  {
    id: "pack-auth-fail",
    name: "Authentication failure (SPF)",
    enabled: true,
    logic: "and",
    pack: "builtin",
    conditions: [{ id: "c1", field: "auth.spf", op: "eq", value: "fail" }],
  },
];
