import * as Haptics from "expo-haptics"

import ExercisesGrid from "../ExercisesGrid"

import useExercises from "@/hooks/useExercises"

import { useWorkoutCreation } from "@/store/useWorkoutCreation"

import { Exercise } from "@/db/schema"
import { createExerciseSet, getExerciseSets } from "@/db/prepared-statements"

const SelectExercise = () => {
  const {
    selectedMuscleGroup,
    setSelectedExercise,
    goToSetCreation,
    createdWorkoutId,
  } = useWorkoutCreation()

  const exercises = useExercises({
    neededMuscleGroupId: selectedMuscleGroup ? selectedMuscleGroup.id : null,
  })

  if (
    exercises === null ||
    exercises.length === 0 ||
    selectedMuscleGroup === null ||
    createdWorkoutId === null
  )
    return

  const onExercisePress = async (exercise: Exercise) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)

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
      onExercisePress={(exercise) => onExercisePress(exercise)}
    />
  )
}

export default SelectExercise
