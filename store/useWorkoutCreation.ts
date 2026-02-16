import { create } from "zustand"

import { Exercise, MuscleGroup } from "@/db/schema"

export type CurrentStep =
  | "idle"
  | "select-muscle-group"
  | "select-exercise"
  | "create-set"

interface WorkoutCreationState {
  currentStep: CurrentStep
  setCurrentStep: (currentStep: CurrentStep) => void
  createdWorkoutId: number | null
  setCreatedWorkoutId: (id: number | null) => void
  selectedMuscleGroup: MuscleGroup | null
  setSelectedMuscleGroup: (muscleGroup: MuscleGroup | null) => void
  selectedExercise: Exercise | null
  setSelectedExercise: (exercise: Exercise | null) => void
}

export const useWorkoutCreation = create<WorkoutCreationState>((set) => ({
  currentStep: "idle",
  setCurrentStep: (currentStep) => set(() => ({ currentStep })),
  createdWorkoutId: null,
  setCreatedWorkoutId: (id) => set({ createdWorkoutId: id }),
  selectedMuscleGroup: null,
  setSelectedMuscleGroup: (muscleGroup) =>
    set(() => ({ selectedMuscleGroup: muscleGroup })),
  selectedExercise: null,
  setSelectedExercise: (exercise) =>
    set(() => ({ selectedExercise: exercise })),
}))
