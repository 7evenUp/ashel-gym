import { useEffect, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { and, desc, gte, lt } from "drizzle-orm"

import Button from "../Button"

import { Workout, workoutTable } from "@/db/schema"

import { useWorkoutCreation } from "@/store/useWorkoutCreation"

import useDb from "@/hooks/useDb"

const IdleStep = () => {
  const db = useDb()

  const { startWorkout } = useWorkoutCreation()
  const [todayWorkout, setTodayWorkout] = useState<Workout | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(startOfDay)
    endOfDay.setDate(endOfDay.getDate() + 1)

    const loadTodayWorkout = async () => {
      try {
        const [workout] = await db
          .select()
          .from(workoutTable)
          .where(
            and(
              gte(workoutTable.created_at, startOfDay.getTime()),
              lt(workoutTable.created_at, endOfDay.getTime()),
            ),
          )
          .orderBy(desc(workoutTable.created_at))

        setTodayWorkout(workout ?? null)
      } finally {
        setIsChecking(false)
      }
    }

    loadTodayWorkout()
  }, [db])

  const onCreateWorkoutClick = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)

    const [createdWorkout] = await db
      .insert(workoutTable)
      .values({
        created_at: new Date().getTime(),
      })
      .returning()

    startWorkout(createdWorkout.id)
  }

  const onContinueWorkoutClick = () => {
    if (todayWorkout === null || isSubmitting) return
    startWorkout(todayWorkout.id)
  }

  return (
    <>
      <Text style={styles.title}>Log a workout?</Text>

      <View style={styles.buttonsWrapper}>
        {isChecking ? (
          <Button label="Checking today's workout..." isLoading />
        ) : todayWorkout ? (
          <>
            <Button
              label="Continue existing"
              onPress={onContinueWorkoutClick}
              isLoading={isSubmitting}
            />
            <Button
              label="Create new"
              onPress={onCreateWorkoutClick}
              isLoading={isSubmitting}
            />
          </>
        ) : (
          <Button
            label="Create new"
            onPress={onCreateWorkoutClick}
            isLoading={isSubmitting}
          />
        )}
      </View>
    </>
  )
}

export default IdleStep

const styles = StyleSheet.create({
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "600",
    marginTop: 20,
  },
  buttonsWrapper: {
    width: "100%",
    marginTop: "auto",
    gap: 12,
  },
})
