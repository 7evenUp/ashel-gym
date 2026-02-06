import React, { useEffect, useMemo, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { FlashList } from "@shopify/flash-list"

import { Image } from "expo-image"
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

import { exerciseImages } from "@/constants/exerciseImages"

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

  const renderFlashListItem = ({
    item,
    index,
  }: {
    item: Exercise
    index: number
  }) => {
    const marginLeft = index % 2 === 0 ? 0 : 6
    const marginRight = index % 2 === 0 ? 6 : 0

    return (
      <Pressable
        key={item.id}
        onPress={() => {
          setExercise(item)
          router.navigate("/stats-modal")
        }}
        style={{
          alignItems: "center",
          marginLeft,
          marginRight,
          paddingBottom: 8,
          gap: 8,
        }}
      >
        <Image
          style={styles.image}
          source={exerciseImages[muscleGroup.name][item.image]}
          transition={250}
        />
        <Text style={styles.exercise_name}>{item.name}</Text>
      </Pressable>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {muscleGroup.name}: {muscleGroupId}
      </Text>
      {exercises && exercises.length > 0 && (
        <FlashList
          data={exercises}
          style={{ width: "100%" }}
          contentContainerStyle={{
            padding: 16,
          }}
          numColumns={2}
          renderItem={renderFlashListItem}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </View>
  )
}

export default MuscleGroupScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    alignItems: "center",
  },
  title: {
    marginVertical: 12,
    color: "white",
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
    color: "rgba(255,255,255,0.8)",
    paddingHorizontal: 8,
    textAlign: "center",
  },
})
