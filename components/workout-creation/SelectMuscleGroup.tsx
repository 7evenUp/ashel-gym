import { useEffect, useState } from "react"
import { Pressable, ScrollView, StyleSheet, View } from "react-native"
import { Image } from "expo-image"
import * as Haptics from "expo-haptics"
import { eq, inArray } from "drizzle-orm"
import { CheckIcon } from "lucide-react-native"

import { MuscleGroup, exerciseSetTable, exerciseTable } from "@/db/schema"
import { createWorkoutMuscleGroupIfNotExist } from "@/db/prepared-statements/workoutMuscleGroup"

import { md3Colors } from "@/constants/colors"
import { muscleGroupImages } from "@/constants/muscleGroupImages"

import useMuscleGroups from "@/hooks/useMuscleGroups"
import useDb from "@/hooks/useDb"

import { useWorkoutCreation } from "@/store/useWorkoutCreation"

const SelectMuscleGroup = () => {
  const db = useDb()

  const muscleGroups = useMuscleGroups()

  const [highlightedMuscleGroupIds, setHighlightedMuscleGroupIds] = useState<
    number[]
  >([])

  const { createdWorkoutId, setSelectedMuscleGroup, goToExerciseSelection } =
    useWorkoutCreation()

  useEffect(() => {
    const loadHighlightedMuscleGroups = async () => {
      if (createdWorkoutId === null) {
        setHighlightedMuscleGroupIds([])
        return
      }

      const workoutSets = await db
        .select()
        .from(exerciseSetTable)
        .where(eq(exerciseSetTable.workout_id, createdWorkoutId))

      // Массив id не пустых упражнений
      // (внутри которых есть хотя бы один полноценный подход)
      const nonEmptyExerciseIds = Array.from(
        new Set(
          workoutSets
            .filter((set) => set.reps > 0 && set.weight > 0)
            .map((set) => set.exercise_id),
        ),
      )

      if (nonEmptyExerciseIds.length === 0) {
        setHighlightedMuscleGroupIds([])
        return
      }

      const exercises = await db
        .select({
          muscle_group_id: exerciseTable.muscle_group_id,
        })
        .from(exerciseTable)
        .where(inArray(exerciseTable.id, nonEmptyExerciseIds))

      setHighlightedMuscleGroupIds(
        Array.from(
          new Set(exercises.map((exercise) => exercise.muscle_group_id)),
        ),
      )
    }

    loadHighlightedMuscleGroups()
  }, [createdWorkoutId, db])

  const onMuscleGroupPress = async (muscle: MuscleGroup) => {
    if (createdWorkoutId === null) return

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)

    await createWorkoutMuscleGroupIfNotExist(
      {
        muscle_group_id: muscle.id,
        workout_id: createdWorkoutId,
      },
      db,
    )

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
              {isHighlighted && (
                <View style={styles.doneBadge}>
                  <CheckIcon
                    size={24}
                    color={md3Colors.dark.onPrimaryContainer}
                  />
                </View>
              )}
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
  doneBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
    backgroundColor: md3Colors.dark.primaryContainer,
    borderWidth: 1,
    borderColor: md3Colors.dark.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
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
