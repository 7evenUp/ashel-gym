import { useEffect, useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import { Image } from "expo-image"
import { useRouter } from "expo-router"
import { FlashList } from "@shopify/flash-list"

import ExercisesGrid from "@/components/ExercisesGrid"

import { md3Colors } from "@/constants/colors"
import { muscleGroupImages } from "@/constants/muscleGroupImages"

import { useSelectedExercise } from "@/store/useSelectedExercise"

import { MuscleGroup } from "@/db/schema"

import useMuscleGroups from "@/hooks/useMuscleGroups"
import useExercises from "@/hooks/useExercises"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"
import { logger } from "@/utils/logger"

export default function ProfileScreen() {
  const router = useRouter()

  const [selectedMuscleGroup, setSelectedMuscleGroup] =
    useState<MuscleGroup | null>(null)

  const muscleGroups = useMuscleGroups()
  const exercises = useExercises({
    neededMuscleGroupId: selectedMuscleGroup ? selectedMuscleGroup.id : null,
  })

  const setExercise = useSelectedExercise((state) => state.setExercise)

  useEffect(() => {
    if (!muscleGroups) return

    setSelectedMuscleGroup(muscleGroups[0])
  }, [muscleGroups])

  logger("MuscleGroups: ", muscleGroups)
  logger("Exercises for selected muscle group: ", exercises)

  return (
    <View style={styles.container}>
      {muscleGroups && (
        <FlashList
          data={muscleGroups}
          horizontal
          style={{ width: "100%" }}
          contentContainerStyle={{
            padding: 16,
          }}
          renderItem={({ item, index }) => {
            const marginLeft = index === 0 ? 0 : 12

            return (
              <Pressable
                style={[
                  styles.muscleGroupItem,
                  selectedMuscleGroup !== null &&
                    selectedMuscleGroup.id === item.id &&
                    styles.muscleGroupItemSelected,
                  { marginLeft },
                ]}
                onPress={() => {
                  makeHapticFeedback()
                  setSelectedMuscleGroup(item)
                }}
              >
                <Image
                  style={styles.image}
                  source={muscleGroupImages[item.name].img}
                  placeholder={{
                    blurhash: muscleGroupImages[item.name].blurhash,
                  }}
                  transition={250}
                />
              </Pressable>
            )
          }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsHorizontalScrollIndicator={false}
        />
      )}
      {selectedMuscleGroup && exercises && exercises.length > 0 && (
        <ExercisesGrid
          exercises={exercises}
          muscleGroup={selectedMuscleGroup}
          onExercisePress={(exercise) => {
            setExercise(exercise)
            router.navigate("/stats-modal")
          }}
          containerStyle={{ padding: 16 }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: md3Colors.dark.background,
    alignItems: "center",
  },
  muscleGroupItem: {
    aspectRatio: 1 / 1,
    borderRadius: 18,
    height: 100,
    boxShadow:
      "0px 4px 8px 3px rgba(0,0,0,0.15), 0px 1px 3px 0px rgba(0,0,0,0.3)",
    borderWidth: 1,
    borderColor: "transparent",
  },
  muscleGroupItemSelected: {
    borderColor: md3Colors.dark.primary,
  },
  image: {
    height: "100%",
    width: "100%",
    borderRadius: 18,
  },
})
