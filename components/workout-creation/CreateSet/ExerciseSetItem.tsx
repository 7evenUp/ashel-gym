import { useEffect, useRef, useState } from "react"
import {
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"
import { MinusIcon, PlusIcon } from "lucide-react-native"

import AnimatedColorButton from "./AnimatedButton"

import { useWorkoutCreation } from "@/store/useWorkoutCreation"

import { ExerciseSet } from "@/db/schema"
import { createExerciseSet, updateExerciseSet } from "@/db/repositories/sets"

import { md3Colors } from "@/constants/colors"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

const normalizeWeightInput = (text: string) => {
  const digitsAndDotsOnly = text.replaceAll(",", ".").replace(/[^0-9.]/g, "")
  const normalizedLeadingDot = digitsAndDotsOnly.startsWith(".")
    ? `0${digitsAndDotsOnly}`
    : digitsAndDotsOnly

  const firstDotIndex = normalizedLeadingDot.indexOf(".")

  const normalizedSingleDotText =
    firstDotIndex === -1
      ? normalizedLeadingDot
      : `${normalizedLeadingDot.slice(0, firstDotIndex + 1)}${normalizedLeadingDot
          .slice(firstDotIndex + 1)
          .replaceAll(".", "")}`

  const [integerPart, fractionalPart] = normalizedSingleDotText.split(".")

  const normalizedIntegerPart =
    integerPart === "" ? "0" : integerPart.replace(/^0+(?=\d)/, "")

  return fractionalPart !== undefined
    ? `${normalizedIntegerPart}.${fractionalPart}`
    : normalizedIntegerPart
}

const normalizeRepsInput = (text: string) => {
  return text.replace(/\D/g, "").replace(/^0+(?=\d)/, "")
}

const parseWeightInput = (text: string) => {
  const parsedWeight = parseFloat(text)

  return Number.isFinite(parsedWeight) ? parsedWeight : 0
}

const parseRepsInput = (text: string) => {
  return text === "" ? 0 : parseInt(text, 10)
}

const ExerciseSetItem = ({
  order,
  reps: outerReps,
  weight: outerWeight,
  id,
  isFirst,
  isLast,
  refetchSets,
  onSetAdded,
  onInputFocus,
}: ExerciseSet & {
  isFirst: boolean
  isLast: boolean
  refetchSets: VoidFunction
  onSetAdded: VoidFunction
  onInputFocus: (layout: { y: number; height: number }) => void
}) => {
  const [repsInput, setRepsInput] = useState(outerReps.toString())
  const [weight, setWeight] = useState(outerWeight.toString())
  const layoutRef = useRef({ y: 0, height: 0 })
  const persistedSetRef = useRef({
    order,
    reps: outerReps,
    weight: outerWeight,
  })

  const { selectedExercise, selectedMuscleGroup, createdWorkoutId } =
    useWorkoutCreation()

  useEffect(() => {
    setRepsInput(outerReps.toString())
    setWeight(outerWeight.toString())
    persistedSetRef.current = {
      order,
      reps: outerReps,
      weight: outerWeight,
    }
  }, [id, order, outerReps, outerWeight])

  if (selectedExercise === null) return
  if (selectedMuscleGroup === null) return
  if (createdWorkoutId === null) return

  const reps = parseRepsInput(repsInput)
  const weightValue = parseWeightInput(weight)

  const isConfirmDisabled = reps === 0 || !weightValue

  const saveSet = async ({
    nextReps,
    nextWeight,
  }: {
    nextReps: number
    nextWeight: number
  }) => {
    const persistedSet = persistedSetRef.current

    if (
      persistedSet.order === order &&
      persistedSet.reps === nextReps &&
      persistedSet.weight === nextWeight
    )
      return

    await updateExerciseSet({
      order,
      reps: nextReps,
      weight: nextWeight,
      id,
    })

    persistedSetRef.current = {
      order,
      reps: nextReps,
      weight: nextWeight,
    }
  }

  const onWeightChange = (text: string) => {
    setWeight(normalizeWeightInput(text))
  }

  const onRepsChange = (text: string) => {
    setRepsInput(normalizeRepsInput(text))
  }

  const onInputBlur = async () => {
    await saveSet({
      nextReps: reps,
      nextWeight: weightValue,
    })
  }

  const onDecreaseRepsPress = async () => {
    const nextReps = Math.max(reps - 1, 0)

    setRepsInput(nextReps.toString())

    await saveSet({
      nextReps,
      nextWeight: weightValue,
    })
  }

  const onIncreaseRepsPress = async () => {
    const nextReps = reps + 1

    setRepsInput(nextReps.toString())

    await saveSet({
      nextReps,
      nextWeight: weightValue,
    })
  }

  const onAddPress = async () => {
    if (isConfirmDisabled) return

    makeHapticFeedback()

    await saveSet({
      nextReps: reps,
      nextWeight: weightValue,
    })

    await createExerciseSet({
      exercise_id: selectedExercise.id,
      workout_id: createdWorkoutId,
      order: order + 1,
      reps: 0,
      weight: weightValue,
    })

    refetchSets()
    onSetAdded()
  }

  const onLayout = (event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout

    layoutRef.current = { y, height }
  }

  const onFocus = () => {
    onInputFocus(layoutRef.current)
  }

  return (
    <>
      <View
        style={[styles.set_item, { marginTop: isFirst ? 0 : 8 }]}
        onLayout={onLayout}
      >
        <View style={styles.left}>
          <Text style={styles.order}>Подход №{order + 1}</Text>
        </View>

        <View style={styles.right}>
          <View style={styles.col}>
            <Text style={styles.col_title}>Вес, кг</Text>
            <TextInput
              style={styles.col_input}
              keyboardType="numeric"
              keyboardAppearance="dark"
              returnKeyType="done"
              value={weight}
              onChangeText={onWeightChange}
              onBlur={onInputBlur}
              onFocus={onFocus}
            />
          </View>
          <View style={styles.col}>
            <Text style={styles.col_title}>Повторения</Text>
            <View style={styles.counter_wrapper}>
              <AnimatedColorButton
                style={[
                  styles.counter_pressable,
                  reps === 0 && { opacity: 0.5 },
                ]}
                colors={{
                  from: md3Colors.dark.surfaceContainerHighest,
                  to: md3Colors.dark.surfaceContainerHigh,
                }}
                onPress={onDecreaseRepsPress}
                disabled={reps === 0}
              >
                <MinusIcon size={20} color={md3Colors.dark.onSurface} />
              </AnimatedColorButton>
              <TextInput
                style={styles.counter_input}
                placeholder="0"
                placeholderTextColor={md3Colors.dark.onSurfaceVariant}
                keyboardType="numeric"
                keyboardAppearance="dark"
                returnKeyType="done"
                value={repsInput}
                onChangeText={onRepsChange}
                onBlur={onInputBlur}
                onFocus={onFocus}
              />
              <AnimatedColorButton
                style={styles.counter_pressable}
                colors={{
                  from: md3Colors.dark.surfaceContainerHighest,
                  to: md3Colors.dark.surfaceContainerHigh,
                }}
                onPress={onIncreaseRepsPress}
              >
                <PlusIcon size={20} color={md3Colors.dark.onSurface} />
              </AnimatedColorButton>
            </View>
          </View>
        </View>
      </View>

      {isLast && (
        <>
          <View style={styles.custom_border} />

          <Pressable
            style={[styles.button, isConfirmDisabled && { opacity: 0.5 }]}
            disabled={isConfirmDisabled}
            onPress={onAddPress}
          >
            <PlusIcon color={md3Colors.dark.onSurfaceVariant} />
            <Text style={styles.button_title}>Добавить ещё</Text>
          </Pressable>
        </>
      )}
    </>
  )
}

export default ExerciseSetItem

const styles = StyleSheet.create({
  set_item: {
    backgroundColor: md3Colors.dark.surfaceContainerLow,
    padding: 16,
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: md3Colors.dark.outlineVariant,
  },
  left: {
    alignSelf: "flex-start",
  },
  order: {
    color: md3Colors.dark.onSurfaceVariant,
    fontSize: 14,
  },
  right: {
    marginTop: -24,
    alignSelf: "flex-end",
    flexDirection: "row",
    gap: 8,
  },
  col: {
    alignItems: "center",
    gap: 4,
  },
  col_title: {
    color: md3Colors.dark.onSurfaceVariant,
    fontSize: 13,
  },
  col_input: {
    textAlign: "center",
    color: md3Colors.dark.onSurface,
    backgroundColor: md3Colors.dark.surfaceContainerHighest,
    borderRadius: 10,
    height: 32,
    minWidth: 110,
    fontSize: 16,
    ...Platform.select({
      android: {
        includeFontPadding: false,
        textAlignVertical: "center",
        paddingVertical: 0,
      },
    }),
  },
  counter_wrapper: {
    backgroundColor: md3Colors.dark.surfaceContainerHighest,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
    height: 32,
    minWidth: 110,
  },
  counter_pressable: {
    paddingInline: 8,
    height: "100%",
    justifyContent: "center",
    borderRadius: 10,
  },
  counter_input: {
    color: md3Colors.dark.onSurface,
    fontWeight: "600",
    fontSize: 16,
    minWidth: 44,
    height: "100%",
    textAlign: "center",
    paddingVertical: 0,
    ...Platform.select({
      android: {
        includeFontPadding: false,
        textAlignVertical: "center",
        paddingVertical: 0,
      },
    }),
  },
  custom_border: {
    width: 1,
    height: 32,
    backgroundColor: md3Colors.dark.outlineVariant,
  },
  button: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: md3Colors.dark.outlineVariant,
    height: 40,
    paddingInline: 20,
    borderRadius: 9999,
  },
  button_title: {
    color: md3Colors.dark.onSurfaceVariant,
    fontSize: 16,
  },
})
