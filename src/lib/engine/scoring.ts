import type { LabDefinition, LabStep } from "../labs/schema.ts";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function gradeStep(step: LabStep, answer: string, lureVisited: boolean) {
  if (step.checkType === "visit-lure") return lureVisited;
  const expected = step.expected ?? [];
  const received = normalize(answer);
  if (!received) return false;
  if (step.checkType === "choice") return expected.some((value) => normalize(value) === received);
  return expected.some((value) => received === normalize(value) || received.includes(normalize(value)));
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
