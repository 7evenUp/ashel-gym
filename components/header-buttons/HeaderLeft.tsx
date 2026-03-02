import { Pressable, StyleSheet } from "react-native"
import { ArrowLeftIcon } from "lucide-react-native"

import { md3Colors } from "@/constants/colors"

import { useWorkoutCreation } from "@/store/useWorkoutCreation"

const HeaderLeft = () => {
  const {
    currentStep,
    resetWorkoutCreation,
    goToMuscleGroupSelection,
    goToExerciseSelection,
  } = useWorkoutCreation()

  const onBackPress = () => {
    if (currentStep === "select-muscle-group") {
      resetWorkoutCreation()
      return
    }

    if (currentStep === "select-exercise") {
      goToMuscleGroupSelection()
      return
    }

    if (currentStep === "create-set") {
      goToExerciseSelection()
      return
    }
  }

  return (
    <Pressable style={styles.pressable} onPress={onBackPress}>
      <ArrowLeftIcon color={md3Colors.dark.onSurfaceVariant} size={24} />
    </Pressable>
  )
}

export default HeaderLeft

const styles = StyleSheet.create({
  pressable: { padding: 6 },
})
