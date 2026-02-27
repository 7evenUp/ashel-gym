import { create } from "zustand"

import { Exercise, MuscleGroup } from "@/db/schema"

export type CurrentStep =
  | "idle"
  | "select-muscle-group"
  | "select-exercise"
  | "create-set"

interface WorkoutCreationState {
  currentStep: CurrentStep
  createdWorkoutId: number | null
  selectedMuscleGroup: MuscleGroup | null
  setSelectedMuscleGroup: (muscleGroup: MuscleGroup | null) => void
  selectedExercise: Exercise | null
  setSelectedExercise: (exercise: Exercise | null) => void
  startWorkout: (workoutId: number) => void
  goToMuscleGroupSelection: () => void
  goToExerciseSelection: () => void
  goToSetCreation: () => void
  resetWorkoutCreation: () => void
}

export const useWorkoutCreation = create<WorkoutCreationState>((set) => ({
  currentStep: "idle",
  createdWorkoutId: null,
  selectedMuscleGroup: null,
  setSelectedMuscleGroup: (muscleGroup) =>
    set(() => ({ selectedMuscleGroup: muscleGroup })),
  selectedExercise: null,
  setSelectedExercise: (exercise) =>
    set(() => ({ selectedExercise: exercise })),
  startWorkout: (workoutId) =>
    set(() => ({
      currentStep: "select-muscle-group",
      createdWorkoutId: workoutId,
      selectedMuscleGroup: null,
      selectedExercise: null,
    })),
  goToMuscleGroupSelection: () =>
    set(() => ({
      currentStep: "select-muscle-group",
      selectedMuscleGroup: null,
      selectedExercise: null,
    })),
  goToExerciseSelection: () =>
    set(() => ({
      currentStep: "select-exercise",
      selectedExercise: null,
    })),
  goToSetCreation: () =>
    set(() => ({
      currentStep: "create-set",
    })),
  resetWorkoutCreation: () =>
    set(() => ({
      currentStep: "idle",
      createdWorkoutId: null,
      selectedMuscleGroup: null,
      selectedExercise: null,
    })),
}))
