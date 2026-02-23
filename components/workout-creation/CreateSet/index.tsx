import { useEffect, useRef, useState } from "react"
import { ScrollView, StyleSheet, Text, View } from "react-native"
import { Image } from "expo-image"

import ExerciseSetItem from "./ExerciseSetItem"

import { exerciseImages } from "@/constants/exerciseImages"

import { useWorkoutCreation } from "@/store/useWorkoutCreation"

import useSets from "@/hooks/useSets"

const CreateSet = () => {
  const scrollViewRef = useRef<ScrollView>(null)
  const prevSetsLengthRef = useRef(0)

  const [shouldScrollToEnd, setShouldScrollToEnd] = useState(false)

  const { selectedExercise, selectedMuscleGroup, createdWorkoutId } =
    useWorkoutCreation()

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
  title: {
    color: "white",
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
