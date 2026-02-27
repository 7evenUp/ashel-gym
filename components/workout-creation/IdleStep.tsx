import { StyleSheet, Text } from "react-native"

import Button from "../Button"

import { workoutTable } from "@/db/schema"

import { useWorkoutCreation } from "@/store/useWorkoutCreation"

import useDb from "@/hooks/useDb"

const IdleStep = () => {
  const db = useDb()

  const { startWorkout } = useWorkoutCreation()

  const onCreateWorkoutClick = async () => {
    const [createdWorkout] = await db
      .insert(workoutTable)
      .values({
        created_at: new Date().getTime(),
      })
      .returning()

    startWorkout(createdWorkout.id)
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
