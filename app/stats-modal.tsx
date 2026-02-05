import { useEffect, useState } from "react"
import { StyleSheet, Text, View, TextInput, Keyboard } from "react-native"
import { useRouter } from "expo-router"
import { useSQLiteContext } from "expo-sqlite"
import { drizzle } from "drizzle-orm/expo-sqlite"
import { eq } from "drizzle-orm"

import { useSelectedExercise } from "@/store/useSelectedExercise"

import { statsHistoryTable, statsTable } from "@/db/schema"

import Button from "@/components/Button"

import { logger } from "@/utils/logger"

const StatsModal = () => {
  const expoDb = useSQLiteContext()
  const db = drizzle(expoDb)

  const router = useRouter()

  const exercise = useSelectedExercise((state) => state.exercise)

  const [isLocked, setIsLocked] = useState(false)
  const [initialWorkWeight, setInitialWorkWeight] = useState("")
  const [initialMaxWeight, setInitialMaxWeight] = useState("")
  const [workWeight, setWorkWeight] = useState("")
  const [maxWeight, setMaxWeight] = useState("")

  useEffect(() => {
    if (exercise === null) return

    const getData = async () => {
      const [stats] = await db
        .select()
        .from(statsTable)
        .where(eq(statsTable.exercise_id, exercise.id))

      if (stats) {
        if (stats.work_weight) {
          setWorkWeight(stats.work_weight.toString().replace(".", ","))
          setInitialWorkWeight(stats.work_weight.toString().replace(".", ","))
        }
        if (stats.max_weight) {
          setMaxWeight(stats.max_weight.toString().replace(".", ","))
          setInitialMaxWeight(stats.max_weight.toString().replace(".", ","))
        }
      }

      console.log("result: ", stats)
    }

    getData()
  }, [exercise])

  if (exercise === null) return null

  const onSaveClick = async () => {
    if (isLocked) return

    setIsLocked(true)

    const workWeightValue = workWeight
      ? parseFloat(workWeight.replace(",", "."))
      : null
    const maxWeightValue = maxWeight
      ? parseFloat(maxWeight.replace(",", "."))
      : null

    try {
      const [stats] = await db
        .select()
        .from(statsTable)
        .where(eq(statsTable.exercise_id, exercise.id))

      // Inserting or updating stats
      if (!stats) {
        await db.insert(statsTable).values({
          exercise_id: exercise.id,
          work_weight: workWeightValue,
          max_weight: maxWeightValue,
        })
        console.log("inserted")
      } else {
        await db
          .update(statsTable)
          .set({
            work_weight: workWeightValue,
            max_weight: maxWeightValue,
          })
          .where(eq(statsTable.exercise_id, exercise.id))
        console.log("updated")
      }

      // Inserting stats update history
      const currentDate = new Date().getTime()
      if (workWeight && initialWorkWeight !== workWeight) {
        await db.insert(statsHistoryTable).values({
          exercise_id: exercise.id,
          type: "work",
          value: parseFloat(workWeight.replace(",", ".")),
          changed_at: currentDate,
        })
        console.log("workWeight stats update inserted")
        setInitialWorkWeight(workWeight)
      }
      if (maxWeight && initialMaxWeight !== maxWeight) {
        await db.insert(statsHistoryTable).values({
          exercise_id: exercise.id,
          type: "max",
          value: parseFloat(maxWeight.replace(",", ".")),
          changed_at: currentDate,
        })
        console.log("maxWeight stats update inserted")
        setInitialMaxWeight(maxWeight)
      }
    } catch (error) {
      logger("Error happened while saving stats: ", error)
    } finally {
      setIsLocked(false)
      Keyboard.dismiss()
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {exercise.name}: {exercise.id}
      </Text>
      <Text style={styles.description}>👇 Прогресс? Запиши 👇</Text>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.label}>Рабочий</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            keyboardType="numeric"
            value={workWeight}
            onChangeText={(text) => setWorkWeight(text)}
          />
        </View>
        <View style={styles.stat}>
          <Text style={styles.label}>Максимальный</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            keyboardType="numeric"
            value={maxWeight}
            onChangeText={(text) => setMaxWeight(text)}
          />
        </View>
      </View>
      <Button
        label="История изменений"
        style={{ marginTop: 40 }}
        onPress={() => router.navigate("/stats-history-modal")}
      />
      <Button
        label="Сохранить"
        isLoading={isLocked}
        style={{ marginTop: 8 }}
        onPress={onSaveClick}
      />
    </View>
  )
}

export default StatsModal

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingInline: 16,
    paddingBlock: 24,
    // height: 440,
  },
  title: {
    fontSize: 24,
    fontWeight: "500",
    marginBottom: 64,
  },
  description: {
    fontSize: 18,
    color: "rgba(0,0,0,0.6)",
    marginBottom: 32,
  },
  stats: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  label: {
    fontSize: 18,
  },
  input: {
    height: 64,
    width: 100,
    fontSize: 36,
    textAlign: "center",
  },
})
