import { useState } from "react"
import { StyleSheet } from "react-native"
import { eq } from "drizzle-orm"
import { Dumbbell, Flag, LayoutGrid } from "lucide-react-native"

import SplitButtons from "../SplitButtons"

import useDb from "@/hooks/useDb"

import { workoutTable } from "@/db/schema"

import { useWorkoutCreation } from "@/store/useWorkoutCreation"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

const WorkoutCreationActions = () => {
  const db = useDb()

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
      await db
        .update(workoutTable)
        .set({ finished_at: new Date().getTime() })
        .where(eq(workoutTable.id, createdWorkoutId))

      resetWorkoutCreation()
    } finally {
      setIsFinishing(false)
    }
  }

  return (
    <SplitButtons style={styles.container}>
      {currentStep === "select-muscle-group" && (
        <SplitButtons.LargeButton
          label="Завершить тренировку"
          Icon={Flag}
          onPress={onFinishWorkout}
        />
      )}
      {currentStep === "select-exercise" && (
        <>
          <SplitButtons.LeftButton
            label="Новая группа"
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
            label="Новое упражнение"
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
