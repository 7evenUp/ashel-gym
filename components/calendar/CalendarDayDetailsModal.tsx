import { useEffect, useMemo, useState } from "react"
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { ChevronDown, ChevronUp, X } from "lucide-react-native"

import { md3Colors } from "@/constants/colors"

import { DaySummary } from "./types"
import { getReadableDateLabel } from "./utils"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

const CalendarDayDetailsModal = ({
  selectedDate,
  selectedSummary,
  onClose,
}: {
  selectedDate: Date | null
  selectedSummary: DaySummary | null
  onClose: VoidFunction
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([])
  const [expandedExerciseIds, setExpandedExerciseIds] = useState<number[]>([])

  useEffect(() => {
    if (selectedDate) setIsVisible(true)
  }, [selectedDate])

  useEffect(() => {
    setSelectedMuscleGroups(selectedSummary?.muscleGroups ?? [])
    setExpandedExerciseIds([])
  }, [selectedSummary])

  const onCloseClick = async () => {
    setIsVisible(false)

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

  const formatWeight = (weight: number) => {
    return weight.toString().replace(".", ",")
  }

  return (
    <Modal
      animationType="fade"
      transparent
      visible={isVisible && selectedDate !== null}
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
                <Text style={styles.sectionTitle}>
                  Проработанные группы мышц
                </Text>
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
                  <Text style={styles.sectionTitle}>
                    Проделанные упражнения
                  </Text>
                  {filteredExercises.length > 0 ? (
                    <View style={styles.exerciseList}>
                      {filteredExercises.map((exercise) => {
                        const isExpanded = expandedExerciseIds.includes(
                          exercise.id,
                        )

                        return (
                          <Pressable
                            key={exercise.id}
                            style={styles.exerciseCard}
                            onPress={() => onToggleExercise(exercise.id)}
                          >
                            <View style={styles.exerciseRow}>
                              <View style={styles.exerciseMeta}>
                                <Text style={styles.exerciseName}>
                                  {exercise.name}
                                </Text>
                                <Text style={styles.exerciseSets}>
                                  Подходы: {exercise.setsCount}
                                </Text>
                              </View>

                              {isExpanded ? (
                                <ChevronUp
                                  color={md3Colors.dark.onSurfaceVariant}
                                  size={18}
                                />
                              ) : (
                                <ChevronDown
                                  color={md3Colors.dark.onSurfaceVariant}
                                  size={18}
                                />
                              )}
                            </View>

                            {isExpanded && (
                              <View style={styles.setsList}>
                                {exercise.sets.map((set, index) => (
                                  <View key={set.id} style={styles.setRow}>
                                    <Text style={styles.setOrder}>
                                      Подход №{index + 1}
                                    </Text>
                                    <Text style={styles.setValue}>
                                      {formatWeight(set.weight)}кг x {set.reps}
                                    </Text>
                                  </View>
                                ))}
                              </View>
                            )}
                          </Pressable>
                        )
                      })}
                    </View>
                  ) : (
                    <View style={styles.filteredEmptyState}>
                      <Text style={styles.filteredEmptyText}>
                        Select at least one muscle group to see exercises.
                      </Text>
                    </View>
                  )}
                </View>
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
    paddingBottom: 24,
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
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
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
