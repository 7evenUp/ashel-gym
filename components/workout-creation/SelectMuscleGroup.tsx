import { Pressable, StyleSheet, Text, View } from "react-native"
import { Image } from "expo-image"
import * as Haptics from "expo-haptics"

import { MuscleGroup } from "@/db/schema"
import { createWorkoutMuscleGroupIfNotExist } from "@/db/prepared-statements/workoutMuscleGroup"

import { muscleGroupImages } from "@/constants/muscleGroupImages"

import useMuscleGroups from "@/hooks/useMuscleGroups"
import useDb from "@/hooks/useDb"

import { useWorkoutCreation } from "@/store/useWorkoutCreation"

const SelectMuscleGroup = () => {
  const muscleGroups = useMuscleGroups()
  const db = useDb()

  const { createdWorkoutId, setSelectedMuscleGroup, goToExerciseSelection } =
    useWorkoutCreation()

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

  return (
    <>
      <Text style={styles.title}>Что сегодня тренировал?</Text>
      {muscleGroups && (
        <View style={styles.wrapper}>
          {muscleGroups.map((muscle) => (
            <Pressable
              key={muscle.id}
              style={styles.image_container}
              onPress={() => onMuscleGroupPress(muscle)}
            >
              <Image
                style={styles.image}
                source={muscleGroupImages[muscle.name].img}
                placeholder={{
                  blurhash: muscleGroupImages[muscle.name].blurhash,
                }}
                transition={250}
              />
            </Pressable>
          ))}
        </View>
      )}
    </>
  )
}

export default SelectMuscleGroup

const styles = StyleSheet.create({
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: 600,
    marginVertical: 12,
  },
  wrapper: {
    flexWrap: "wrap",
    flexDirection: "row",
  },
  image_container: {
    aspectRatio: 1 / 1,
    width: "50%",
    height: "100%",
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderBottomWidth: 6,
    borderColor: "#211e27",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
})
