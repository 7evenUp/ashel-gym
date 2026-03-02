import { useEffect, useState } from "react"
import { addDatabaseChangeListener } from "expo-sqlite"

import useDb from "@/hooks/useDb"

import {
  exerciseSetTable,
  exerciseTable,
  muscleGroupTable,
  workoutTable,
} from "@/db/schema"

import { DaySummary } from "./types"
import { formatMuscleGroupName, toDayKey } from "./utils"

type DaySummaryDraft = {
  workoutIds: Set<number>
  muscleGroups: Set<string>
  exerciseSetCounts: Map<number, { name: string; setsCount: number }>
  setsCount: number
}

const TRACKED_TABLES = ["workout", "exercise_set", "exercise", "muscle_group"]

const useCalendarData = () => {
  const db = useDb()

  const [daySummaries, setDaySummaries] = useState<Map<string, DaySummary>>(
    () => new Map(),
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isActive = true

    const loadCalendarData = async () => {
      const [workouts, exerciseSets, exercises, muscleGroups] =
        await Promise.all([
          db.select().from(workoutTable),
          db.select().from(exerciseSetTable),
          db.select().from(exerciseTable),
          db.select().from(muscleGroupTable),
        ])

      if (!isActive) return

      const exercisesById = new Map(
        exercises.map((exercise) => [exercise.id, exercise]),
      )
      const muscleGroupsById = new Map(
        muscleGroups.map((muscleGroup) => [muscleGroup.id, muscleGroup]),
      )
      const summaryDrafts = new Map<string, DaySummaryDraft>()
      const validSets = exerciseSets.filter(
        (set) => set.reps > 0 && set.weight > 0,
      )
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
            exerciseSetCounts: new Map<
              number,
              { name: string; setsCount: number }
            >(),
            setsCount: 0,
          }
          summaryDrafts.set(dayKey, draft)
        }

        draft.workoutIds.add(workout.id)

        workoutSets.forEach((set) => {
          const exercise = exercisesById.get(set.exercise_id)

          if (!exercise) return

          draft.setsCount += 1

          const exerciseSummary = draft.exerciseSetCounts.get(exercise.id)

          if (exerciseSummary) {
            exerciseSummary.setsCount += 1
          } else {
            draft.exerciseSetCounts.set(exercise.id, {
              name: exercise.name,
              setsCount: 1,
            })
          }

          const muscleGroup = muscleGroupsById.get(exercise.muscle_group_id)
          if (muscleGroup) {
            draft.muscleGroups.add(formatMuscleGroupName(muscleGroup.name))
          }
        })
      })

      const nextSummaries = new Map<string, DaySummary>()

      summaryDrafts.forEach((draft, dayKey) => {
        nextSummaries.set(dayKey, {
          dateKey: dayKey,
          workoutCount: draft.workoutIds.size,
          muscleGroups: Array.from(draft.muscleGroups.values()),
          exercises: Array.from(draft.exerciseSetCounts.entries())
            .map(([id, value]) => ({
              id,
              name: value.name,
              setsCount: value.setsCount,
            }))
            .sort(
              (a, b) =>
                b.setsCount - a.setsCount || a.name.localeCompare(b.name),
            ),
          setsCount: draft.setsCount,
        })
      })

      setDaySummaries(nextSummaries)
      setIsLoading(false)
    }

    loadCalendarData()

    const subscription = addDatabaseChangeListener((event) => {
      if (!TRACKED_TABLES.includes(event.tableName)) return
      loadCalendarData()
    })

    return () => {
      isActive = false
      subscription.remove()
    }
  }, [db])

  return { daySummaries, isLoading }
}

export default useCalendarData
