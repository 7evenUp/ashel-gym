import { useEffect, useState } from "react"
import { Pressable, ScrollView, StyleSheet, View } from "react-native"
import { Image } from "expo-image"

import DoneBadge from "../DoneBadge"

import { MuscleGroup } from "@/db/schema"
import {
  ensureWorkoutMuscleGroup,
  getCompletedMuscleGroupIdsForWorkout,
} from "@/db/repositories/workouts"

import { md3Colors } from "@/constants/colors"
import { muscleGroupImages } from "@/constants/muscleGroupImages"

import useMuscleGroups from "@/hooks/useMuscleGroups"

import { useWorkoutCreation } from "@/store/useWorkoutCreation"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

const SelectMuscleGroup = () => {
  const muscleGroups = useMuscleGroups()

  const [highlightedMuscleGroupIds, setHighlightedMuscleGroupIds] = useState<
    number[]
  >([])

  const { createdWorkoutId, setSelectedMuscleGroup, goToExerciseSelection } =
    useWorkoutCreation()

  useEffect(() => {
    let isActive = true

    const loadHighlightedMuscleGroups = async () => {
      if (createdWorkoutId === null) {
        setHighlightedMuscleGroupIds([])
        return
      }

      const highlightedIds =
        await getCompletedMuscleGroupIdsForWorkout(createdWorkoutId)

      if (!isActive) return

      setHighlightedMuscleGroupIds(highlightedIds)
    }

    loadHighlightedMuscleGroups()

    return () => {
      isActive = false
    }
  }, [createdWorkoutId])

  const onMuscleGroupPress = async (muscle: MuscleGroup) => {
    if (createdWorkoutId === null) return

    makeHapticFeedback()

    await ensureWorkoutMuscleGroup({
      muscle_group_id: muscle.id,
      workout_id: createdWorkoutId,
    })

    setSelectedMuscleGroup(muscle)
    goToExerciseSelection()
  }

  if (!muscleGroups) return

  return (
    <ScrollView
      contentContainerStyle={styles.scroll_view_container}
      style={styles.scroll_view}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.wrapper}>
        {muscleGroups.map((muscle) => {
          const isHighlighted = highlightedMuscleGroupIds.includes(muscle.id)

          return (
            <Pressable
              key={muscle.id}
              style={styles.imageContainer}
              onPress={() => onMuscleGroupPress(muscle)}
            >
              {isHighlighted && <DoneBadge />}
              <Image
                style={[styles.image, isHighlighted && styles.imageHighlighted]}
                source={muscleGroupImages[muscle.name].img}
                placeholder={{
                  blurhash: muscleGroupImages[muscle.name].blurhash,
                }}
                transition={250}
              />
            </Pressable>
          )
        })}
      </View>
    </ScrollView>
  )
}

export default SelectMuscleGroup

const styles = StyleSheet.create({
  scroll_view: {
    width: "100%",
  },
  scroll_view_container: {
    alignItems: "center",
    paddingBottom: 100,
  },
  wrapper: {
    flexWrap: "wrap",
    flexDirection: "row",
  },
  imageContainer: {
    aspectRatio: 1 / 1,
    width: "50%",
    height: "100%",
    position: "relative",
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderBottomWidth: 6,
    borderColor: md3Colors.dark.background,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  imageHighlighted: {
    borderWidth: 1.5,
    borderColor: md3Colors.dark.primary,
  },
})
