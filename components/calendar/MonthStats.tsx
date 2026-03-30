import { useMemo } from "react"
import { ActivityIndicator, StyleSheet, Text, View } from "react-native"

import { md3Colors } from "@/constants/colors"

import { DaySummary } from "./types"
import { getMonthLabel } from "./utils"

type MonthStatsProps = {
  daySummaries: Map<string, DaySummary>
  isLoading: boolean
  viewDate: Date
}

type TopEntry = {
  label: string
  workoutsCount: number
  setsCount: number
  score: number
} | null

type MuscleGroupStats = {
  workoutIds: Set<number>
  setsCount: number
}

type ExerciseStats = {
  id: number
  name: string
  muscleGroup: string
  workoutIds: Set<number>
  setsCount: number
}

const getPreferenceScore = (workoutsCount: number, setsCount: number) => {
  if (workoutsCount === 0 || setsCount === 0) return 0

  return (2 * workoutsCount * setsCount) / (workoutsCount + setsCount)
}

const getTopEntry = (entries: Map<string, MuscleGroupStats>): TopEntry => {
  const [topEntry] = Array.from(entries.entries())
    .map(([label, value]) => ({
      label,
      workoutsCount: value.workoutIds.size,
      setsCount: value.setsCount,
      score: getPreferenceScore(value.workoutIds.size, value.setsCount),
    }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.workoutsCount - a.workoutsCount ||
        b.setsCount - a.setsCount ||
        a.label.localeCompare(b.label),
    )

  return topEntry ?? null
}

const formatPreferenceLabel = (workoutsCount: number, setsCount: number) => {
  const workoutLabel = workoutsCount === 1 ? "workout" : "workouts"
  const setLabel = setsCount === 1 ? "set" : "sets"

  return `${workoutsCount} ${workoutLabel}, ${setsCount} ${setLabel}`
}

const MonthStats = ({ daySummaries, isLoading, viewDate }: MonthStatsProps) => {
  const currentMonthLabel = useMemo(() => getMonthLabel(viewDate), [viewDate])
  const currentMonthKey = useMemo(() => {
    return `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, "0")}`
  }, [viewDate])

  const stats = useMemo(() => {
    let workoutsCount = 0
    const muscleGroupCounts = new Map<string, MuscleGroupStats>()
    const exerciseCounts = new Map<number, ExerciseStats>()

    daySummaries.forEach((summary) => {
      if (!summary.dateKey.startsWith(currentMonthKey)) return

      workoutsCount += summary.workoutCount

      summary.exercises.forEach((exercise) => {
        const uniqueWorkoutIds = new Set(
          exercise.sets.map((set) => set.workoutId),
        )
        const currentMuscleGroup = muscleGroupCounts.get(exercise.muscleGroup)

        if (currentMuscleGroup) {
          currentMuscleGroup.setsCount += exercise.setsCount
          uniqueWorkoutIds.forEach((workoutId) =>
            currentMuscleGroup.workoutIds.add(workoutId),
          )
        } else {
          muscleGroupCounts.set(exercise.muscleGroup, {
            setsCount: exercise.setsCount,
            workoutIds: new Set(uniqueWorkoutIds),
          })
        }

        const currentExercise = exerciseCounts.get(exercise.id)

        if (currentExercise) {
          currentExercise.setsCount += exercise.setsCount
          uniqueWorkoutIds.forEach((workoutId) =>
            currentExercise.workoutIds.add(workoutId),
          )
        } else {
          exerciseCounts.set(exercise.id, {
            id: exercise.id,
            name: exercise.name,
            muscleGroup: exercise.muscleGroup,
            setsCount: exercise.setsCount,
            workoutIds: new Set(uniqueWorkoutIds),
          })
        }
      })
    })

    return {
      workoutsCount,
      favoriteMuscleGroup: getTopEntry(muscleGroupCounts),
      topExercises: Array.from(exerciseCounts.values())
        .map((exercise) => ({
          id: exercise.id,
          name: exercise.name,
          muscleGroup: exercise.muscleGroup,
          workoutsCount: exercise.workoutIds.size,
          setsCount: exercise.setsCount,
          score: getPreferenceScore(
            exercise.workoutIds.size,
            exercise.setsCount,
          ),
        }))
        .sort(
          (a, b) =>
            b.score - a.score ||
            b.workoutsCount - a.workoutsCount ||
            b.setsCount - a.setsCount ||
            a.name.localeCompare(b.name) ||
            a.muscleGroup.localeCompare(b.muscleGroup),
        )
        .slice(0, 3),
    }
  }, [currentMonthKey, daySummaries])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Selected month</Text>
        <Text style={styles.subtitle}>{currentMonthLabel}</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color={md3Colors.dark.primary} />
          <Text style={styles.loadingText}>Loading month stats...</Text>
        </View>
      ) : (
        <View style={styles.cards}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Favorite muscle group</Text>
            <Text style={styles.cardValue}>
              {stats.favoriteMuscleGroup?.label ?? "No data"}
            </Text>
            <Text style={styles.cardHint}>
              {stats.favoriteMuscleGroup
                ? formatPreferenceLabel(
                    stats.favoriteMuscleGroup.workoutsCount,
                    stats.favoriteMuscleGroup.setsCount,
                  )
                : "No completed sets yet"}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Top exercises</Text>
            {stats.topExercises.length > 0 ? (
              <View style={styles.exerciseList}>
                {stats.topExercises.map((exercise, index) => (
                  <View key={exercise.id} style={styles.exerciseRow}>
                    <View style={styles.exerciseMeta}>
                      <Text style={styles.exerciseName}>
                        {index + 1}. {exercise.name}
                      </Text>
                      <Text style={styles.exerciseMuscleGroup}>
                        {exercise.muscleGroup}
                      </Text>
                      <Text style={styles.exerciseDetails}>
                        {formatPreferenceLabel(
                          exercise.workoutsCount,
                          exercise.setsCount,
                        )}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.cardHint}>No completed sets yet</Text>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Workouts in month</Text>
            <Text style={styles.cardValue}>{stats.workoutsCount}</Text>
            <Text style={styles.cardHint}>
              {stats.workoutsCount === 1 ? "Logged workout" : "Logged workouts"}
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}

export default MonthStats

const styles = StyleSheet.create({
  container: {
    marginTop: 28,
    padding: 20,
    borderRadius: 24,
    backgroundColor: md3Colors.dark.surfaceContainer,
    gap: 18,
  },
  header: {
    gap: 4,
  },
  title: {
    color: md3Colors.dark.onSurface,
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    color: md3Colors.dark.onSurfaceVariant,
    fontSize: 14,
    textTransform: "capitalize",
  },
  loadingState: {
    paddingVertical: 24,
    alignItems: "center",
    gap: 10,
  },
  loadingText: {
    color: md3Colors.dark.onSurfaceVariant,
    fontSize: 14,
  },
  cards: {
    gap: 12,
  },
  card: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: md3Colors.dark.surfaceContainerHighest,
    gap: 8,
  },
  cardLabel: {
    color: md3Colors.dark.onSurfaceVariant,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  cardValue: {
    color: md3Colors.dark.onSurface,
    fontSize: 24,
    fontWeight: "700",
  },
  cardHint: {
    color: md3Colors.dark.onSurfaceVariant,
    fontSize: 14,
  },
  exerciseList: {
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
    color: md3Colors.dark.onSurface,
    fontSize: 17,
    fontWeight: "600",
  },
  exerciseMuscleGroup: {
    color: md3Colors.dark.onSurfaceVariant,
    fontSize: 14,
  },
  exerciseDetails: {
    color: md3Colors.dark.onSurfaceVariant,
    fontSize: 14,
  },
})
