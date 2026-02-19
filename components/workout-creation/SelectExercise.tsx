import * as Haptics from "expo-haptics"

import ExercisesGrid from "../ExercisesGrid"

import useExercises from "@/hooks/useExercises"

import { useWorkoutCreation } from "@/store/useWorkoutCreation"

import { Exercise } from "@/db/schema"

const SelectExercise = () => {
  const { selectedMuscleGroup, setSelectedExercise, setCurrentStep } =
    useWorkoutCreation()

  const exercises = useExercises({
    neededMuscleGroupId: selectedMuscleGroup ? selectedMuscleGroup.id : null,
  })

  if (
    exercises === null ||
    exercises.length === 0 ||
    selectedMuscleGroup === null
  )
    return

  const onExercisePress = (exercise: Exercise) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
    setSelectedExercise(exercise)
    setCurrentStep("create-set")
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
