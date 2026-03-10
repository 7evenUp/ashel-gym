import { useState } from "react"
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native"
import * as Haptics from "expo-haptics"
import { eq } from "drizzle-orm"
import {
  Dumbbell,
  Flag,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react-native"

import useDb from "@/hooks/useDb"

import { md3Colors } from "@/constants/colors"

import { workoutTable } from "@/db/schema"

import { useWorkoutCreation } from "@/store/useWorkoutCreation"

const ActionButton = ({
  label,
  Icon,
  onPress,
  disabled = false,
  isLoading = false,
  variant = "default",
}: {
  label: string
  Icon: LucideIcon
  onPress: () => void | Promise<void>
  disabled?: boolean
  isLoading?: boolean
  variant?: "default" | "finish"
}) => {
  const isDisabled = disabled || isLoading
  const isFinish = variant === "finish"

  const backgroundColor = isFinish
    ? md3Colors.dark.primary
    : isDisabled
      ? md3Colors.dark.surfaceContainerLow
      : md3Colors.dark.surfaceContainerHigh

  const borderColor = isFinish
    ? md3Colors.dark.primary
    : isDisabled
      ? md3Colors.dark.outlineVariant
      : md3Colors.dark.surfaceContainerHighest

  const contentColor = isFinish
    ? md3Colors.dark.onPrimary
    : isDisabled
      ? md3Colors.dark.onSurfaceVariant
      : md3Colors.dark.onSurface

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor,
          borderColor,
        },
        pressed && !isDisabled && styles.buttonPressed,
      ]}
      onPress={() => {
        if (isDisabled) return

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
        void onPress()
      }}
      disabled={isDisabled}
    >
      {isLoading ? (
        <ActivityIndicator color={contentColor} />
      ) : (
        <>
          <Icon
            color={contentColor}
            size={20}
            style={[isDisabled && styles.buttonIconDisabled]}
          />
          <Text
            style={[
              styles.buttonLabel,
              isDisabled && styles.buttonLabelDisabled,
              { color: contentColor },
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  )
}

const WorkoutCreationActions = () => {
  const db = useDb()

  const [isFinishing, setIsFinishing] = useState(false)

  const {
    createdWorkoutId,
    currentStep,
    selectedExercise,
    selectedMuscleGroup,
    goToExerciseSelection,
    goToMuscleGroupSelection,
    resetWorkoutCreation,
  } = useWorkoutCreation()

  const isMuscleGroupActionDisabled =
    currentStep === "select-muscle-group" || selectedMuscleGroup === null

  const isExerciseActionDisabled =
    currentStep === "select-muscle-group" ||
    currentStep === "select-exercise" ||
    selectedExercise === null

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
    <View style={styles.container}>
      <ActionButton
        label="Новая группа"
        Icon={LayoutGrid}
        onPress={goToMuscleGroupSelection}
        disabled={isMuscleGroupActionDisabled}
      />
      <ActionButton
        label="Новое упражнение"
        Icon={Dumbbell}
        onPress={goToExerciseSelection}
        disabled={isExerciseActionDisabled}
      />
      <ActionButton
        label="Завершить тренировку"
        Icon={Flag}
        onPress={onFinishWorkout}
        isLoading={isFinishing}
        disabled={createdWorkoutId === null}
        variant="finish"
      />
    </View>
  )
}

export default WorkoutCreationActions

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 12,
    zIndex: 10,
    flexDirection: "row",
    gap: 8,
  },
  button: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    padding: 8,
    boxShadow: "0px 0px 5px 1px rgba(0,0,0,0.5)",
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
  },
  buttonIconDisabled: {
    opacity: 0.7,
  },
  buttonLabel: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 15,
  },
  buttonLabelDisabled: {
    opacity: 0.5,
  },
})
