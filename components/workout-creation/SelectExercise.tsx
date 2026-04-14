import { useEffect, useState } from "react"

import ExercisesGrid from "../ExercisesGrid"

import useExercises from "@/hooks/useExercises"

import { useWorkoutCreation } from "@/store/useWorkoutCreation"

import { Exercise } from "@/db/schema"
import { createExerciseSet, getExerciseSets } from "@/db/repositories/sets"
import { getCompletedExerciseIdsForWorkout } from "@/db/repositories/workouts"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

const SelectExercise = () => {
  const {
    selectedMuscleGroup,
    setSelectedExercise,
    goToSetCreation,
    createdWorkoutId,
  } = useWorkoutCreation()

  const [highlightedExerciseIds, setHighlightedExerciseIds] = useState<
    number[]
  >([])

  const exercises = useExercises({
    neededMuscleGroupId: selectedMuscleGroup ? selectedMuscleGroup.id : null,
  })

  useEffect(() => {
    let isActive = true

    const loadHighlightedExerciseIds = async () => {
      if (createdWorkoutId === null || exercises === null) {
        setHighlightedExerciseIds([])
        return
      }

      const highlightedIds = await getCompletedExerciseIdsForWorkout({
        workoutId: createdWorkoutId,
        exerciseIds: exercises.map((item) => item.id),
      })

      if (!isActive) return

      setHighlightedExerciseIds(highlightedIds)
    }

    loadHighlightedExerciseIds()

    return () => {
      isActive = false
    }
  }, [createdWorkoutId, exercises])

  if (
    exercises === null ||
    exercises.length === 0 ||
    selectedMuscleGroup === null ||
    createdWorkoutId === null
  )
    return

  const onExercisePress = async (exercise: Exercise) => {
    makeHapticFeedback()

    setSelectedExercise(exercise)

    const sets = await getExerciseSets({
      exercise_id: exercise.id,
      workout_id: createdWorkoutId,
    })

    if (sets.length === 0) {
      await createExerciseSet({
        exercise_id: exercise.id,
        workout_id: createdWorkoutId,
        order: 0,
        reps: 0,
        weight: 0,
      })
    }

    goToSetCreation()
  }

  return (
    <ExercisesGrid
      exercises={exercises}
      muscleGroup={selectedMuscleGroup}
      highlightedExerciseIds={highlightedExerciseIds}
      onExercisePress={(exercise) => onExercisePress(exercise)}
      containerStyle={{ paddingBottom: 100 }}
    />
  )
}

export default SelectExercise
