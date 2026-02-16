import { useEffect, useState } from "react"
import { useSQLiteContext } from "expo-sqlite"
import { drizzle } from "drizzle-orm/expo-sqlite"

import { MuscleGroup, muscleGroupTable } from "@/db/schema"

const useMuscleGroups = () => {
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[] | null>(null)

  const expoDB = useSQLiteContext()
  const db = drizzle(expoDB)

  useEffect(() => {
    ;(async () => {
      const muscleGroups = await db.select().from(muscleGroupTable)
      setMuscleGroups(muscleGroups)
    })()
  }, [])

  return muscleGroups
}

export default useMuscleGroups
