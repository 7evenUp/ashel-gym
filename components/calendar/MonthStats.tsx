import { useMemo } from "react"
import { StyleSheet, Text, View } from "react-native"
import { Image } from "expo-image"
import {
  Dumbbell,
  ChessQueenIcon,
  Trophy,
  Tally5Icon,
  BicepsFlexedIcon,
} from "lucide-react-native"

import { md3Colors } from "@/constants/colors"
import { exerciseImages } from "@/constants/exerciseImages"
import { muscleGroupImages } from "@/constants/muscleGroupImages"

import useMuscleGroups from "@/hooks/useMuscleGroups"

import { DaySummary } from "./types"
import { formatMuscleGroupName, getMonthLabel } from "./utils"

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

type LeastWorkedMuscleGroup = {
  labels: string[]
  workoutsCount: number
  setsCount: number
}

type MuscleGroupVisual = {
  key: keyof typeof muscleGroupImages
  label: string
  image: number
  blurhash: string
}

type ExerciseStats = {
  id: number
  name: string
  image: string
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

const getLeastWorkedMuscleGroup = (
  entries: Map<string, MuscleGroupStats>,
  allMuscleGroups: string[],
): LeastWorkedMuscleGroup | null => {
  if (allMuscleGroups.length === 0) return null

  const normalizedEntries = allMuscleGroups
    .map((label) => {
      const stats = entries.get(label)
      const workoutsCount = stats?.workoutIds.size ?? 0
      const setsCount = stats?.setsCount ?? 0

      return {
        label,
        workoutsCount,
        setsCount,
        score: getPreferenceScore(workoutsCount, setsCount),
      }
    })
    .sort(
      (a, b) =>
        a.score - b.score ||
        a.setsCount - b.setsCount ||
        a.workoutsCount - b.workoutsCount ||
        a.label.localeCompare(b.label),
    )

  const zeroEntries = normalizedEntries.filter(
    (entry) => entry.workoutsCount === 0 && entry.setsCount === 0,
  )

  if (zeroEntries.length > 0) {
    return {
      labels: zeroEntries.map((entry) => entry.label),
      workoutsCount: 0,
      setsCount: 0,
    }
  }

  const [leastWorked] = normalizedEntries

  if (!leastWorked) return null

  return {
    labels: [leastWorked.label],
    workoutsCount: leastWorked.workoutsCount,
    setsCount: leastWorked.setsCount,
  }
}

const formatWorkoutLabel = (count: number) => {
  return `${count} ${count === 1 ? "тренировка" : "тренировок"}`
}

const formatSetLabel = (count: number) => {
  return `${count} ${count === 1 ? "подход" : "подходов"}`
}

const formatDurationLabel = (seconds: number) => {
  if (seconds < 60) return `${seconds} с`

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (remainingSeconds === 0) return `${minutes} м`

  return `${minutes}:${remainingSeconds}`
}

const getExerciseImageSource = (
  muscleGroupKey: keyof typeof exerciseImages | null,
  image: string,
) => {
  if (muscleGroupKey === null) return null

  const images = exerciseImages[muscleGroupKey] as Record<string, number>

  return images[image] ?? null
}

const MonthStats = ({ daySummaries, isLoading, viewDate }: MonthStatsProps) => {
  const muscleGroups = useMuscleGroups()

  const currentMonthLabel = useMemo(() => getMonthLabel(viewDate), [viewDate])

  const currentMonthKey = useMemo(() => {
    return `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, "0")}`
  }, [viewDate])

  const muscleGroupVisuals = useMemo<MuscleGroupVisual[]>(
    () =>
      (muscleGroups ?? [])
        .map((muscleGroup) => ({
          key: muscleGroup.name,
          label: formatMuscleGroupName(muscleGroup.name),
          image: muscleGroupImages[muscleGroup.name].img,
          blurhash: muscleGroupImages[muscleGroup.name].blurhash,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [muscleGroups],
  )

  const allMuscleGroups = useMemo(
    () => muscleGroupVisuals.map((muscleGroup) => muscleGroup.label),
    [muscleGroupVisuals],
  )

  const muscleGroupVisualsByLabel = useMemo(
    () =>
      new Map(
        muscleGroupVisuals.map((muscleGroup) => [
          muscleGroup.label,
          muscleGroup,
        ]),
      ),
    [muscleGroupVisuals],
  )

  const stats = useMemo(() => {
    let workoutsCount = 0
    let setsCount = 0
    const muscleGroupCounts = new Map<string, MuscleGroupStats>()
    const exerciseCounts = new Map<number, ExerciseStats>()

    daySummaries.forEach((summary) => {
      if (!summary.dateKey.startsWith(currentMonthKey)) return

      workoutsCount += summary.workoutCount
      setsCount += summary.setsCount

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
            image: exercise.image,
            muscleGroup: exercise.muscleGroup,
            setsCount: exercise.setsCount,
            workoutIds: new Set(uniqueWorkoutIds),
          })
        }
      })
    })

    return {
      workoutsCount,
      setsCount,
      spentTimeInSeconds: setsCount * 45,
      favoriteMuscleGroup: getTopEntry(muscleGroupCounts),
      leastWorkedMuscleGroup: getLeastWorkedMuscleGroup(
        muscleGroupCounts,
        allMuscleGroups,
      ),
      topExercises: Array.from(exerciseCounts.values())
        .map((exercise) => ({
          id: exercise.id,
          name: exercise.name,
          image: exercise.image,
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
  }, [allMuscleGroups, currentMonthKey, daySummaries])

  const favoriteMuscleGroupVisual = useMemo(
    () =>
      stats.favoriteMuscleGroup
        ? (muscleGroupVisualsByLabel.get(stats.favoriteMuscleGroup.label) ??
          null)
        : null,
    [muscleGroupVisualsByLabel, stats.favoriteMuscleGroup],
  )

  const leastWorkedMuscleGroupVisuals = useMemo(
    () =>
      stats.leastWorkedMuscleGroup?.labels
        .map((label) => muscleGroupVisualsByLabel.get(label) ?? null)
        .filter((value): value is MuscleGroupVisual => value !== null) ?? [],
    [muscleGroupVisualsByLabel, stats.leastWorkedMuscleGroup],
  )

  if (isLoading || muscleGroups === null) return

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

        <View style={styles.heroMetrics}>
          <View style={styles.heroMetricCard}>
            <Text style={styles.heroMetricValue}>{stats.workoutsCount}</Text>
            <Text style={styles.heroMetricLabel}>Тренировок</Text>
          </View>
          <View style={styles.heroMetricCard}>
            <Text style={styles.heroMetricValue}>{stats.setsCount}</Text>
            <Text style={styles.heroMetricLabel}>Подходов</Text>
          </View>
          <View style={styles.heroMetricCard}>
            <Text style={styles.heroMetricValue}>
              {formatDurationLabel(stats.spentTimeInSeconds)}
            </Text>
            <Text style={styles.heroMetricLabel}>Время</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderInfo}>
            <Text style={styles.cardLabel}>Любимая группа мышц</Text>
            <Text style={styles.cardValue}>
              {stats.favoriteMuscleGroup?.label ?? "Нет данных"}
            </Text>
          </View>
          <View style={styles.cardIcon}>
            <ChessQueenIcon size={24} color={md3Colors.dark.onPrimary} />
          </View>
        </View>

        {favoriteMuscleGroupVisual && (
          <Image
            style={styles.muscleGroupHeroImage}
            source={favoriteMuscleGroupVisual.image}
            placeholder={{ blurhash: favoriteMuscleGroupVisual.blurhash }}
            transition={250}
          />
        )}

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

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderInfo}>
            <Text style={styles.cardLabel}>Любимые упражнения</Text>
            <Text style={styles.cardHint}>
              Определяются по смешанному количеству тренировок и подходов
            </Text>
          </View>
          <View style={styles.cardIcon}>
            <Trophy size={24} color={md3Colors.dark.onPrimary} />
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

              <Image
                style={[
                  styles.exerciseImage,
                  !getExerciseImageSource(
                    muscleGroupVisualsByLabel.get(exercise.muscleGroup)?.key ??
                      null,
                    exercise.image,
                  ) && styles.exerciseImageFallback,
                ]}
                source={getExerciseImageSource(
                  muscleGroupVisualsByLabel.get(exercise.muscleGroup)?.key ??
                    null,
                  exercise.image,
                )}
                transition={250}
              />

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

      <View style={[styles.card, styles.cardAccent, styles.cardLast]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderInfo}>
            <Text style={[styles.cardLabel, styles.cardLabelAccent]}>
              Группа мышц для акцента
            </Text>
            <Text style={[styles.cardValue, styles.cardValueAccent]}>
              {stats.leastWorkedMuscleGroup?.labels.join(", ") ?? "Нет данных"}
            </Text>
          </View>
          <View style={[styles.cardIcon, styles.cardIconAccent]}>
            <BicepsFlexedIcon size={24} color={md3Colors.dark.onSecondary} />
          </View>
        </View>

        {leastWorkedMuscleGroupVisuals.length === 1 && (
          <Image
            style={styles.muscleGroupHeroImage}
            source={leastWorkedMuscleGroupVisuals[0].image}
            placeholder={{
              blurhash: leastWorkedMuscleGroupVisuals[0].blurhash,
            }}
            transition={250}
          />
        )}

        {leastWorkedMuscleGroupVisuals.length > 1 && (
          <View style={styles.muscleGroupGrid}>
            {leastWorkedMuscleGroupVisuals.map((muscleGroup) => (
              <View key={muscleGroup.key} style={styles.muscleGroupTile}>
                <Image
                  style={styles.muscleGroupTileImage}
                  source={muscleGroup.image}
                  placeholder={{ blurhash: muscleGroup.blurhash }}
                  transition={250}
                />
                <Text style={styles.muscleGroupTileText}>
                  {muscleGroup.label}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Text style={[styles.cardHint, styles.cardHintAccent]}>
          В этом месяце следует сделать упор на эту группу мышц
        </Text>

        {stats.leastWorkedMuscleGroup && (
          <View style={styles.pillRow}>
            <View style={[styles.metaPill, styles.metaPillAccent]}>
              <Dumbbell size={18} color={md3Colors.dark.onSecondary} />
              <Text style={[styles.metaPillText, styles.metaPillTextAccent]}>
                {formatWorkoutLabel(stats.leastWorkedMuscleGroup.workoutsCount)}
              </Text>
            </View>
            <View style={[styles.metaPill, styles.metaPillAccent]}>
              <Tally5Icon size={18} color={md3Colors.dark.onSecondary} />
              <Text style={[styles.metaPillText, styles.metaPillTextAccent]}>
                {formatSetLabel(stats.leastWorkedMuscleGroup.setsCount)}
              </Text>
            </View>
          </View>
        )}
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
  heroMetrics: {
    width: "100%",
    flexDirection: "row",
    gap: 8,
  },
  heroMetricCard: {
    flex: 1,
    minHeight: 82,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 22,
    backgroundColor: md3Colors.dark.surfaceContainerHighest,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  heroMetricValue: {
    color: md3Colors.dark.primary,
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },
  heroMetricLabel: {
    color: md3Colors.dark.onSurfaceVariant,
    fontSize: 14,
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
  cardAccent: {
    backgroundColor: md3Colors.dark.secondaryContainer,
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
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: md3Colors.dark.primary,
    alignSelf: "flex-start",
  },
  cardIconAccent: {
    backgroundColor: md3Colors.dark.secondary,
  },
  cardLabel: {
    color: md3Colors.dark.onSurface,
    fontSize: 20,
  },
  cardLabelAccent: {
    color: md3Colors.dark.onSecondaryContainer,
  },
  cardValueAccent: {
    color: md3Colors.dark.onSecondaryContainer,
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
  cardHintAccent: {
    color: md3Colors.dark.onSecondaryContainer,
  },
  muscleGroupHeroImage: {
    width: "100%",
    aspectRatio: 1 / 1,
    borderRadius: 20,
  },
  muscleGroupGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  muscleGroupTile: {
    width: 96,
    gap: 8,
  },
  muscleGroupTileImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 18,
  },
  muscleGroupTileText: {
    color: md3Colors.dark.onSecondaryContainer,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
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
  metaPillAccent: {
    backgroundColor: md3Colors.dark.onSecondaryContainer,
  },
  metaPillText: {
    color: md3Colors.dark.onTertiaryContainer,
    fontSize: 16,
    fontWeight: "700",
  },
  metaPillTextAccent: {
    color: md3Colors.dark.onSecondary,
  },
  exerciseList: {
    marginTop: 8,
    gap: 4,
  },
  exerciseRow: {
    gap: 12,
    padding: 2,
    paddingBottom: 14,
    borderRadius: 20,
    backgroundColor: md3Colors.dark.surfaceContainerHigh,
  },
  exerciseImage: {
    marginInline: "auto",
    width: "75%",
    aspectRatio: 1 / 1,
    borderRadius: 18,
  },
  exerciseImageFallback: {
    borderWidth: 1,
    borderColor: md3Colors.dark.outlineVariant,
  },
  rankBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    zIndex: 999,
    left: 14,
    top: 14,
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
    paddingHorizontal: 14,
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
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
