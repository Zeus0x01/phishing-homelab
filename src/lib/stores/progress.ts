import { create } from "zustand";

export type ProgressAttempt = { id: string; lab_id: string; score: number; total: number; completed_at: string };
type ProgressState = { attempts: ProgressAttempt[]; completed: number; average: number; setProgress: (value: Omit<ProgressState, "setProgress">) => void };

export const useProgressStore = create<ProgressState>((set) => ({
  attempts: [],
  completed: 0,
  average: 0,
  setProgress: (value) => set(value),
}));
