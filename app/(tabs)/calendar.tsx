import { useMemo, useState } from "react"
import { StyleSheet, View } from "react-native"

import CalendarDayDetailsModal from "@/components/calendar/CalendarDayDetailsModal"
import CalendarMonthView from "@/components/calendar/CalendarMonthView"
import useCalendarData from "@/components/calendar/useCalendarData"
import { toDayKey } from "@/components/calendar/utils"

import { md3Colors } from "@/constants/colors"

export default function CalendarScreen() {
  const { daySummaries, isLoading } = useCalendarData()

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const selectedSummary = useMemo(() => {
    if (selectedDate === null) return null
    return daySummaries.get(toDayKey(selectedDate)) ?? null
  }, [daySummaries, selectedDate])

  return (
    <View style={styles.container}>
      <CalendarMonthView
        daySummaries={daySummaries}
        isLoading={isLoading}
        selectedDate={selectedDate}
        onSelectDate={(date) => setSelectedDate(date)}
      />

      <CalendarDayDetailsModal
        selectedDate={selectedDate}
        selectedSummary={selectedSummary}
        onClose={() => setSelectedDate(null)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: md3Colors.dark.background,
    paddingHorizontal: 16,
    paddingTop: 28,
  },
})
