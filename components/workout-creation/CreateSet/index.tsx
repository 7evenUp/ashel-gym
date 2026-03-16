import { useEffect, useRef, useState } from "react"
import {
  Keyboard,
  KeyboardEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { Image } from "expo-image"

import ExerciseSetItem from "./ExerciseSetItem"

import { md3Colors } from "@/constants/colors"
import { exerciseImages } from "@/constants/exerciseImages"

import { useWorkoutCreation } from "@/store/useWorkoutCreation"

import useSets from "@/hooks/useSets"

type SetItemLayout = {
  y: number
  height: number
}

const ACTIONS_OFFSET = 120
const KEYBOARD_GAP = 24

const CreateSet = () => {
  const scrollViewRef = useRef<ScrollView>(null)
  const prevSetsLengthRef = useRef(0)
  const scrollOffsetRef = useRef(0)
  const keyboardHeightRef = useRef(0)
  const scrollViewHeightRef = useRef(0)
  const pendingFocusedItemLayoutRef = useRef<SetItemLayout | null>(null)

  const [shouldScrollToEnd, setShouldScrollToEnd] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

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

  useEffect(() => {
    const onKeyboardShow = (event: KeyboardEvent) => {
      keyboardHeightRef.current = event.endCoordinates.height
      setKeyboardHeight(event.endCoordinates.height)

      if (pendingFocusedItemLayoutRef.current !== null) {
        requestAnimationFrame(() => {
          scrollToSetItem(pendingFocusedItemLayoutRef.current!)
        })
      }
    }

    const onKeyboardHide = () => {
      keyboardHeightRef.current = 0
      setKeyboardHeight(0)
    }

    const showSubscription = Keyboard.addListener(
      "keyboardDidShow",
      onKeyboardShow,
    )
    const hideSubscription = Keyboard.addListener(
      "keyboardDidHide",
      onKeyboardHide,
    )

    return () => {
      showSubscription.remove()
      hideSubscription.remove()
    }
  }, [])

  const scrollToSetItem = (layout: SetItemLayout) => {
    if (scrollViewHeightRef.current === 0) return

    const keyboardInset =
      keyboardHeightRef.current > 0
        ? keyboardHeightRef.current + KEYBOARD_GAP
        : ACTIONS_OFFSET
    const visibleHeight = Math.max(
      scrollViewHeightRef.current - keyboardInset,
      0,
    )

    if (visibleHeight === 0) return

    const currentOffset = scrollOffsetRef.current
    const itemTop = layout.y
    const itemBottom = layout.y + layout.height
    const visibleTop = currentOffset
    const visibleBottom = currentOffset + visibleHeight

    if (itemBottom > visibleBottom) {
      scrollViewRef.current?.scrollTo({
        y: Math.max(itemBottom - visibleHeight + 12, 0),
        animated: true,
      })
      return
    }

    if (itemTop < visibleTop + 12) {
      scrollViewRef.current?.scrollTo({
        y: Math.max(itemTop - 12, 0),
        animated: true,
      })
    }
  }

  const onSetItemFocus = (layout: SetItemLayout) => {
    pendingFocusedItemLayoutRef.current = layout

    requestAnimationFrame(() => {
      scrollToSetItem(layout)
    })
  }

  if (selectedExercise === null) return
  if (selectedMuscleGroup === null) return
  if (sets === null) return

  return (
    <ScrollView
      ref={scrollViewRef}
      contentContainerStyle={[
        styles.scroll_view_container,
        { paddingBottom: ACTIONS_OFFSET + keyboardHeight },
      ]}
      style={styles.scroll_view}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      onLayout={(event) => {
        scrollViewHeightRef.current = event.nativeEvent.layout.height
      }}
      onScroll={(event) => {
        scrollOffsetRef.current = event.nativeEvent.contentOffset.y
      }}
      scrollEventThrottle={16}
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
          onInputFocus={onSetItemFocus}
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
