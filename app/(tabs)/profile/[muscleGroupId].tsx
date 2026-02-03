import React, { useEffect, useMemo, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

import { useLocalSearchParams, useRouter } from "expo-router"
import { useSQLiteContext } from "expo-sqlite"

import { drizzle } from "drizzle-orm/expo-sqlite"
import { eq } from "drizzle-orm"

import { logger } from "@/utils/logger"

import {
  type Exercise,
  type MuscleGroup,
  exerciseTable,
  muscleGroupTable,
} from "@/db/schema"

import LoadingScreen from "@/components/LoadingScreen"
import EmptyScreen from "@/components/EmptyScreen"

import { useSelectedExercise } from "@/store/useSelectedExercise"

const MuscleGroupScreen = () => {
  const { muscleGroupId } = useLocalSearchParams()

  const setExercise = useSelectedExercise((state) => state.setExercise)

  const router = useRouter()

  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | null>(null)
  const [exercises, setExercises] = useState<Exercise[] | null>(null)

  const expoDB = useSQLiteContext()
  const db = drizzle(expoDB)

  const neededMuscleGroupId = useMemo(() => {
    return Array.isArray(muscleGroupId)
      ? parseInt(muscleGroupId[0])
      : parseInt(muscleGroupId)
  }, [muscleGroupId])

  useEffect(() => {
    const getDataFromDb = async () => {
      const [muscleGroup] = await db
        .select()
        .from(muscleGroupTable)
        .where(eq(muscleGroupTable.id, neededMuscleGroupId))

      const exercises = await db
        .select()
        .from(exerciseTable)
        .where(eq(exerciseTable.muscle_group_id, neededMuscleGroupId))

      setMuscleGroup(muscleGroup)
      setExercises(exercises)
    }

    getDataFromDb()
  }, [])

  logger("Inside [muscleGroupId].tsx ====== exercises: ", exercises)

  if (muscleGroup === null || exercises === null) return <LoadingScreen />

  if (exercises.length === 0) return <EmptyScreen />

  return (
    <View style={styles.container}>
      <Text
        style={{
          color: "white",
          fontSize: 24,
          fontWeight: "600",
          textTransform: "capitalize",
        }}
      >
        {muscleGroup.name}: {muscleGroupId}
      </Text>
      {exercises &&
        exercises.length > 0 &&
        exercises.map((exercise) => (
          <Pressable
            key={exercise.id}
            onPress={() => {
              setExercise(exercise)
              router.navigate("/stats-modal")
            }}
            style={{
              padding: 6,
              borderRadius: 8,
              backgroundColor: "#3f3f3f",
              margin: 6,
            }}
          >
            <Text style={{ fontSize: 20, color: "white" }}>
              {exercise.name}
            </Text>
          </Pressable>
        ))}
    </View>
  )
}

export default MuscleGroupScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    alignItems: "center",
    padding: 16,
  },
})
