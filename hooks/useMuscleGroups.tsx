import { useEffect, useState } from "react"

import { getMuscleGroups } from "@/db/repositories/catalog"
import { MuscleGroup } from "@/db/schema"

const useMuscleGroups = () => {
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[] | null>(null)

  useEffect(() => {
    let isActive = true

    ;(async () => {
      const nextMuscleGroups = await getMuscleGroups()

      if (!isActive) return

      setMuscleGroups(nextMuscleGroups)
    })()

    return () => {
      isActive = false
    }
  }, [])

  return muscleGroups
}

export default useMuscleGroups
