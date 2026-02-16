import { useEffect, useState } from "react"
import { useSQLiteContext } from "expo-sqlite"
import { drizzle } from "drizzle-orm/expo-sqlite"
import { eq } from "drizzle-orm"

import { Exercise, exerciseTable } from "@/db/schema"

const useExercises = ({
  neededMuscleGroupId,
}: {
  neededMuscleGroupId: number | null
}) => {
  const [exercises, setExercises] = useState<Exercise[] | null>(null)

  const expoDB = useSQLiteContext()
  const db = drizzle(expoDB)

  useEffect(() => {
    ;(async () => {
      if (neededMuscleGroupId === null) return

      const exercises = await db
        .select()
        .from(exerciseTable)
        .where(eq(exerciseTable.muscle_group_id, neededMuscleGroupId))

      setExercises(exercises)
    })()
  }, [neededMuscleGroupId])

  return exercises
}

export default useExercises
