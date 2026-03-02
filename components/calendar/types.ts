export type DaySummary = {
  dateKey: string
  workoutCount: number
  muscleGroups: string[]
  exercises: {
    id: number
    name: string
    setsCount: number
  }[]
  setsCount: number
}
