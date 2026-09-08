import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getLab, gradeQuestion, type Question } from "@/data/campaign";
export { computeLabScore, gradeStep } from "@/lib/engine/scoring";

export type ExtraQ = { prompt: string; answer: string; points: number };

type State = {
  sessionId: string;
  callsign: string;
  activeLabId: string | null;
  labId: string;
  minutes: number;
  extra: ExtraQ[];
  live: boolean;
  sessionCode: string | null;
  startedAt: number | null;
  answers: Record<string, string>;
  submitted: boolean;
  lureVisited: boolean;
  lureTried: boolean;
  qrScanned: boolean;
  attachInspected: boolean;
  setCallsign: (v: string) => void;
  setLab: (id: string) => void;
  setMinutes: (minutes: number) => void;
  setExtra: (extra: ExtraQ[]) => void;
  start: () => void;
  goLive: () => void;
  startLab: (id: string) => void;
  setAnswer: (id: string, v: string) => void;
  submit: () => void;
  reset: () => void;
  markLureVisited: () => void;
  markLure: () => void;
  markQr: () => void;
  markAttach: () => void;
};

export function remainingMs(startedAt: number | null, minutes: number) {
  const cap = Math.max(5, minutes) * 60 * 1000;
  if (!startedAt) return cap;
  return Math.max(0, cap - (Date.now() - startedAt));
}

export function mergedQuestions(labId: string, extra: ExtraQ[]): Question[] {
  const labQuestions = getLab(labId).questions;
  return [
    ...labQuestions,
    ...extra.map((question, index) => ({
      id: `extra-${index}`,
      points: question.points,
      prompt: question.prompt,
      hint: "Instructor question",
      kind: "text" as const,
      accept: [question.answer],
    })),
  ];
}

export function computeScore(
  labIdOrAnswers: string | Record<string, string>,
  extra: ExtraQ[] = [],
  suppliedAnswers?: Record<string, string>,
) {
  const labId = typeof labIdOrAnswers === "string" ? labIdOrAnswers : "nightwire";
  const answers = typeof labIdOrAnswers === "string" ? suppliedAnswers ?? {} : labIdOrAnswers;
  const questions = mergedQuestions(labId, extra);
  let score = 0;
  const detail = questions.map((question) => {
    const ok = gradeQuestion(question, answers[question.id] ?? "");
    if (ok) score += question.points;
    return { id: question.id, ok, points: question.points };
  });
  return { score, total: questions.reduce((sum, question) => sum + question.points, 0), detail };
}

export const useSession = create<State>()(
  persist(
    (set) => ({
      sessionId: "training-session-local",
      callsign: "",
      activeLabId: null,
      labId: "nightwire",
      minutes: 30,
      extra: [],
      live: false,
      sessionCode: null,
      startedAt: null,
      answers: {},
      submitted: false,
      lureVisited: false,
      lureTried: false,
      qrScanned: false,
      attachInspected: false,
      setCallsign: (v) => set({ callsign: v }),
      setLab: (id) => set({ labId: id }),
      setMinutes: (minutes) => set({ minutes }),
      setExtra: (extra) => set({ extra }),
      start: () => set((state) => ({ activeLabId: state.labId, startedAt: Date.now(), submitted: false, answers: {} })),
      goLive: () => set({ live: true, sessionCode: Math.random().toString(36).slice(2, 8).toUpperCase() }),
      startLab: (id) =>
        set({
          activeLabId: id,
          labId: id,
          startedAt: Date.now(),
          answers: {},
          submitted: false,
          lureVisited: false,
          lureTried: false,
          qrScanned: false,
          attachInspected: false,
        }),
      setAnswer: (id, v) => set((s) => ({ answers: { ...s.answers, [id]: v } })),
      submit: () => set({ submitted: true }),
      reset: () =>
        set({
          startedAt: null,
          answers: {},
          submitted: false,
          lureVisited: false,
          lureTried: false,
          qrScanned: false,
          attachInspected: false,
        }),
      markLureVisited: () => set({ lureVisited: true }),
      markLure: () => set({ lureVisited: true, lureTried: true }),
      markQr: () => set({ qrScanned: true }),
      markAttach: () => set({ attachInspected: true }),
    }),
    { name: "sentinel-range-session" },
  ),
);

export const useLab = useSession;
