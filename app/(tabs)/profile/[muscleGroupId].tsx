import React, { useEffect, useMemo, useState } from "react"
import { StyleSheet, Text, View } from "react-native"

import { useLocalSearchParams, useRouter } from "expo-router"

import { eq } from "drizzle-orm"

import { logger } from "@/utils/logger"

import {
  type Exercise,
  type MuscleGroup,
  exerciseTable,
  muscleGroupTable,
} from "@/db/schema"

import EmptyScreen from "@/components/EmptyScreen"
import LoadingScreen from "@/components/LoadingScreen"
import ExercisesGrid from "@/components/ExercisesGrid"

import { md3Colors } from "@/constants/colors"

import { useSelectedExercise } from "@/store/useSelectedExercise"

import useDb from "@/hooks/useDb"

const MuscleGroupScreen = () => {
  const { muscleGroupId } = useLocalSearchParams()

  const setExercise = useSelectedExercise((state) => state.setExercise)

  const router = useRouter()

  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | null>(null)
  const [exercises, setExercises] = useState<Exercise[] | null>(null)

  const db = useDb()

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
      <Text style={styles.title}>
        {muscleGroup.name}: {muscleGroupId}
      </Text>
      {exercises && exercises.length > 0 && (
        <ExercisesGrid
          exercises={exercises}
          muscleGroup={muscleGroup}
          onExercisePress={(exercise) => {
            setExercise(exercise)
            router.navigate("/stats-modal")
          }}
        />
      )}
    </View>
  )
}

export default MuscleGroupScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: md3Colors.dark.background,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  title: {
    marginVertical: 12,
    color: md3Colors.dark.onSurface,
    fontSize: 20,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  image: {
    aspectRatio: 1 / 1,
    width: "100%",
    borderRadius: 24,
  },
  exercise_name: {
    fontSize: 14,
    color: md3Colors.dark.onSurface,
    paddingHorizontal: 8,
    textAlign: "center",
  },
})
