import assert from "node:assert/strict";
import test from "node:test";
import { gradeStep, normalizeAnswer } from "./scoring.ts";
import type { LabStep } from "../labs/schema.ts";

function step(partial: Partial<LabStep> & Pick<LabStep, "id" | "expected">): LabStep {
  return {
    id: partial.id,
    title: partial.title ?? partial.id,
    prompt: partial.prompt ?? partial.id,
    checkType: partial.checkType ?? "flag",
    expected: partial.expected,
    aliases: partial.aliases,
    choices: partial.choices,
    points: partial.points ?? 10,
  };
}

test("normalize collapses case hyphens and scheme", () => {
  assert.equal(normalizeAnswer("  HTTPS://Example.COM/path/  "), "example.com/path");
  assert.equal(normalizeAnswer("Adversary-in-the-Middle"), "adversary in the middle");
  assert.equal(normalizeAnswer("<id@x.com>"), "id@x.com");
});

test("flag accepts hyphen/space variants via expected list", () => {
  const s = step({
    id: "t",
    expected: ["Adversary-in-the-Middle"],
    aliases: ["AiTM", "AitM"],
  });
  assert.equal(gradeStep(s, "adversary in the middle", false), true);
  assert.equal(gradeStep(s, "AiTM", false), true);
  assert.equal(gradeStep(s, "credential stuffing", false), false);
});

test("flag accepts hostname when user pastes full URL", () => {
  const s = step({
    id: "host",
    expected: ["login.microsoftonline.cc-auth-verify.com"],
  });
  assert.equal(
    gradeStep(
      s,
      "https://login.microsoftonline.cc-auth-verify.com/oauth2/v2.0/authorize?client_id=x",
      false,
    ),
    true,
  );
});

test("flag rejects unrelated host", () => {
  const s = step({ id: "host", expected: ["sfr-webmail.com"] });
  assert.equal(gradeStep(s, "microsoftonline.com", false), false);
});

test("choice matches normalized options", () => {
  const s = step({
    id: "spf",
    checkType: "choice",
    expected: ["fail"],
    choices: ["pass", "fail", "none"],
  });
  assert.equal(gradeStep(s, "FAIL", false), true);
  assert.equal(gradeStep(s, "pass", false), false);
});

test("Message-ID with or without brackets", () => {
  const s = step({
    id: "mid",
    expected: ["<20260909131004.992104@compliance-alert-msft.com>"],
  });
  assert.equal(gradeStep(s, "20260909131004.992104@compliance-alert-msft.com", false), true);
});
