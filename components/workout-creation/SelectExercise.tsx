import { useEffect, useState } from "react"
import * as Haptics from "expo-haptics"
import { eq } from "drizzle-orm"

import ExercisesGrid from "../ExercisesGrid"

import useExercises from "@/hooks/useExercises"
import useDb from "@/hooks/useDb"

import { useWorkoutCreation } from "@/store/useWorkoutCreation"

import { Exercise, exerciseSetTable } from "@/db/schema"
import { createExerciseSet, getExerciseSets } from "@/db/prepared-statements"

const SelectExercise = () => {
  const db = useDb()

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
    const loadHighlightedExerciseIds = async () => {
      if (createdWorkoutId === null || exercises === null) return

      const workoutSets = await db
        .select()
        .from(exerciseSetTable)
        .where(eq(exerciseSetTable.workout_id, createdWorkoutId))

      const exerciseIdsInCurrentGroup = new Set(
        exercises.map((item) => item.id),
      )

      const highlightedIds = Array.from(
        new Set(
          workoutSets
            .filter(
              (set) =>
                exerciseIdsInCurrentGroup.has(set.exercise_id) &&
                set.reps > 0 &&
                set.weight > 0,
            )
            .map((set) => set.exercise_id),
        ),
      )

      setHighlightedExerciseIds(highlightedIds)
    }

    loadHighlightedExerciseIds()
  }, [createdWorkoutId, db, exercises])

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
      highlightedExerciseIds={highlightedExerciseIds}
      onExercisePress={(exercise) => onExercisePress(exercise)}
    />
  )
}

export default SelectExercise
