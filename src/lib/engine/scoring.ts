import type { LabDefinition, LabStep } from "../labs/schema.ts";

/** Normalize for flexible CTF-style matching without destroying meaning. */
export function normalizeAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "")
    .replace(/[<>"'`]/g, "")
    .replace(/[_\-]+/g, " ")
    .replace(/[:;,]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Host-only form when the answer looks like a URL or host path. */
function hostOnly(value: string): string {
  const stripped = value.trim().replace(/^https?:\/\//i, "").split(/[/?#]/)[0] ?? "";
  return normalizeAnswer(stripped);
}

function candidates(raw: string): string[] {
  const base = normalizeAnswer(raw);
  const host = hostOnly(raw);
  const out = new Set<string>([base]);
  if (host) out.add(host);
  // without leading #
  if (base.startsWith("#")) out.add(base.slice(1));
  // with/without angle-bracket Message-ID style already stripped by normalize
  return [...out].filter(Boolean);
}

function matchesExpected(answer: string, expected: string): boolean {
  const a = candidates(answer);
  const e = candidates(expected);
  for (const av of a) {
    for (const ev of e) {
      if (av === ev) return true;
    }
  }
  return false;
}

function matchesAliasOrExpected(answer: string, expected: string[], aliases: string[]): boolean {
  const pool = [...expected, ...aliases];
  return pool.some((item) => matchesExpected(answer, item));
}

/**
 * Grade a lab step.
 * - choice: normalized exact among expected
 * - flag / default: expected OR aliases, normalized; also accepts host-only when expected is a host
 * - contains (via includes): only when expected is longer than 3 chars and answer fully contains normalized expected as a token-ish match
 * - visit-lure: lureVisited flag
 */
export function gradeStep(step: LabStep, answer: string, lureVisited: boolean): boolean {
  if (step.checkType === "visit-lure") return lureVisited;
  if (step.checkType === "manual") return Boolean(answer.trim());

  const expected = step.expected ?? [];
  const aliases = (step as LabStep & { aliases?: string[] }).aliases ?? [];
  const received = answer.trim();
  if (!received && step.checkType !== "manual") return false;

  if (step.checkType === "choice") {
    return matchesAliasOrExpected(received, expected, aliases);
  }

  // flag / default flexible match
  if (matchesAliasOrExpected(received, expected, aliases)) return true;

  // Allow answer that is a full URL when expected is hostname
  const recvHost = hostOnly(received);
  if (recvHost && expected.some((e) => hostOnly(e) === recvHost || normalizeAnswer(e) === recvHost)) {
    return true;
  }

  return false;
}

export function computeLabScore(lab: LabDefinition, answers: Record<string, string>, lureVisited: boolean) {
  let score = 0;
  const detail = lab.steps.map((step) => {
    const correct = gradeStep(step, answers[step.id] ?? "", lureVisited);
    if (correct) score += step.points;
    return { id: step.id, ok: correct, points: step.points, title: step.title };
  });
  return { score, total: lab.steps.reduce((sum, step) => sum + step.points, 0), detail };
}
