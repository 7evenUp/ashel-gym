import { Pressable, StyleSheet } from "react-native"
import { XIcon } from "lucide-react-native"
import { eq } from "drizzle-orm"

import { workoutTable } from "@/db/schema"

import { md3Colors } from "@/constants/colors"

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
      <XIcon color={md3Colors.dark.onSurfaceVariant} size={24} />
    </Pressable>
  )
}

export default HeaderRight

const styles = StyleSheet.create({
  pressable: { padding: 6 },
})
