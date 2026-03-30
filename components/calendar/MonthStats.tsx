import { useMemo } from "react"
import { StyleSheet, Text, View } from "react-native"
import {
  Dumbbell,
  ChessQueenIcon,
  Trophy,
  Tally5Icon,
} from "lucide-react-native"

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

const formatWorkoutLabel = (count: number) => {
  return `${count} ${count === 1 ? "тренировка" : "тренировок"}`
}

const formatSetLabel = (count: number) => {
  return `${count} ${count === 1 ? "подход" : "подходов"}`
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

  if (isLoading) return

  if (!stats.favoriteMuscleGroup || stats.topExercises.length === 0)
    return (
      <View style={[styles.container, styles.containerForEmpty]}>
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>
            Статистика за {currentMonthLabel}
          </Text>

          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Недостаточно данных</Text>
            <Text style={styles.emptyStateText}>
              Закончи хотя бы одну тренировку, чтобы увидеть статистику за этот
              месяц
            </Text>
          </View>
        </View>
      </View>
    )

  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>Статистика за {currentMonthLabel}</Text>

        <View style={styles.heroCounter}>
          <Text style={styles.heroCounterValue}>{stats.workoutsCount}</Text>
          <Text style={styles.heroCounterLabel}>Тренировок</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIcon}>
            <ChessQueenIcon size={32} color={md3Colors.dark.onPrimary} />
          </View>
          <View style={styles.cardHeaderInfo}>
            <Text style={styles.cardLabel}>Любимая группа мышц</Text>
            <Text style={styles.cardValue}>
              {stats.favoriteMuscleGroup?.label ?? "Нет данных"}
            </Text>
          </View>
        </View>

        <Text style={styles.cardHint}>
          Сбалансировано по частоте тренировок и по общему количеству
          выполненных подходов
        </Text>

        <View style={styles.pillRow}>
          <View style={styles.metaPill}>
            <Dumbbell size={18} color={md3Colors.dark.onTertiaryContainer} />
            <Text style={styles.metaPillText}>
              {formatWorkoutLabel(stats.favoriteMuscleGroup.workoutsCount)}
            </Text>
          </View>
          <View style={styles.metaPill}>
            <Tally5Icon size={18} color={md3Colors.dark.onTertiaryContainer} />
            <Text style={styles.metaPillText}>
              {formatSetLabel(stats.favoriteMuscleGroup.setsCount)}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.card, styles.cardLast]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIcon}>
            <Trophy size={32} color={md3Colors.dark.onPrimary} />
          </View>
          <View style={styles.cardHeaderInfo}>
            <Text style={styles.cardLabel}>Любимые упражнения</Text>
            <Text style={styles.cardHint}>
              Определяются по смешанному количеству тренировок и подходов
            </Text>
          </View>
        </View>

        <View style={styles.exerciseList}>
          {stats.topExercises.map((exercise, index) => (
            <View key={exercise.id} style={styles.exerciseRow}>
              <View
                style={[
                  styles.rankBadge,
                  index === 0 && styles.rankBadgeFirst,
                  index === 1 && styles.rankBadgeSecond,
                  index === 2 && styles.rankBadgeThird,
                ]}
              >
                <Text
                  style={[
                    styles.rankBadgeText,
                    index === 0 && styles.rankBadgeTextFirst,
                    index === 1 && styles.rankBadgeTextSecond,
                    index === 2 && styles.rankBadgeTextThird,
                  ]}
                >
                  {index + 1}
                </Text>
              </View>

              <View style={styles.exerciseInfo}>
                <View style={styles.exerciseHeader}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseMuscleGroup}>
                    {exercise.muscleGroup}
                  </Text>
                </View>
                <View style={styles.pillRow}>
                  <View style={styles.metaPill}>
                    <Dumbbell
                      size={18}
                      color={md3Colors.dark.onTertiaryContainer}
                    />
                    <Text style={styles.metaPillText}>
                      {formatWorkoutLabel(exercise.workoutsCount)}
                    </Text>
                  </View>
                  <View style={styles.metaPill}>
                    <Tally5Icon
                      size={18}
                      color={md3Colors.dark.onTertiaryContainer}
                    />
                    <Text style={styles.metaPillText}>
                      {formatSetLabel(exercise.setsCount)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

export default MonthStats

const styles = StyleSheet.create({
  container: {
    marginTop: 28,
    gap: 24,
    backgroundColor: md3Colors.dark.surfaceContainerHigh,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  containerForEmpty: {
    flex: 1,
    paddingBottom: 28,
    borderRadius: 24,
  },
  heroCard: {
    paddingTop: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 16,
  },
  heroTitle: {
    color: md3Colors.dark.onSurface,
    fontSize: 20,
    fontWeight: "600",
  },
  heroCounter: {
    minWidth: 92,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 22,
    backgroundColor: md3Colors.dark.surfaceContainerHighest,
    alignItems: "center",
    gap: 2,
  },
  heroCounterValue: {
    color: md3Colors.dark.primary,
    fontSize: 36,
    fontWeight: "800",
  },
  heroCounterLabel: {
    color: md3Colors.dark.onSurfaceVariant,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  card: {
    padding: 16,
    borderRadius: 24,
    backgroundColor: md3Colors.dark.surfaceContainerHighest,
    gap: 14,
  },
  cardLast: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardHeaderInfo: {
    flex: 1,
    gap: 4,
  },
  cardIcon: {
    width: 64,
    height: 64,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: md3Colors.dark.primary,
  },
  cardLabel: {
    color: md3Colors.dark.onSurface,
    fontSize: 14,
    fontWeight: "600",
  },
  cardValue: {
    color: md3Colors.dark.onSurface,
    fontSize: 28,
    lineHeight: 28,
    fontWeight: "700",
  },
  cardHint: {
    color: md3Colors.dark.onSurfaceVariant,
    fontSize: 15,
    lineHeight: 20,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: md3Colors.dark.tertiaryContainer,
  },
  metaPillText: {
    color: md3Colors.dark.onTertiaryContainer,
    fontSize: 16,
    fontWeight: "700",
  },
  exerciseList: {
    marginTop: 8,
    gap: 4,
  },
  exerciseRow: {
    gap: 12,
    padding: 14,
    borderRadius: 20,
    backgroundColor: md3Colors.dark.surfaceContainerHigh,
  },
  rankBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rankBadgeFirst: {
    backgroundColor: md3Colors.dark.primary,
  },
  rankBadgeSecond: {
    backgroundColor: md3Colors.dark.tertiary,
  },
  rankBadgeThird: {
    backgroundColor: md3Colors.dark.secondary,
  },
  rankBadgeText: {
    color: md3Colors.dark.onSurface,
    fontSize: 15,
    fontWeight: "800",
  },
  rankBadgeTextFirst: {
    color: md3Colors.dark.onPrimary,
  },
  rankBadgeTextSecond: {
    color: md3Colors.dark.onTertiary,
  },
  rankBadgeTextThird: {
    color: md3Colors.dark.onSecondary,
  },
  exerciseInfo: {
    flex: 1,
    gap: 16,
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
    marginTop: 16,
  },
  exerciseName: {
    color: md3Colors.dark.onSurface,
    fontSize: 22,
    fontWeight: "600",
    flexShrink: 1,
  },
  exerciseMuscleGroup: {
    color: md3Colors.dark.onSurfaceVariant,
    backgroundColor: md3Colors.dark.surfaceVariant,
    fontSize: 14,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: "auto",
  },
  emptyState: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: md3Colors.dark.surfaceContainer,
    gap: 6,
  },
  emptyStateTitle: {
    color: md3Colors.dark.onSurface,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyStateText: {
    color: md3Colors.dark.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
})
