import { useState } from "react"
import { StyleSheet } from "react-native"
import { Dumbbell, Flag, LayoutGrid } from "lucide-react-native"

import SplitButtons from "../SplitButtons"

import { finishWorkout } from "@/db/repositories/workouts"

import { useWorkoutCreation } from "@/store/useWorkoutCreation"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

const WorkoutCreationActions = () => {
  const [isFinishing, setIsFinishing] = useState(false)

  const {
    createdWorkoutId,
    currentStep,
    goToExerciseSelection,
    goToMuscleGroupSelection,
    resetWorkoutCreation,
  } = useWorkoutCreation()

  const onFinishWorkout = async () => {
    if (createdWorkoutId === null || isFinishing) return

    makeHapticFeedback()
    setIsFinishing(true)

    try {
      await finishWorkout(createdWorkoutId)

      resetWorkoutCreation()
    } finally {
      setIsFinishing(false)
    }
  }

  return (
    <SplitButtons style={styles.container}>
      {currentStep === "select-muscle-group" && (
        <SplitButtons.LargeButton
          label="Finish workout"
          Icon={Flag}
          onPress={onFinishWorkout}
        />
      )}
      {currentStep === "select-exercise" && (
        <>
          <SplitButtons.LeftButton
            label="New muscle group"
            Icon={LayoutGrid}
            onPress={() => {
              makeHapticFeedback()
              goToMuscleGroupSelection()
            }}
          />
          <SplitButtons.RightButton Icon={Flag} onPress={onFinishWorkout} />
        </>
      )}
      {currentStep === "create-set" && (
        <>
          <SplitButtons.LeftButton
            label="New exercise"
            Icon={Dumbbell}
            onPress={() => {
              makeHapticFeedback()
              goToExerciseSelection()
            }}
          />
          <SplitButtons.RightButton Icon={Flag} onPress={onFinishWorkout} />
        </>
      )}
    </SplitButtons>
  )
}

export default WorkoutCreationActions

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 16,
    bottom: 16,
    zIndex: 10,
  },
})
