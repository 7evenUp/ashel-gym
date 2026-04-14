import { db } from "@/db/client"
import {
  exerciseSetTable,
  exerciseTable,
  muscleGroupTable,
  workoutTable,
} from "@/db/schema"

export const CALENDAR_TRACKED_TABLES = [
  "workout",
  "exercise_set",
  "exercise",
  "muscle_group",
] as const

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
  image: string
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

type DaySummaryDraft = {
  workoutIds: Set<number>
  muscleGroups: Set<string>
  exercises: Map<
    number,
    {
      name: string
      image: string
      muscleGroup: string
      sets: DayExerciseSetSummary[]
    }
  >
  setsCount: number
}

const toDayKey = (value: number | Date) => {
  const date = value instanceof Date ? value : new Date(value)

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-")
}

const formatMuscleGroupName = (name: string) => {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

export const getCalendarDaySummaries = async (): Promise<
  Map<string, DaySummary>
> => {
  const [workouts, exerciseSets, exercises, muscleGroups] = await Promise.all([
    db.select().from(workoutTable),
    db.select().from(exerciseSetTable),
    db.select().from(exerciseTable),
    db.select().from(muscleGroupTable),
  ])

  const exercisesById = new Map(
    exercises.map((exercise) => [exercise.id, exercise]),
  )
  const muscleGroupsById = new Map(
    muscleGroups.map((muscleGroup) => [muscleGroup.id, muscleGroup]),
  )
  const summaryDrafts = new Map<string, DaySummaryDraft>()
  const validSets = exerciseSets.filter((set) => set.reps > 0 && set.weight > 0)
  const setsByWorkoutId = new Map<number, typeof validSets>()

  validSets.forEach((set) => {
    const sets = setsByWorkoutId.get(set.workout_id)

    if (sets) {
      sets.push(set)
      return
    }

    setsByWorkoutId.set(set.workout_id, [set])
  })

  workouts.forEach((workout) => {
    const workoutSets = setsByWorkoutId.get(workout.id)

    if (!workoutSets || workoutSets.length === 0) return

    const dayKey = toDayKey(workout.created_at)
    let draft = summaryDrafts.get(dayKey)

    if (!draft) {
      draft = {
        workoutIds: new Set<number>(),
        muscleGroups: new Set<string>(),
        exercises: new Map(),
        setsCount: 0,
      }
      summaryDrafts.set(dayKey, draft)
    }

    draft.workoutIds.add(workout.id)

    workoutSets.forEach((set) => {
      const exercise = exercisesById.get(set.exercise_id)

      if (!exercise) return

      const muscleGroup = muscleGroupsById.get(exercise.muscle_group_id) ?? null
      const muscleGroupName = muscleGroup
        ? formatMuscleGroupName(muscleGroup.name)
        : "Unknown"

      draft.setsCount += 1

      const exerciseSummary = draft.exercises.get(exercise.id)
      const setSummary: DayExerciseSetSummary = {
        id: set.id,
        order: set.order,
        reps: set.reps,
        weight: set.weight,
        workoutId: workout.id,
        workoutCreatedAt: workout.created_at,
      }

      if (exerciseSummary) {
        exerciseSummary.sets.push(setSummary)
      } else {
        draft.exercises.set(exercise.id, {
          name: exercise.name,
          image: exercise.image,
          muscleGroup: muscleGroupName,
          sets: [setSummary],
        })
      }

      draft.muscleGroups.add(muscleGroupName)
    })
  })

  const nextSummaries = new Map<string, DaySummary>()

  summaryDrafts.forEach((draft, dayKey) => {
    nextSummaries.set(dayKey, {
      dateKey: dayKey,
      workoutCount: draft.workoutIds.size,
      muscleGroups: Array.from(draft.muscleGroups.values()).sort((a, b) =>
        a.localeCompare(b),
      ),
      exercises: Array.from(draft.exercises.entries())
        .map(([id, value]) => ({
          id,
          name: value.name,
          image: value.image,
          muscleGroup: value.muscleGroup,
          setsCount: value.sets.length,
          sets: value.sets
            .slice()
            .sort(
              (a, b) =>
                a.workoutCreatedAt - b.workoutCreatedAt ||
                a.order - b.order ||
                a.id - b.id,
            ),
        }))
        .sort(
          (a, b) => b.setsCount - a.setsCount || a.name.localeCompare(b.name),
        ),
      setsCount: draft.setsCount,
    })
  })

  return nextSummaries
}
