import { Pressable, StyleSheet } from "react-native"
import { XIcon } from "lucide-react-native"
import { eq } from "drizzle-orm"

import { workoutTable } from "@/db/schema"

import { useWorkoutCreation } from "@/store/useWorkoutCreation"

import useDb from "@/hooks/useDb"

const HeaderRight = () => {
  const db = useDb()

  const { createdWorkoutId, resetWorkoutCreation } = useWorkoutCreation()

  const onCancelPress = async () => {
    if (createdWorkoutId === null) return

    await db.delete(workoutTable).where(eq(workoutTable.id, createdWorkoutId))
    resetWorkoutCreation()
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
