import { useCallback, useEffect, useState } from "react"

import { ExerciseSet } from "@/db/schema"
import { getExerciseSets } from "@/db/prepared-statements"

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
    ;(async () => {
      if (exerciseId === null || workoutId === null) return

      const sets = await getExerciseSets({
        exercise_id: exerciseId,
        workout_id: workoutId,
      })

      setSets(sets)
    })()
  }, [exerciseId, workoutId, refreshKey])

  return { sets, refetch }
}

export default useSets
