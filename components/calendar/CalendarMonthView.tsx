import { useMemo, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { ChevronLeft, ChevronRight } from "lucide-react-native"

import { md3Colors } from "@/constants/colors"

import { DaySummary } from "./types"

import {
  getMonthGrid,
  getMonthLabel,
  toDayKey,
  WEEK_DAY_LABELS,
  shiftMonth,
} from "./utils"

const CalendarMonthView = ({
  daySummaries,
  isLoading,
  selectedDate,
  onSelectDate,
}: {
  daySummaries: Map<string, DaySummary>
  isLoading: boolean
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
}) => {
  const [viewDate, setViewDate] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })

  const monthGrid = useMemo(() => getMonthGrid(viewDate), [viewDate])

  const onPreviousMonth = () => {
    setViewDate((current) => shiftMonth(current, -1))
  }

  const onNextMonth = () => {
    setViewDate((current) => shiftMonth(current, 1))
  }

  return (
    <>
      <View style={styles.header}>
        <Pressable onPress={onPreviousMonth} style={styles.iconButton}>
          <ChevronLeft color={md3Colors.dark.onSurface} size={24} />
        </Pressable>

        <Text style={styles.monthLabel}>{getMonthLabel(viewDate)}</Text>

        <Pressable onPress={onNextMonth} style={styles.iconButton}>
          <ChevronRight color={md3Colors.dark.onSurface} size={24} />
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
              onPress={() => onSelectDate(new Date(day))}
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
    </>
  )
}

export default CalendarMonthView

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: md3Colors.dark.surfaceContainerHighest,
  },
  monthLabel: {
    color: md3Colors.dark.onSurface,
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
    color: md3Colors.dark.onSurfaceVariant,
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
    borderColor: md3Colors.dark.outline,
    backgroundColor: md3Colors.dark.surfaceVariant,
  },
  dayBadgeSelected: {
    backgroundColor: md3Colors.dark.primary,
    borderColor: md3Colors.dark.primary,
  },
  dayText: {
    color: md3Colors.dark.onSurface,
    fontSize: 16,
    fontWeight: "600",
  },
  dayTextOutsideMonth: {
    color: md3Colors.dark.onSurfaceVariant,
  },
  dayTextSelected: {
    color: md3Colors.dark.onPrimary,
  },
  helperText: {
    marginTop: 16,
    color: md3Colors.dark.onSurfaceVariant,
    fontSize: 13,
    textAlign: "center",
  },
})
