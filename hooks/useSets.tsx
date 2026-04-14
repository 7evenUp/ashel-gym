import { useCallback, useEffect, useState } from "react"

import { getExerciseSets } from "@/db/repositories/sets"
import { ExerciseSet } from "@/db/schema"

const useSets = ({
  exerciseId,
  workoutId,
}: {
  exerciseId: number | null
  workoutId: number | null
}) => {
  const [sets, setSets] = useState<ExerciseSet[] | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refetch = useCallback(() => {
    setRefreshKey((prev) => prev + 1)
  }, [])

  useEffect(() => {
    let isActive = true

    ;(async () => {
      if (exerciseId === null || workoutId === null) {
        setSets(null)
        return
      }

      const nextSets = await getExerciseSets({
        exercise_id: exerciseId,
        workout_id: workoutId,
      })

      if (!isActive) return

      setSets(nextSets)
    })()

    return () => {
      isActive = false
    }
  }, [exerciseId, workoutId, refreshKey])

  return { sets, refetch }
}

export default useSets
