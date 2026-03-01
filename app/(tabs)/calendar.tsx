import { useEffect, useMemo, useState } from "react"
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { addDatabaseChangeListener } from "expo-sqlite"
import { ChevronLeft, ChevronRight, X } from "lucide-react-native"

import useDb from "@/hooks/useDb"

import {
  exerciseSetTable,
  exerciseTable,
  muscleGroupTable,
  workoutTable,
} from "@/db/schema"

type DaySummary = {
  dateKey: string
  workoutCount: number
  muscleGroups: string[]
  exercises: {
    id: number
    name: string
    setsCount: number
  }[]
  setsCount: number
}

type DaySummaryDraft = {
  workoutIds: Set<number>
  muscleGroups: Set<string>
  exerciseSetCounts: Map<number, { name: string; setsCount: number }>
  setsCount: number
}

const WEEK_DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const TRACKED_TABLES = ["workout", "exercise_set", "exercise", "muscle_group"]

const toDayKey = (value: number | Date) => {
  const date = value instanceof Date ? value : new Date(value)

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-")
}

const getMonthLabel = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date)
}

const getReadableDateLabel = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

const getMonthGrid = (date: Date) => {
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
  const weekdayIndex = (monthStart.getDay() + 6) % 7
  const gridStart = new Date(monthStart)

  gridStart.setDate(monthStart.getDate() - weekdayIndex)

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart)
    day.setDate(gridStart.getDate() + index)
    return day
  })
}

const shiftMonth = (date: Date, amount: number) => {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

const formatMuscleGroupName = (name: string) => {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

export default function CalendarScreen() {
  const db = useDb()

  const [viewDate, setViewDate] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })
  const [daySummaries, setDaySummaries] = useState<Map<string, DaySummary>>(
    () => new Map(),
  )
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const monthGrid = useMemo(() => getMonthGrid(viewDate), [viewDate])
  const selectedSummary = useMemo(() => {
    if (selectedDate === null) return null
    return daySummaries.get(toDayKey(selectedDate)) ?? null
  }, [daySummaries, selectedDate])

  useEffect(() => {
    let isActive = true

    const loadCalendarData = async () => {
      const [workouts, exerciseSets, exercises, muscleGroups] =
        await Promise.all([
          db.select().from(workoutTable),
          db.select().from(exerciseSetTable),
          db.select().from(exerciseTable),
          db.select().from(muscleGroupTable),
        ])

      if (!isActive) return

      const exercisesById = new Map(
        exercises.map((exercise) => [exercise.id, exercise]),
      )
      const muscleGroupsById = new Map(
        muscleGroups.map((muscleGroup) => [muscleGroup.id, muscleGroup]),
      )
      const summaryDrafts = new Map<string, DaySummaryDraft>()
      const validSets = exerciseSets.filter(
        (set) => set.reps > 0 && set.weight > 0,
      )
      const setsByWorkoutId = new Map<number, typeof validSets>()

      validSets.forEach((set) => {
        const sets = setsByWorkoutId.get(set.workout_id)

        if (sets) {
          sets.push(set)
          return
        }

        setsByWorkoutId.set(set.workout_id, [set])
      })

      workouts.forEach((workout) => {
        const workoutSets = setsByWorkoutId.get(workout.id)

        if (!workoutSets || workoutSets.length === 0) return

        const dayKey = toDayKey(workout.created_at)
        let draft = summaryDrafts.get(dayKey)

        if (!draft) {
          draft = {
            workoutIds: new Set<number>(),
            muscleGroups: new Set<string>(),
            exerciseSetCounts: new Map<
              number,
              { name: string; setsCount: number }
            >(),
            setsCount: 0,
          }
          summaryDrafts.set(dayKey, draft)
        }

        draft.workoutIds.add(workout.id)

        workoutSets.forEach((set) => {
          const exercise = exercisesById.get(set.exercise_id)

          if (!exercise) return

          draft.setsCount += 1

          const exerciseSummary = draft.exerciseSetCounts.get(exercise.id)

          if (exerciseSummary) {
            exerciseSummary.setsCount += 1
          } else {
            draft.exerciseSetCounts.set(exercise.id, {
              name: exercise.name,
              setsCount: 1,
            })
          }

          const muscleGroup = muscleGroupsById.get(exercise.muscle_group_id)
          if (muscleGroup) {
            draft.muscleGroups.add(formatMuscleGroupName(muscleGroup.name))
          }
        })
      })

      const nextSummaries = new Map<string, DaySummary>()

      summaryDrafts.forEach((draft, dayKey) => {
        nextSummaries.set(dayKey, {
          dateKey: dayKey,
          workoutCount: draft.workoutIds.size,
          muscleGroups: Array.from(draft.muscleGroups.values()),
          exercises: Array.from(draft.exerciseSetCounts.entries())
            .map(([id, value]) => ({
              id,
              name: value.name,
              setsCount: value.setsCount,
            }))
            .sort(
              (a, b) =>
                b.setsCount - a.setsCount || a.name.localeCompare(b.name),
            ),
          setsCount: draft.setsCount,
        })
      })

      setDaySummaries(nextSummaries)
      setIsLoading(false)
    }

    loadCalendarData()

    const subscription = addDatabaseChangeListener((event) => {
      if (!TRACKED_TABLES.includes(event.tableName)) return
      loadCalendarData()
    })

    return () => {
      isActive = false
      subscription.remove()
    }
  }, [db])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => setViewDate((current) => shiftMonth(current, -1))}
          style={styles.iconButton}
        >
          <ChevronLeft color="white" size={22} />
        </Pressable>

        <Text style={styles.monthLabel}>{getMonthLabel(viewDate)}</Text>

        <Pressable
          onPress={() => setViewDate((current) => shiftMonth(current, 1))}
          style={styles.iconButton}
        >
          <ChevronRight color="white" size={22} />
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {WEEK_DAY_LABELS.map((label) => (
          <Text key={label} style={styles.weekLabel}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {monthGrid.map((day) => {
          const isCurrentMonth = day.getMonth() === viewDate.getMonth()
          const dayKey = toDayKey(day)
          const hasWorkout = daySummaries.has(dayKey)
          const isSelected =
            selectedDate !== null && toDayKey(selectedDate) === dayKey

          return (
            <Pressable
              key={dayKey}
              style={styles.dayCell}
              onPress={() => setSelectedDate(new Date(day))}
            >
              <View
                style={[
                  styles.dayBadge,
                  !isCurrentMonth && styles.dayBadgeOutsideMonth,
                  hasWorkout && styles.dayBadgeWithWorkout,
                  isSelected && styles.dayBadgeSelected,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    !isCurrentMonth && styles.dayTextOutsideMonth,
                    isSelected && styles.dayTextSelected,
                  ]}
                >
                  {day.getDate()}
                </Text>
              </View>
            </Pressable>
          )
        })}
      </View>

      <Text style={styles.helperText}>
        {isLoading
          ? "Loading workouts..."
          : "Outlined days contain at least one logged workout."}
      </Text>

      <Modal
        animationType="slide"
        transparent
        visible={selectedDate !== null}
        onRequestClose={() => setSelectedDate(null)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setSelectedDate(null)}
          />

          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Day details</Text>
                <Text style={styles.modalDateLabel}>
                  {selectedDate ? getReadableDateLabel(selectedDate) : ""}
                </Text>
              </View>

              <Pressable
                style={styles.iconButton}
                onPress={() => setSelectedDate(null)}
              >
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
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#211e27",
    paddingHorizontal: 16,
    paddingTop: 28,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  monthLabel: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  weekLabel: {
    flex: 1,
    textAlign: "center",
    color: "rgba(255,255,255,0.45)",
    fontSize: 13,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.2857%",
    aspectRatio: 1 / 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  dayBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  dayBadgeOutsideMonth: {
    opacity: 0.4,
  },
  dayBadgeWithWorkout: {
    borderColor: "rgba(184, 97, 200, 0.5)",
    backgroundColor: "rgba(184, 97, 200, 0.1)",
  },
  dayBadgeSelected: {
    backgroundColor: "#b861c8",
    borderColor: "#b861c8",
  },
  dayText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  dayTextOutsideMonth: {
    color: "rgba(255,255,255,0.7)",
  },
  dayTextSelected: {
    color: "white",
  },
  helperText: {
    marginTop: 16,
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    textAlign: "center",
  },
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
