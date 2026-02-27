import { useEffect, useState } from "react"
import { eq } from "drizzle-orm"

import { Exercise, exerciseTable } from "@/db/schema"

import useDb from "./useDb"

const useExercises = ({
  neededMuscleGroupId,
}: {
  neededMuscleGroupId: number | null
}) => {
  const [exercises, setExercises] = useState<Exercise[] | null>(null)

  const db = useDb()

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
