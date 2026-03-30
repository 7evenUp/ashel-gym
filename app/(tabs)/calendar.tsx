import { useMemo, useState } from "react"
import { ScrollView, StyleSheet, View } from "react-native"

import CalendarDayDetailsModal from "@/components/calendar/CalendarDayDetailsModal"
import CalendarMonthView from "@/components/calendar/CalendarMonthView"
import MonthStats from "@/components/calendar/MonthStats"
import useCalendarData from "@/components/calendar/useCalendarData"
import { toDayKey } from "@/components/calendar/utils"

import { md3Colors } from "@/constants/colors"

export default function CalendarScreen() {
  const { daySummaries, isLoading } = useCalendarData()

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewDate, setViewDate] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })

  const selectedSummary = useMemo(() => {
    if (selectedDate === null) return null
    return daySummaries.get(toDayKey(selectedDate)) ?? null
  }, [daySummaries, selectedDate])

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <CalendarMonthView
          daySummaries={daySummaries}
          viewDate={viewDate}
          selectedDate={selectedDate}
          onChangeViewDate={setViewDate}
          onSelectDate={(date) => setSelectedDate(date)}
        />

        <MonthStats
          daySummaries={daySummaries}
          isLoading={isLoading}
          viewDate={viewDate}
        />
      </ScrollView>

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
  },
  content: {
    paddingTop: 16,
  },
})
