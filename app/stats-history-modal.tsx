import { useEffect, useMemo, useState } from "react"
import { ScrollView, StyleSheet, Text, View } from "react-native"
import { useFont } from "@shopify/react-native-skia"
import { Area, CartesianChart, Line, Scatter } from "victory-native"

import { useSelectedExercise } from "@/store/useSelectedExercise"
import { getExerciseStatsHistory } from "@/db/repositories/stats"
import { StatsHistory } from "@/db/schema"

import { md3Colors } from "@/constants/colors"

const audiowide = require("../assets/fonts/Audiowide-Regular.ttf")

const CHART_HEIGHT = 300
const WEIGHT_TICK_PADDING = 5

const getNiceWeightStep = (range: number) => {
  if (range <= 10) return 2.5
  if (range <= 25) return 5
  if (range <= 50) return 10
  if (range <= 100) return 20

  return 25
}

const padNumber = (value: number) => value.toString().padStart(2, "0")

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

type ChartData = {
  index: number
  timestamp: number
  dateLabel: string
  value: number
}

const ProgressChart = ({
  title,
  history,
  isLoading,
}: {
  title: string
  history: StatsHistory[] | null
  isLoading: boolean
}) => {
  const font = useFont(audiowide, 12)

  const chartData = useMemo<ChartData[]>(
    () =>
      (history ?? []).map((item, index) => ({
        index,
        timestamp: item.changed_at,
        dateLabel: formatChartDate(item.changed_at),
        value: item.value,
      })),
    [history],
  )

  const xTickValues = useMemo(() => {
    return chartData.map((item) => item.index)
  }, [chartData])

  const yTickValues = useMemo(() => {
    const values = chartData.map((item) => item.value)
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)
    const lowerBound = Math.max(
      0,
      Math.floor(minValue / WEIGHT_TICK_PADDING) * WEIGHT_TICK_PADDING -
        WEIGHT_TICK_PADDING,
    )
    const upperBound =
      Math.ceil(maxValue / WEIGHT_TICK_PADDING) * WEIGHT_TICK_PADDING +
      WEIGHT_TICK_PADDING
    const step = getNiceWeightStep(upperBound - lowerBound)
    const ticks: number[] = []

    for (let tick = lowerBound; tick <= upperBound; tick += step) {
      ticks.push(Number(tick.toFixed(2)))
    }

    if (ticks[ticks.length - 1] !== upperBound) {
      ticks.push(upperBound)
    }

    return ticks
  }, [chartData])

  const getDateLabelByIndex = (index: number) => {
    const item = chartData[Math.round(index)]

    return item?.dateLabel ?? ""
  }

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
          xKey="index"
          yKeys={["value"]}
          domainPadding={{ left: 12, right: 24, top: 12, bottom: 12 }}
          xAxis={{
            font,
            labelColor: md3Colors.dark.onSurfaceVariant,
            lineColor: md3Colors.dark.outlineVariant,
            lineWidth: StyleSheet.hairlineWidth,
            tickCount: xTickValues.length,
            tickValues: xTickValues,
            labelRotate: -30,
            labelOffset: 8,
            formatXLabel: (value) => getDateLabelByIndex(Number(value)),
          }}
          axisOptions={{
            font,
            labelColor: {
              x: md3Colors.dark.onSurfaceVariant,
              y: md3Colors.dark.onSurfaceVariant,
            },
            lineColor: {
              grid: {
                x: md3Colors.dark.outlineVariant,
                y: md3Colors.dark.outlineVariant,
              },
              frame: md3Colors.dark.outline,
            },
            lineWidth: {
              grid: {
                x: StyleSheet.hairlineWidth,
                y: StyleSheet.hairlineWidth,
              },
              frame: 1,
            },
            tickCount: { x: 0, y: yTickValues.length },
            tickValues: { x: xTickValues, y: yTickValues },
          }}
          frame={{
            lineColor: "transparent",
          }}
        >
          {({ points, chartBounds }) => (
            <>
              <Area
                points={points.value}
                y0={chartBounds.bottom}
                color={md3Colors.dark.primaryContainer + "33"}
              />
              <Line
                points={points.value}
                color={md3Colors.dark.primaryContainer}
                strokeWidth={3}
              />
              <Scatter
                points={points.value}
                shape="circle"
                radius={4}
                style="fill"
                color={md3Colors.dark.primary}
              />
            </>
          )}
        </CartesianChart>
      </View>

      <View style={styles.latestEntry}>
        <Text style={styles.latestEntryLabel}>Последнее изменение</Text>
        <Text style={styles.latestEntryValue}>{latestItem.value} кг</Text>
        <Text style={styles.latestEntryDate}>
          {formatHistoryDate(latestItem.timestamp)}
        </Text>
      </View>
    </View>
  )
}

const StatsHistoryModal = () => {
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
      setWorkStatsHistory(null)
      setMaxStatsHistory(null)
      setIsLoading(false)
      return
    }

    let isActive = true

    const getData = async () => {
      setIsLoading(true)

      const statsHistory = await getExerciseStatsHistory(exercise.id)

      if (!isActive) return

      setWorkStatsHistory(statsHistory.filter((item) => item.type === "work"))
      setMaxStatsHistory(statsHistory.filter((item) => item.type === "max"))
      setIsLoading(false)
    }

    getData()

    return () => {
      isActive = false
    }
  }, [exercise])

  if (exercise === null) return null

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      overScrollMode="never"
      scrollEventThrottle={16}
    >
      <Text style={styles.title}>История изменений</Text>
      <Text style={styles.description}>
        Для упражнения {`"${exercise.name}"`}
      </Text>

      <ProgressChart
        title="Рабочий вес"
        history={workStatsHistory}
        isLoading={isLoading}
      />
      <ProgressChart
        title="Максимальный вес"
        history={maxStatsHistory}
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
    paddingBlock: 24,
    paddingInline: 4,
    gap: 4,
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
    marginBottom: 16,
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
