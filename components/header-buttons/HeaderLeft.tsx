import { Pressable, StyleSheet } from "react-native"
import { ArrowLeftIcon } from "lucide-react-native"
import { useWorkoutCreation } from "@/store/useWorkoutCreation"

const HeaderLeft = () => {
  const {
    currentStep,
    setCurrentStep,
    setSelectedMuscleGroup,
    setSelectedExercise,
  } = useWorkoutCreation()

  const onBackPress = () => {
    if (currentStep === "select-muscle-group") {
      setCurrentStep("idle")
      return
    }

    if (currentStep === "select-exercise") {
      setCurrentStep("select-muscle-group")
      setSelectedMuscleGroup(null)
      return
    }

    if (currentStep === "create-set") {
      setCurrentStep("select-exercise")
      setSelectedExercise(null)
      return
    }
  }

  return (
    <Pressable style={styles.pressable} onPress={onBackPress}>
      <ArrowLeftIcon color="rgba(255,255,255,0.6)" size={24} />
    </Pressable>
  )
}

export default HeaderLeft

const styles = StyleSheet.create({
  pressable: { padding: 6 },
})
