import { useCallback, useEffect, useState } from "react"
import { addDatabaseChangeListener } from "expo-sqlite"

import { WorkoutMuscleGroup } from "@/db/schema"
import { getWorkoutMuscleGroups } from "@/db/prepared-statements/workoutMuscleGroup"

import useDb from "./useDb"

const useWorkoutMuscleGroups = () => {
  const db = useDb()

  const [workoutMuscleGroups, setWorkoutMuscleGroups] = useState<
    WorkoutMuscleGroup[] | null
  >(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refetch = useCallback(() => {
    setRefreshKey((prev) => prev + 1)
  }, [])

  useEffect(() => {
    ;(async () => {
      const muscleGroups = await getWorkoutMuscleGroups(db)
      setWorkoutMuscleGroups(muscleGroups)
    })()
  }, [refreshKey, db])

  useEffect(() => {
    const subscription = addDatabaseChangeListener((event) => {
      if (event.tableName !== "workout_muscle_group") return
      refetch()
    })

    return () => subscription.remove()
  }, [refetch])

  return { workoutMuscleGroups, refetch }
}

export default useWorkoutMuscleGroups
