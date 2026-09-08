import assert from "node:assert/strict";
import test from "node:test";
import { extractArtifacts } from "./artifacts.ts";
import { builtinRules, evaluateRules } from "../engine/rules.ts";
import { computeLabScore } from "../engine/scoring.ts";
import { parseLabDefinition } from "./schema.ts";
import fixture from "../../../labs/email-analysis.json" with { type: "json" };

const lab = parseLabDefinition(fixture);

test("a file lab fixture validates and exposes a renderer", () => {
  assert.equal(lab.renderer, "email-analysis");
  assert.ok(lab.emailSamples.length > 0);
});

test("artifact extraction preserves typed template evidence", () => {
  const sample = lab.emailSamples[0];
  const extracted = extractArtifacts(lab, sample);
  assert.ok(extracted.artifacts.some((artifact) => artifact.kind === "url"));
  assert.ok(extracted.artifacts.some((artifact) => artifact.kind === "auth" && artifact.value === "fail"));
});

test("deterministic rules return evidence for a phishing sample", () => {
  const extracted = extractArtifacts(lab, lab.emailSamples[0]);
  const hits = evaluateRules(extracted, builtinRules, []);
  assert.ok(hits.length >= 3);
  assert.ok(hits.every((hit) => hit.matched.length > 0));
});

test("shared lab scoring is deterministic", () => {
  const answers = Object.fromEntries(lab.steps.map((step) => [step.id, step.expected?.[0] ?? ""]));
  const first = computeLabScore(lab, answers, false);
  const second = computeLabScore(lab, answers, false);
  assert.deepEqual(first, second);
  assert.equal(first.score, first.total);
});