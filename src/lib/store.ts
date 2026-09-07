import { create } from "zustand";
import { persist } from "zustand/middleware";
import { catalog, getLab, gradeQuestion, type Question } from "@/data/campaign";

export type ExtraQ = { prompt: string; answer: string; points: number };

type State = {
  labId: string;
  callsign: string;
  minutes: number;
  extra: ExtraQ[];
  live: boolean;
  sessionCode: string;
  startedAt: number | null;
  answers: Record<string, string>;
  submitted: boolean;
  lureTried: boolean;
  inspectedAttach: boolean;
  qrScanned: boolean;
  setLab: (id: string) => void;
  setCallsign: (v: string) => void;
  setMinutes: (n: number) => void;
  setExtra: (rows: ExtraQ[]) => void;
  goLive: () => void;
  start: () => void;
  setAnswer: (id: string, v: string) => void;
  submit: () => void;
  reset: () => void;
  markLure: () => void;
  markAttach: () => void;
  markQr: () => void;
};

export function remainingMs(startedAt: number | null, minutes: number) {
  const cap = Math.max(5, minutes) * 60 * 1000;
  if (!startedAt) return cap;
  return Math.max(0, cap - (Date.now() - startedAt));
}

export function mergedQuestions(labId: string, extra: ExtraQ[]): Question[] {
  const base = getLab(labId).questions;
  const add: Question[] = extra
    .filter((e) => e.prompt.trim() && e.answer.trim())
    .map((e, i) => ({
      id: `x${i + 1}`,
      points: e.points || 10,
      prompt: e.prompt,
      hint: "Instructor item",
      kind: "text" as const,
      accept: [e.answer],
    }));
  return [...base, ...add];
}

export function computeScore(labId: string, extra: ExtraQ[], answers: Record<string, string>) {
  const qs = mergedQuestions(labId, extra);
  let score = 0;
  const detail: { id: string; ok: boolean; points: number }[] = [];
  for (const q of qs) {
    const ok = gradeQuestion(q, answers[q.id] ?? "");
    if (ok) score += q.points;
    detail.push({ id: q.id, ok, points: q.points });
  }
  return { score, detail, qs, total: qs.reduce((s, q) => s + q.points, 0) };
}

export const useLab = create<State>()(
  persist(
    (set) => ({
      labId: catalog[0].id,
      callsign: "",
      minutes: catalog[0].minutes,
      extra: [{ prompt: "", answer: "", points: 10 }],
      live: false,
      sessionCode: "",
      startedAt: null,
      answers: {},
      submitted: false,
      lureTried: false,
      inspectedAttach: false,
      qrScanned: false,
      setLab: (id) =>
        set({
          labId: id,
          minutes: getLab(id).minutes,
          startedAt: null,
          answers: {},
          submitted: false,
        }),
      setCallsign: (v) => set({ callsign: v }),
      setMinutes: (n) => set({ minutes: n }),
      setExtra: (rows) => set({ extra: rows }),
      goLive: () =>
        set({
          live: true,
          sessionCode: Math.random().toString(36).slice(2, 8).toUpperCase(),
        }),
      start: () =>
        set({
          startedAt: Date.now(),
          submitted: false,
          answers: {},
          lureTried: false,
          inspectedAttach: false,
          qrScanned: false,
        }),
      setAnswer: (id, v) => set((s) => ({ answers: { ...s.answers, [id]: v } })),
      submit: () => set({ submitted: true }),
      reset: () =>
        set({
          startedAt: null,
          answers: {},
          submitted: false,
          lureTried: false,
          inspectedAttach: false,
          qrScanned: false,
        }),
      markLure: () => set({ lureTried: true }),
      markAttach: () => set({ inspectedAttach: true }),
      markQr: () => set({ qrScanned: true }),
    }),
    { name: "phishlab-ctf" },
  ),
);
