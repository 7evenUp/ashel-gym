import { Pressable, StyleSheet, Text, View } from "react-native"
import * as Haptics from "expo-haptics"

import useExercises from "@/hooks/useExercises"

import { useWorkoutCreation } from "@/store/useWorkoutCreation"
import { Exercise } from "@/db/schema"

const SelectExercise = () => {
  const { selectedMuscleGroup, setSelectedExercise, setCurrentStep } =
    useWorkoutCreation()

  const exercises = useExercises({
    neededMuscleGroupId: selectedMuscleGroup ? selectedMuscleGroup.id : null,
  })

  if (exercises === null || exercises.length === 0) return

  const onExercisePress = (exercise: Exercise) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
    setSelectedExercise(exercise)
    setCurrentStep("create-set")
  }

  return (
    <View style={{ gap: 6, width: "100%", marginTop: 12 }}>
      {exercises.map((exercise) => (
        <Pressable
          key={exercise.id}
          style={(state) => [
            {
              backgroundColor: "#3f4a12",
              padding: 6,
              borderRadius: 6,
              width: "100%",
            },
            state.pressed && {
              backgroundColor: "#323b0f",
              transform: [{ scale: 0.99 }],
            },
          ]}
          onPress={() => onExercisePress(exercise)}
        >
          <Text style={{ color: "white" }}>{exercise.name}</Text>
        </Pressable>
      ))}
    </View>
  )
}

export default SelectExercise

const styles = StyleSheet.create({})
