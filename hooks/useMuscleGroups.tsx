import { useEffect, useState } from "react"

import { MuscleGroup, muscleGroupTable } from "@/db/schema"

import useDb from "./useDb"

const useMuscleGroups = () => {
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[] | null>(null)

  const db = useDb()

  useEffect(() => {
    ;(async () => {
      const muscleGroups = await db.select().from(muscleGroupTable)
      setMuscleGroups(muscleGroups)
    })()
  }, [])

  return muscleGroups
}

export default useMuscleGroups
