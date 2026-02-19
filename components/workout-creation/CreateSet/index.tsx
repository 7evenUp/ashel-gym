import { StyleSheet, Text, View } from "react-native"
import { Image } from "expo-image"

import ExerciseSetItem from "./ExerciseSetItem"

import { exerciseImages } from "@/constants/exerciseImages"

import { useWorkoutCreation } from "@/store/useWorkoutCreation"

import useSets from "@/hooks/useSets"

const CreateSet = () => {
  const { selectedExercise, selectedMuscleGroup, createdWorkoutId } =
    useWorkoutCreation()

  const { sets, refetch } = useSets({
    exerciseId: selectedExercise ? selectedExercise.id : null,
    workoutId: createdWorkoutId ?? null,
  })

  console.log("sets: ", sets)

  if (selectedExercise === null) return
  if (selectedMuscleGroup === null) return
  if (sets === null) return

  return (
    <>
      <Text style={styles.title}>{selectedExercise.name}</Text>

      <View style={styles.image_wrapper}>
        <Image
          style={styles.image}
          source={
            exerciseImages[selectedMuscleGroup.name][selectedExercise.image]
          }
        />
      </View>

      {sets.map((set, i) => (
        <ExerciseSetItem
          key={set.id}
          {...set}
          isLast={i === sets.length - 1}
          refetchSets={refetch}
        />
      ))}
    </>
  )
}

export default CreateSet

const styles = StyleSheet.create({
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: 600,
    marginVertical: 12,
  },
  image_wrapper: {
    aspectRatio: 1 / 1,
    width: "60%",
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
})
