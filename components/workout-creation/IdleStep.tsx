import { useEffect, useState } from "react"
import { StyleSheet, Text, View } from "react-native"

import Button from "../Button"

import { Workout } from "@/db/schema"
import {
  createWorkout,
  getLatestWorkoutForDay,
} from "@/db/repositories/workouts"

import { md3Colors } from "@/constants/colors"

import { useWorkoutCreation } from "@/store/useWorkoutCreation"

const IdleStep = () => {
  const { startWorkout } = useWorkoutCreation()
  const [todayWorkout, setTodayWorkout] = useState<Workout | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let isActive = true

    const loadTodayWorkout = async () => {
      try {
        const workout = await getLatestWorkoutForDay()

        if (!isActive) return

        setTodayWorkout(workout)
      } finally {
        if (isActive) {
          setIsChecking(false)
        }
      }
    }

    loadTodayWorkout()

    return () => {
      isActive = false
    }
  }, [])

  const onCreateWorkoutClick = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      const createdWorkout = await createWorkout()

      startWorkout(createdWorkout.id)
    } finally {
      setIsSubmitting(false)
    }
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
    color: md3Colors.dark.onSurface,
    fontSize: 24,
    fontWeight: "600",
    marginTop: 20,
  },
  buttonsWrapper: {
    width: "100%",
    marginTop: "auto",
    gap: 12,
    paddingBottom: 16,
  },
})
