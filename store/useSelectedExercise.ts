import { create } from "zustand"

import { Exercise } from "@/db/schema"

interface SelectedExerciseState {
  exercise: Exercise | null
  setExercise: (exercise: Exercise) => void
}

export const useSelectedExercise = create<SelectedExerciseState>((set) => ({
  exercise: null,
  setExercise: (exercise) => set(() => ({ exercise })),
}))
