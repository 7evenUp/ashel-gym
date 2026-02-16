import { StyleSheet, View } from "react-native"

import IdleStep from "@/components/workout-creation/IdleStep"
import SelectMuscleGroup from "@/components/workout-creation/SelectMuscleGroup"
import SelectExercise from "@/components/workout-creation/SelectExercise"
import CreateSet from "@/components/workout-creation/CreateSet"

import { useWorkoutCreation } from "@/store/useWorkoutCreation"

export default function TrainingScreen() {
  const { currentStep } = useWorkoutCreation()

  return (
    <View style={styles.container}>
      {currentStep === "idle" ? (
        <IdleStep />
      ) : currentStep === "select-muscle-group" ? (
        <SelectMuscleGroup />
      ) : currentStep === "select-exercise" ? (
        <SelectExercise />
      ) : (
        currentStep === "create-set" && <CreateSet />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#211e27",
    padding: 16,
  },
})
