import { useEffect, useRef, useState } from "react"
import { ScrollView, StyleSheet, Text, View } from "react-native"
import { Image } from "expo-image"
import { eq } from "drizzle-orm"

import ExerciseSetItem from "./ExerciseSetItem"
import Button from "@/components/Button"

import { md3Colors } from "@/constants/colors"
import { exerciseImages } from "@/constants/exerciseImages"

import { useWorkoutCreation } from "@/store/useWorkoutCreation"

import useSets from "@/hooks/useSets"
import useDb from "@/hooks/useDb"

import { workoutTable } from "@/db/schema"

const CreateSet = () => {
  const scrollViewRef = useRef<ScrollView>(null)
  const prevSetsLengthRef = useRef(0)

  const [shouldScrollToEnd, setShouldScrollToEnd] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)

  const db = useDb()

  const {
    selectedExercise,
    selectedMuscleGroup,
    createdWorkoutId,
    goToExerciseSelection,
    goToMuscleGroupSelection,
    resetWorkoutCreation,
  } = useWorkoutCreation()

  const { sets, refetch } = useSets({
    exerciseId: selectedExercise ? selectedExercise.id : null,
    workoutId: createdWorkoutId ?? null,
  })

  useEffect(() => {
    if (sets === null) return

    const currentLength = sets.length
    const previousLength = prevSetsLengthRef.current

    if (shouldScrollToEnd && currentLength > previousLength) {
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true })
      })
      setShouldScrollToEnd(false)
    }

    prevSetsLengthRef.current = currentLength
  }, [sets, shouldScrollToEnd])

  if (selectedExercise === null) return
  if (selectedMuscleGroup === null) return
  if (sets === null) return

  const onFinishWorkout = async () => {
    if (createdWorkoutId === null || isFinishing) return

    setIsFinishing(true)

    try {
      await db
        .update(workoutTable)
        .set({ finished_at: new Date().getTime() })
        .where(eq(workoutTable.id, createdWorkoutId))

      resetWorkoutCreation()
    } finally {
      setIsFinishing(false)
    }
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      contentContainerStyle={styles.scroll_view_container}
      style={styles.scroll_view}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>{selectedExercise.name}</Text>

      <View style={styles.image_wrapper}>
        <Image
          style={styles.image}
          source={
            exerciseImages[selectedMuscleGroup.name][selectedExercise.image]
          }
        />
      </View>

      {sets.map((set, i) => (
        <ExerciseSetItem
          key={set.id}
          {...set}
          isFirst={i === 0}
          isLast={i === sets.length - 1}
          refetchSets={refetch}
          onSetAdded={() => setShouldScrollToEnd(true)}
        />
      ))}

      <View style={styles.actions}>
        <Button label="Другое упражнение" onPress={goToExerciseSelection} />
        <Button label="Другая группа" onPress={goToMuscleGroupSelection} />
        <Button
          label="Завершить тренировку"
          onPress={onFinishWorkout}
          isLoading={isFinishing}
        />
      </View>
    </ScrollView>
  )
}

export default CreateSet

const styles = StyleSheet.create({
  scroll_view: {
    width: "100%",
  },
  scroll_view_container: {
    alignItems: "center",
    paddingBottom: 40,
  },
  actions: {
    marginTop: 24,
    width: "100%",
    gap: 12,
    paddingHorizontal: 8,
  },
  title: {
    color: md3Colors.dark.onSurface,
    fontSize: 24,
    fontWeight: 600,
    marginVertical: 12,
  },
  image_wrapper: {
    aspectRatio: 1 / 1,
    width: "60%",
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
})
