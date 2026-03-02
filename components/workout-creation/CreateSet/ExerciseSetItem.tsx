import { useState } from "react"
import {
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
import { createExerciseSet, updateExerciseSet } from "@/db/prepared-statements"

import { md3Colors } from "@/constants/colors"

const ExerciseSetItem = ({
  order,
  reps: outerReps,
  weight: outerWeight,
  id,
  isFirst,
  isLast,
  refetchSets,
  onSetAdded,
}: ExerciseSet & {
  isFirst: boolean
  isLast: boolean
  refetchSets: VoidFunction
  onSetAdded: VoidFunction
}) => {
  const [reps, setReps] = useState(outerReps)
  const [weight, setWeight] = useState(outerWeight.toString())

  const { selectedExercise, selectedMuscleGroup, createdWorkoutId } =
    useWorkoutCreation()

  if (selectedExercise === null) return
  if (selectedMuscleGroup === null) return
  if (createdWorkoutId === null) return

  const isConfirmDisabled = reps === 0 || !parseFloat(weight)

  const onWeightChange = async (text: string) => {
    const replacedText = text.replaceAll(",", ".")
    const parsedText = parseFloat(replacedText)

    await updateExerciseSet({
      order,
      reps,
      weight: parsedText ? parsedText : 0,
      id,
    })
    setWeight(replacedText)
  }

  const onDecreaseRepsPress = async () => {
    await updateExerciseSet({
      order,
      reps: reps === 0 ? 0 : reps - 1,
      weight: parseFloat(weight),
      id,
    })
    setReps((prev) => (prev === 0 ? -0 : prev - 1))
  }

  const onIncreaseRepsPress = async () => {
    await updateExerciseSet({
      order,
      reps: reps + 1,
      weight: parseFloat(weight),
      id,
    })
    setReps((prev) => prev + 1)
  }

  const onAddPress = async () => {
    if (isConfirmDisabled) return

    await createExerciseSet({
      exercise_id: selectedExercise.id,
      workout_id: createdWorkoutId,
      order: order + 1,
      reps,
      weight: parseFloat(weight),
    })

    refetchSets()
    onSetAdded()
  }

  return (
    <>
      <View style={[styles.set_item, { marginTop: isFirst ? 0 : 8 }]}>
        <View style={styles.left}>
          <Text style={styles.order}>Подход №{order + 1}</Text>
        </View>

        <View style={styles.right}>
          <View style={styles.col}>
            <Text style={styles.col_title}>Вес, кг</Text>
            <TextInput
              style={styles.col_input}
              placeholder="Введите вес"
              placeholderTextColor={md3Colors.dark.onSurfaceVariant}
              keyboardType="numeric"
              keyboardAppearance="dark"
              returnKeyType="done"
              value={weight}
              onChangeText={onWeightChange}
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
              <Text style={styles.counter_value}>{reps}</Text>
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
    gap: 8,
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
  counter_value: {
    color: md3Colors.dark.onSurface,
    fontWeight: "600",
    fontSize: 16,
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
