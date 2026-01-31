import { StyleSheet, Text, View } from "react-native"
import React, { useEffect, useState } from "react"
import { useLocalSearchParams } from "expo-router"
import { useSQLiteContext } from "expo-sqlite"
import { drizzle } from "drizzle-orm/expo-sqlite"
import { Exercise, exerciseTable } from "@/db/schema"
import { eq } from "drizzle-orm"
import { logger } from "@/utils/logger"

const MuscleGroupScreen = () => {
  const { muscleGroupId } = useLocalSearchParams()

  const [exercises, setExercises] = useState<Exercise[] | null>(null)

  const expoDB = useSQLiteContext()
  const db = drizzle(expoDB)

  useEffect(() => {
    ;(async () => {
      const neededId = Array.isArray(muscleGroupId)
        ? parseInt(muscleGroupId[0])
        : parseInt(muscleGroupId)

      const exercises = await db
        .select()
        .from(exerciseTable)
        .where(eq(exerciseTable.muscle_group_id, neededId))
      setExercises(exercises)
    })()
  }, [])

  logger("Inside [muscleGroupId].tsx ====== exercises: ", exercises)

  return (
    <View>
      <Text>Muscle group id: {muscleGroupId}</Text>
      {exercises &&
        exercises.length > 0 &&
        exercises.map((exercise) => (
          <Text key={exercise.id}>{exercise.name}</Text>
        ))}
    </View>
  )
}

export default MuscleGroupScreen

const styles = StyleSheet.create({})
