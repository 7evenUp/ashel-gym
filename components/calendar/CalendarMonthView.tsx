import { useMemo, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { ChevronLeft, ChevronRight } from "lucide-react-native"

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
          <ChevronLeft color="white" size={24} />
        </Pressable>

        <Text style={styles.monthLabel}>{getMonthLabel(viewDate)}</Text>

        <Pressable onPress={onNextMonth} style={styles.iconButton}>
          <ChevronRight color="white" size={24} />
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
})
