import { useEffect, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { desc, eq } from "drizzle-orm"

import { useSelectedExercise } from "@/store/useSelectedExercise"

import { StatsHistory, statsHistoryTable } from "@/db/schema"

import useDb from "@/hooks/useDb"

import { logger } from "@/utils/logger"

const StatsHistoryModal = () => {
  const db = useDb()

  const exercise = useSelectedExercise((state) => state.exercise)

  const [workStatsHistory, setWorkStatsHistory] = useState<
    StatsHistory[] | null
  >(null)
  const [maxStatsHistory, setMaxStatsHistory] = useState<StatsHistory[] | null>(
    null,
  )

  useEffect(() => {
    if (exercise === null) return

    const getData = async () => {
      const statsHistory = await db
        .select()
        .from(statsHistoryTable)
        .where(eq(statsHistoryTable.exercise_id, exercise.id))
        .orderBy(desc(statsHistoryTable.changed_at))

      setWorkStatsHistory(statsHistory.filter((el) => el.type === "work"))
      setMaxStatsHistory(statsHistory.filter((el) => el.type === "max"))

      logger("statsHistory: ", statsHistory)
    }

    getData()
  }, [exercise])

  if (exercise === null) return null

  return (
    <View style={styles.container}>
      <Text style={styles.title}>История изменений</Text>
      <Text style={styles.description}>
        Для упражнения &quot;{exercise.name}&quot;
      </Text>
      <View style={{ flex: 1, flexDirection: "row" }}>
        <View style={{ width: "50%", alignItems: "center" }}>
          <Text style={styles.group_title}>Рабочий</Text>
          {workStatsHistory && workStatsHistory.length > 0 && (
            <View style={styles.group}>
              {workStatsHistory.map((item) => (
                <View style={styles.item} key={item.id}>
                  <Text style={styles.item_value}>{item.value}</Text>
                  <Text style={styles.item_date}>
                    {new Date(item.changed_at).toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <View
          style={{
            width: "50%",
            alignItems: "center",
          }}
        >
          <Text style={styles.group_title}>Максимальный</Text>
          {maxStatsHistory && maxStatsHistory.length > 0 && (
            <View style={styles.group}>
              {maxStatsHistory.map((item) => (
                <View style={styles.item} key={item.id}>
                  <Text style={styles.item_value}>{item.value}</Text>
                  <Text style={styles.item_date}>
                    {new Date(item.changed_at).toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

export default StatsHistoryModal

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingInline: 16,
    paddingBlock: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "500",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "rgba(0,0,0,0.6)",
    marginBottom: 32,
  },
  group_title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  group: {
    gap: 12,
    width: "100%",
  },
  item: {
    width: "100%",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    paddingVertical: 4,
  },
  item_value: {
    fontSize: 24,
    fontWeight: "700",
  },
  item_date: {
    fontSize: 12,
    color: "rgba(0,0,0,0.5)",
  },
})
