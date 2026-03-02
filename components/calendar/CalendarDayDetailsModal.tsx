import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { X } from "lucide-react-native"

import { DaySummary } from "./types"
import { getReadableDateLabel } from "./utils"

const CalendarDayDetailsModal = ({
  selectedDate,
  selectedSummary,
  onClose,
}: {
  selectedDate: Date | null
  selectedSummary: DaySummary | null
  onClose: VoidFunction
}) => {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={selectedDate !== null}
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />

        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Day details</Text>
              <Text style={styles.modalDateLabel}>
                {selectedDate ? getReadableDateLabel(selectedDate) : ""}
              </Text>
            </View>

            <Pressable style={styles.iconButton} onPress={onClose}>
              <X color="white" size={20} />
            </Pressable>
          </View>

          {selectedSummary ? (
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Workouts</Text>
                <Text style={styles.statValue}>
                  {selectedSummary.workoutCount}
                </Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Sets</Text>
                <Text style={styles.statValue}>
                  {selectedSummary.setsCount}
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Muscle groups</Text>
                <View style={styles.tagList}>
                  {selectedSummary.muscleGroups.map((muscleGroup) => (
                    <View key={muscleGroup} style={styles.tag}>
                      <Text style={styles.tagText}>{muscleGroup}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Exercises</Text>
                <View style={styles.exerciseList}>
                  {selectedSummary.exercises.map((exercise) => (
                    <View key={exercise.id} style={styles.exerciseRow}>
                      <Text style={styles.exerciseName}>{exercise.name}</Text>
                      <Text style={styles.exerciseSets}>
                        {exercise.setsCount} set
                        {exercise.setsCount === 1 ? "" : "s"}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
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
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  modalCard: {
    maxHeight: "72%",
    backgroundColor: "#2d2636",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
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
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  modalTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
  },
  modalDateLabel: {
    marginTop: 4,
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
  },
  modalScroll: {
    width: "100%",
  },
  modalScrollContent: {
    gap: 16,
    paddingBottom: 4,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontWeight: "600",
  },
  statValue: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  tagList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    borderRadius: 9999,
    backgroundColor: "rgba(184,97,200,0.18)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(184,97,200,0.35)",
  },
  tagText: {
    color: "#f0d4f5",
    fontSize: 13,
    fontWeight: "600",
  },
  exerciseList: {
    gap: 10,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  exerciseName: {
    flex: 1,
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  exerciseSets: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 24,
  },
  emptyTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  emptyText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    textAlign: "center",
  },
})
