import { useEffect, useState } from "react"
import { Pressable, StyleSheet, Text } from "react-native"
import { Image } from "expo-image"

import { Workout } from "@/db/schema"
import {
  createWorkout,
  getLatestWorkoutForDay,
} from "@/db/repositories/workouts"

import { useWorkoutCreation } from "@/store/useWorkoutCreation"

import { md3Colors } from "@/constants/colors"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

const mascot_src = require("@/assets/images/mascots/mascot_start_workout.png")

const IdleStep = () => {
  const [todayWorkout, setTodayWorkout] = useState<Workout | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { startWorkout } = useWorkoutCreation()

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
      <Image source={mascot_src} style={styles.mascot} />

      <Pressable
        style={styles.button}
        onPress={() => {
          makeHapticFeedback()
          if (todayWorkout) {
            onContinueWorkoutClick()
          } else {
            onCreateWorkoutClick()
          }
        }}
        disabled={isSubmitting || isChecking}
      >
        <Text style={styles.buttonText}>GO</Text>
      </Pressable>
    </>
  )
}

export default IdleStep

const styles = StyleSheet.create({
  button: {
    width: 180,
    height: 180,
    backgroundColor: md3Colors.dark.primary,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  buttonText: {
    fontSize: 80,
    color: md3Colors.dark.onPrimary,
    fontWeight: 800,
  },
  mascot: {
    width: "100%",
    aspectRatio: 9 / 14,
    position: "absolute",
    bottom: -80,
  },
})
