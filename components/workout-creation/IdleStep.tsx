import { StyleSheet, Text } from "react-native"
import { useSQLiteContext } from "expo-sqlite"
import { drizzle } from "drizzle-orm/expo-sqlite"

import Button from "../Button"

import { workoutTable } from "@/db/schema"

import { useWorkoutCreation } from "@/store/useWorkoutCreation"

const IdleStep = () => {
  const expoDb = useSQLiteContext()
  const db = drizzle(expoDb)

  const { setCreatedWorkoutId, setCurrentStep } = useWorkoutCreation()

  const onCreateWorkoutClick = async () => {
    const [createdWorkout] = await db
      .insert(workoutTable)
      .values({
        created_at: new Date().getTime(),
      })
      .returning()

    setCreatedWorkoutId(createdWorkout.id)
    setCurrentStep("select-muscle-group")
  }

  return (
    <>
      <Text style={styles.title}>Запишем тренировочку?</Text>
      <Button
        style={{ marginTop: "auto" }}
        label="Записать"
        onPress={onCreateWorkoutClick}
      />
    </>
  )
}

export default IdleStep

const styles = StyleSheet.create({
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: 600,
    marginTop: 20,
  },
})
