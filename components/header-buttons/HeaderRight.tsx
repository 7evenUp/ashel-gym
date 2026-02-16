import { Pressable, StyleSheet } from "react-native"
import { XIcon } from "lucide-react-native"
import { eq } from "drizzle-orm"
import { useSQLiteContext } from "expo-sqlite"
import { drizzle } from "drizzle-orm/expo-sqlite"

import { workoutTable } from "@/db/schema"

import { useWorkoutCreation } from "@/store/useWorkoutCreation"

const HeaderRight = () => {
  const expoDb = useSQLiteContext()
  const db = drizzle(expoDb)

  const {
    createdWorkoutId,
    setCurrentStep,
    setCreatedWorkoutId,
    setSelectedMuscleGroup,
    setSelectedExercise,
  } = useWorkoutCreation()

  const onCancelPress = async () => {
    if (createdWorkoutId === null) return

    await db.delete(workoutTable).where(eq(workoutTable.id, createdWorkoutId))
    setCurrentStep("idle")
    setCreatedWorkoutId(null)
    setSelectedMuscleGroup(null)
    setSelectedExercise(null)
  }

  return (
    <Pressable style={styles.pressable} onPress={onCancelPress}>
      <XIcon color="rgba(255,255,255,0.6)" size={24} />
    </Pressable>
  )
}

export default HeaderRight

const styles = StyleSheet.create({
  pressable: { padding: 6 },
})
