import { useEffect, useMemo, useState } from "react"
import { ScrollView, StyleSheet, Text, View } from "react-native"
import { asc, eq } from "drizzle-orm"
import { matchFont } from "@shopify/react-native-skia"
import { Area, CartesianChart, Line, Scatter } from "victory-native"

import { useSelectedExercise } from "@/store/useSelectedExercise"

import { StatsHistory, statsHistoryTable } from "@/db/schema"

import { md3Colors } from "@/constants/colors"

import useDb from "@/hooks/useDb"

const CHART_HEIGHT = 240

const padNumber = (value: number) => value.toString().padStart(2, "0")

const formatWeight = (value: number) => {
  if (Number.isInteger(value)) return `${value}`

  return value.toFixed(1).replace(".", ",")
}

const formatChartDate = (timestamp: number) => {
  const date = new Date(timestamp)

  return `${padNumber(date.getDate())}.${padNumber(date.getMonth() + 1)}`
}

const formatHistoryDate = (timestamp: number) => {
  const date = new Date(timestamp)

  return `${padNumber(date.getDate())}.${padNumber(
    date.getMonth() + 1,
  )}.${date.getFullYear()} ${padNumber(date.getHours())}:${padNumber(
    date.getMinutes(),
  )}`
}

type ChartDatum = {
  timestamp: number
  value: number
}

type ProgressChartProps = {
  title: string
  history: StatsHistory[] | null
  lineColor: string
  isLoading: boolean
}

const ProgressChart = ({
  title,
  history,
  lineColor,
  isLoading,
}: ProgressChartProps) => {
  const axisFont = useMemo(
    () =>
      matchFont({
        fontFamily: "System",
        fontSize: 11,
        fontWeight: "500",
      }),
    [],
  )

  const chartData = useMemo<ChartDatum[]>(
    () =>
      (history ?? []).map((item) => ({
        timestamp: item.changed_at,
        value: item.value,
      })),
    [history],
  )

  if (isLoading) {
    return (
      <View style={styles.card}>
        <Text style={styles.groupTitle}>{title}</Text>
        <Text style={styles.helperText}>Загрузка истории...</Text>
      </View>
    )
  }

  if (chartData.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.groupTitle}>{title}</Text>
        <Text style={styles.emptyStateText}>
          Пока что недостаточно данных для отображения графика
        </Text>
      </View>
    )
  }

  const latestItem = chartData[chartData.length - 1]

  return (
    <View style={styles.card}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.chartContainer}>
        <CartesianChart
          data={chartData}
          xKey="timestamp"
          yKeys={["value"]}
          domainPadding={{ left: 20, right: 20, top: 24, bottom: 12 }}
          axisOptions={{
            font: axisFont,
            labelColor: {
              x: md3Colors.dark.onSurfaceVariant,
              y: md3Colors.dark.onSurfaceVariant,
            },
            lineColor: {
              grid: md3Colors.dark.outlineVariant,
              frame: md3Colors.dark.outline,
            },
            lineWidth: {
              grid: StyleSheet.hairlineWidth,
              frame: 1,
            },
            tickCount: { x: 3, y: 4 },
            formatXLabel: (value) => formatChartDate(Number(value)),
            formatYLabel: (value) => formatWeight(Number(value)),
          }}
        >
          {({ points, chartBounds }) => (
            <>
              <Area
                points={points.value}
                y0={chartBounds.bottom}
                color={md3Colors.dark.primaryContainer}
                animate={{ type: "timing", duration: 300 }}
              />
              <Line
                points={points.value}
                color={lineColor}
                strokeWidth={3}
                animate={{ type: "timing", duration: 350 }}
              />
              <Scatter
                points={points.value}
                shape="circle"
                radius={4}
                style="fill"
                color={lineColor}
              />
            </>
          )}
        </CartesianChart>
      </View>

      <View style={styles.latestEntry}>
        <Text style={styles.latestEntryLabel}>Последнее изменение</Text>
        <Text style={styles.latestEntryValue}>
          {formatWeight(latestItem.value)} кг
        </Text>
        <Text style={styles.latestEntryDate}>
          {formatHistoryDate(latestItem.timestamp)}
        </Text>
      </View>
    </View>
  )
}

const StatsHistoryModal = () => {
  const db = useDb()

  const exercise = useSelectedExercise((state) => state.exercise)

  const [workStatsHistory, setWorkStatsHistory] = useState<
    StatsHistory[] | null
  >(null)
  const [maxStatsHistory, setMaxStatsHistory] = useState<StatsHistory[] | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (exercise === null) {
      setIsLoading(false)
      return
    }

    let isActive = true

    const getData = async () => {
      setIsLoading(true)

      const statsHistory = await db
        .select()
        .from(statsHistoryTable)
        .where(eq(statsHistoryTable.exercise_id, exercise.id))
        .orderBy(asc(statsHistoryTable.changed_at))

      if (!isActive) return

      setWorkStatsHistory(statsHistory.filter((item) => item.type === "work"))
      setMaxStatsHistory(statsHistory.filter((item) => item.type === "max"))
      setIsLoading(false)
    }

    getData()

    return () => {
      isActive = false
    }
  }, [exercise, db])

  if (exercise === null) return null

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>История изменений</Text>
      <Text style={styles.description}>
        Для упражнения {`"${exercise.name}"`}
      </Text>

      <ProgressChart
        title="Рабочий вес"
        history={workStatsHistory}
        lineColor={md3Colors.dark.primary}
        isLoading={isLoading}
      />
      <ProgressChart
        title="Максимальный вес"
        history={maxStatsHistory}
        lineColor={md3Colors.dark.tertiary}
        isLoading={isLoading}
      />
    </ScrollView>
  )
}

export default StatsHistoryModal

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingInline: 16,
    paddingBlock: 24,
    gap: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "500",
    color: md3Colors.dark.onSurface,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: md3Colors.dark.onSurfaceVariant,
    textAlign: "center",
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: md3Colors.dark.onSurface,
    alignSelf: "center",
  },
  card: {
    backgroundColor: md3Colors.dark.surfaceContainerLow,
    borderRadius: 20,
    padding: 16,
    gap: 16,
  },
  chartContainer: {
    height: CHART_HEIGHT,
  },
  helperText: {
    fontSize: 13,
    color: md3Colors.dark.onSurfaceVariant,
  },
  emptyStateText: {
    fontSize: 15,
    color: md3Colors.dark.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 22,
  },
  latestEntry: {
    borderTopWidth: 1,
    borderTopColor: md3Colors.dark.outlineVariant,
    paddingTop: 16,
    gap: 4,
  },
  latestEntryLabel: {
    fontSize: 13,
    color: md3Colors.dark.onSurfaceVariant,
  },
  latestEntryValue: {
    fontSize: 24,
    fontWeight: "700",
    color: md3Colors.dark.onSurface,
  },
  latestEntryDate: {
    fontSize: 13,
    color: md3Colors.dark.onSurfaceVariant,
  },
})
