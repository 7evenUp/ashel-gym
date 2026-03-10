import { StyleSheet, View } from "react-native"

import IdleStep from "@/components/workout-creation/IdleStep"
import SelectMuscleGroup from "@/components/workout-creation/SelectMuscleGroup"
import SelectExercise from "@/components/workout-creation/SelectExercise"
import CreateSet from "@/components/workout-creation/CreateSet"
import WorkoutCreationProgress from "@/components/workout-creation/WorkoutCreationProgress"
import WorkoutCreationActions from "@/components/workout-creation/WorkoutCreationActions"

import { md3Colors } from "@/constants/colors"

import { useWorkoutCreation } from "@/store/useWorkoutCreation"

export default function TrainingScreen() {
  const { currentStep } = useWorkoutCreation()

  const isWorkoutCreationStarted = currentStep !== "idle"

  let content = <IdleStep />

  if (currentStep === "select-muscle-group") {
    content = <SelectMuscleGroup />
  } else if (currentStep === "select-exercise") {
    content = <SelectExercise />
  } else if (currentStep === "create-set") {
    content = <CreateSet />
  }

  return (
    <View style={styles.container}>
      {isWorkoutCreationStarted && (
        <WorkoutCreationProgress currentStep={currentStep} />
      )}

      <View style={styles.content}>{content}</View>

      {isWorkoutCreationStarted && <WorkoutCreationActions />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: md3Colors.dark.background,
    position: "relative",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  content: {
    flex: 1,
    width: "100%",
    alignItems: "center",
  },
})
