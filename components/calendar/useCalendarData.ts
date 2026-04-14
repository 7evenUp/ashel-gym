import { useEffect, useState } from "react"
import { addDatabaseChangeListener } from "expo-sqlite"

import {
  CALENDAR_TRACKED_TABLES,
  getCalendarDaySummaries,
} from "@/db/services/calendar"

import { DaySummary } from "./types"

const useCalendarData = () => {
  const [daySummaries, setDaySummaries] = useState<Map<string, DaySummary>>(
    () => new Map(),
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isActive = true

    const loadCalendarData = async () => {
      const nextSummaries = await getCalendarDaySummaries()

      if (!isActive) return

      setDaySummaries(nextSummaries)
      setIsLoading(false)
    }

    loadCalendarData()

    const subscription = addDatabaseChangeListener((event) => {
      if (!CALENDAR_TRACKED_TABLES.includes(event.tableName as never)) return
      loadCalendarData()
    })

    return () => {
      isActive = false
      subscription.remove()
    }
  }, [])

  return { daySummaries, isLoading }
}

export default useCalendarData
