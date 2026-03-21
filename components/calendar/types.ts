export type DayExerciseSetSummary = {
  id: number
  order: number
  reps: number
  weight: number
  workoutId: number
  workoutCreatedAt: number
}

export type DayExerciseSummary = {
  id: number
  name: string
  muscleGroup: string
  setsCount: number
  sets: DayExerciseSetSummary[]
}

export type DaySummary = {
  dateKey: string
  workoutCount: number
  muscleGroups: string[]
  exercises: DayExerciseSummary[]
  setsCount: number
}
