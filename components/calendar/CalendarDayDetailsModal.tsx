import { useEffect, useMemo, useState } from "react"
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { ChevronDown, Trash2Icon, X } from "lucide-react-native"
import Animated, {
  Easing,
  FadeInDown,
  FadeOutUp,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"

import { DayExerciseSummary, DaySummary } from "./types"
import { getReadableDateLabel } from "./utils"

import Button from "../Button"

import { md3Colors } from "@/constants/colors"

import { deleteWorkoutsByIds } from "@/db/repositories/workouts"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

const exerciseLayoutTransition = LinearTransition.duration(220).easing(
  Easing.out(Easing.cubic),
)

const ExerciseAccordionItem = ({
  exercise,
  isExpanded,
  onPress,
}: {
  exercise: DayExerciseSummary
  isExpanded: boolean
  onPress: VoidFunction
}) => {
  const rotation = useSharedValue(isExpanded ? 180 : 0)

  useEffect(() => {
    rotation.value = withTiming(isExpanded ? 180 : 0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    })
  }, [isExpanded, rotation])

  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }))

  return (
    <Animated.View
      layout={exerciseLayoutTransition}
      style={styles.exerciseCard}
    >
      <Pressable style={styles.exercisePressable} onPress={onPress}>
        <View style={styles.exerciseRow}>
          <View style={styles.exerciseMeta}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <Text style={styles.exerciseSets}>Sets: {exercise.setsCount}</Text>
          </View>

          <Animated.View style={chevronAnimatedStyle}>
            <ChevronDown color={md3Colors.dark.onSurfaceVariant} size={18} />
          </Animated.View>
        </View>
      </Pressable>

      {isExpanded && (
        <Animated.View
          entering={FadeInDown.duration(180)}
          exiting={FadeOutUp.duration(160)}
          layout={exerciseLayoutTransition}
          style={styles.setsList}
        >
          {exercise.sets.map((set, index) => (
            <View key={set.id} style={styles.setRow}>
              <Text style={styles.setOrder}>Set №{index + 1}</Text>
              <Text style={styles.setValue}>
                {set.weight}kg x {set.reps}
              </Text>
            </View>
          ))}
        </Animated.View>
      )}
    </Animated.View>
  )
}

const CalendarDayDetailsModal = ({
  selectedDate,
  selectedSummary,
  onClose,
}: {
  selectedDate: Date | null
  selectedSummary: DaySummary | null
  onClose: VoidFunction
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([])
  const [expandedExerciseIds, setExpandedExerciseIds] = useState<number[]>([])
  const [isWorkoutDeleting, setIsWorkoutDeleting] = useState(false)

  useEffect(() => {
    if (selectedDate) setIsModalVisible(true)
  }, [selectedDate])

  useEffect(() => {
    setSelectedMuscleGroups(selectedSummary?.muscleGroups ?? [])
    setExpandedExerciseIds([])
  }, [selectedSummary])

  const onCloseClick = async () => {
    setIsModalVisible(false)

    await new Promise((r) => setTimeout(r, 300))

    onClose()
  }

  const filteredExercises = useMemo(() => {
    if (!selectedSummary || selectedMuscleGroups.length === 0) return []

    const selectedMuscleGroupSet = new Set(selectedMuscleGroups)

    return selectedSummary.exercises.filter((exercise) =>
      selectedMuscleGroupSet.has(exercise.muscleGroup),
    )
  }, [selectedMuscleGroups, selectedSummary])

  const onToggleMuscleGroup = (muscleGroup: string) => {
    setSelectedMuscleGroups((current) =>
      current.includes(muscleGroup)
        ? current.filter((item) => item !== muscleGroup)
        : [...current, muscleGroup],
    )
  }

  const onToggleExercise = (exerciseId: number) => {
    setExpandedExerciseIds((current) =>
      current.includes(exerciseId)
        ? current.filter((item) => item !== exerciseId)
        : [...current, exerciseId],
    )
  }

  const workoutIds = useMemo(() => {
    if (!selectedSummary) return []

    return Array.from(
      new Set(
        selectedSummary.exercises.flatMap((exercise) =>
          exercise.sets.map((set) => set.workoutId),
        ),
      ),
    )
  }, [selectedSummary])

  const onDeletePress = () => {
    if (workoutIds.length === 0 || isWorkoutDeleting) return

    Alert.alert(
      "Delete workouts?",
      "This will delete all workouts logged for this day.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsWorkoutDeleting(true)

            try {
              await deleteWorkoutsByIds(workoutIds)
              makeHapticFeedback()
              await onCloseClick()
            } finally {
              setIsWorkoutDeleting(false)
            }
          },
        },
      ],
    )
  }

  return (
    <Modal
      animationType="fade"
      transparent
      visible={isModalVisible && selectedDate !== null}
      onRequestClose={onCloseClick}
    >
      <View style={styles.modalRoot}>
        <Pressable style={styles.modalBackdrop} onPress={onCloseClick} />

        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Day details</Text>
              <Text style={styles.modalDateLabel}>
                {selectedDate ? getReadableDateLabel(selectedDate) : ""}
              </Text>
            </View>

            <Pressable style={styles.iconButton} onPress={onCloseClick}>
              <X color={md3Colors.dark.onSurface} size={20} />
            </Pressable>
          </View>

          {selectedSummary ? (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Developed muscle groups</Text>
                <View style={styles.tagList}>
                  {selectedSummary.muscleGroups.map((muscleGroup) => {
                    const isSelected =
                      selectedMuscleGroups.includes(muscleGroup)

                    return (
                      <Pressable
                        key={muscleGroup}
                        style={[
                          styles.tag,
                          isSelected
                            ? styles.tagSelected
                            : styles.tagUnselected,
                        ]}
                        onPress={() => {
                          makeHapticFeedback()
                          onToggleMuscleGroup(muscleGroup)
                        }}
                      >
                        <Text
                          style={[
                            styles.tagText,
                            isSelected
                              ? styles.tagTextSelected
                              : styles.tagTextUnselected,
                          ]}
                        >
                          {muscleGroup}
                        </Text>
                        {isSelected && (
                          <X
                            size={14}
                            color={md3Colors.dark.onTertiaryContainer}
                          />
                        )}
                      </Pressable>
                    )
                  })}
                </View>
              </View>

              <ScrollView
                style={styles.modalScroll}
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Completed exercises</Text>
                  {filteredExercises.length > 0 ? (
                    <View style={styles.exerciseList}>
                      {filteredExercises.map((exercise) => (
                        <ExerciseAccordionItem
                          key={exercise.id}
                          exercise={exercise}
                          isExpanded={expandedExerciseIds.includes(exercise.id)}
                          onPress={() => {
                            makeHapticFeedback()
                            onToggleExercise(exercise.id)
                          }}
                        />
                      ))}
                    </View>
                  ) : (
                    <View style={styles.filteredEmptyState}>
                      <Text style={styles.filteredEmptyText}>
                        Select at least one muscle group to see exercises.
                      </Text>
                    </View>
                  )}
                </View>

                <Button
                  label="Delete workout"
                  Icon={Trash2Icon}
                  variant="error"
                  style={styles.deleteButton}
                  onPress={onDeletePress}
                  isLoading={isWorkoutDeleting}
                />
              </ScrollView>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No workouts logged</Text>
              <Text style={styles.emptyText}>
                There are no completed sets stored for this day yet.
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  )
}

export default CalendarDayDetailsModal

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: md3Colors.dark.scrim,
    opacity: 0.55,
  },
  modalCard: {
    maxHeight: "72%",
    backgroundColor: md3Colors.dark.surfaceContainerHigh,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: md3Colors.dark.outlineVariant,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: md3Colors.dark.surfaceContainerHighest,
  },
  modalTitle: {
    color: md3Colors.dark.onSurface,
    fontSize: 22,
    fontWeight: "700",
  },
  modalDateLabel: {
    marginTop: 4,
    color: md3Colors.dark.onSurfaceVariant,
    fontSize: 14,
  },
  modalScroll: {
    width: "100%",
  },
  modalScrollContent: {
    marginTop: 16,
    paddingBottom: 36,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: md3Colors.dark.onSurface,
    fontSize: 16,
    fontWeight: "600",
  },
  tagList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    borderRadius: 8,
  },
  tagSelected: {
    backgroundColor: md3Colors.dark.tertiaryContainer,
    paddingLeft: 16,
    paddingRight: 12,
  },
  tagUnselected: {
    backgroundColor: md3Colors.dark.surfaceContainer,
    paddingHorizontal: 16,
  },
  tagText: {
    fontSize: 13,
    fontWeight: "600",
  },
  tagTextSelected: {
    color: md3Colors.dark.onTertiaryContainer,
  },
  tagTextUnselected: {
    color: md3Colors.dark.onSurfaceVariant,
  },
  exerciseList: {
    gap: 8,
  },
  exerciseCard: {
    backgroundColor: md3Colors.dark.surfaceContainer,
    borderRadius: 16,
  },
  exercisePressable: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  exerciseMeta: {
    flex: 1,
    gap: 2,
  },
  exerciseName: {
    flex: 1,
    color: md3Colors.dark.onSurface,
    fontSize: 14,
    fontWeight: "600",
  },
  exerciseSets: {
    color: md3Colors.dark.onSurfaceVariant,
    fontSize: 13,
  },
  setsList: {
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 12,
    paddingTop: 2,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: md3Colors.dark.surfaceContainerHigh,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  setOrder: {
    color: md3Colors.dark.onSurfaceVariant,
    fontSize: 13,
    fontWeight: "600",
  },
  setValue: {
    color: md3Colors.dark.onSurface,
    fontSize: 14,
    fontWeight: "600",
  },
  filteredEmptyState: {
    backgroundColor: md3Colors.dark.surfaceContainer,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  filteredEmptyText: {
    color: md3Colors.dark.onSurfaceVariant,
    fontSize: 14,
  },
  deleteButton: {
    marginTop: 24,
  },
  emptyState: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 24,
  },
  emptyTitle: {
    color: md3Colors.dark.onSurface,
    fontSize: 18,
    fontWeight: "700",
  },
  emptyText: {
    color: md3Colors.dark.onSurfaceVariant,
    fontSize: 14,
    textAlign: "center",
  },
})
