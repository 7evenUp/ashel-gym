import { useEffect, useState } from "react"

import { getExercisesByMuscleGroupId } from "@/db/repositories/catalog"
import { Exercise } from "@/db/schema"

const useExercises = ({
  neededMuscleGroupId,
}: {
  neededMuscleGroupId: number | null
}) => {
  const [exercises, setExercises] = useState<Exercise[] | null>(null)

  useEffect(() => {
    let isActive = true

    ;(async () => {
      if (neededMuscleGroupId === null) {
        setExercises(null)
        return
      }

      const nextExercises =
        await getExercisesByMuscleGroupId(neededMuscleGroupId)

      if (!isActive) return

      setExercises(nextExercises)
    })()

    return () => {
      isActive = false
    }
  }, [neededMuscleGroupId])

  return exercises
}

export default useExercises
