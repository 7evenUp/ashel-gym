import { useEffect, useState } from "react"
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Keyboard,
  Pressable,
  Platform,
} from "react-native"
import { useRouter } from "expo-router"
import { eq } from "drizzle-orm"
import { HistoryIcon } from "lucide-react-native"

import { useSelectedExercise } from "@/store/useSelectedExercise"

import { statsHistoryTable, statsTable } from "@/db/schema"

import Button from "@/components/Button"

import { md3Colors } from "@/constants/colors"

import useDb from "@/hooks/useDb"
import { useKeyboardHeight } from "@/hooks/useKeyboardHeight"

import { logger } from "@/utils/logger"

const StatsModal = () => {
  const db = useDb()

  const router = useRouter()

  const exercise = useSelectedExercise((state) => state.exercise)

  const { isKeyboardVisible, keyboardHeight } = useKeyboardHeight()

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
    }

    getData()
  }, [exercise, db])

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
      } else {
        await db
          .update(statsTable)
          .set({
            work_weight: workWeightValue,
            max_weight: maxWeightValue,
          })
          .where(eq(statsTable.exercise_id, exercise.id))
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
        setInitialWorkWeight(workWeight)
      }
      if (maxWeight && initialMaxWeight !== maxWeight) {
        await db.insert(statsHistoryTable).values({
          exercise_id: exercise.id,
          type: "max",
          value: parseFloat(maxWeight.replace(",", ".")),
          changed_at: currentDate,
        })
        setInitialMaxWeight(maxWeight)
      }

      router.back()
    } catch (error) {
      logger("Error happened while saving stats: ", error)
    } finally {
      setIsLocked(false)
      Keyboard.dismiss()
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {exercise.name}: {exercise.id}
        </Text>
        <Pressable
          style={styles.history}
          onPress={() => router.navigate("/stats-history-modal")}
        >
          <HistoryIcon size={24} color={md3Colors.dark.onSurface} />
        </Pressable>
      </View>
      <Text style={styles.description}>👇 Прогресс? Запиши 👇</Text>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.label}>Рабочий</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor={md3Colors.dark.onSurfaceVariant}
            keyboardType="numeric"
            keyboardAppearance="dark"
            value={workWeight}
            onChangeText={(text) => setWorkWeight(text)}
          />
        </View>
        <View style={styles.stat}>
          <Text style={styles.label}>Максимальный</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor={md3Colors.dark.onSurfaceVariant}
            keyboardType="numeric"
            value={maxWeight}
            onChangeText={(text) => setMaxWeight(text)}
          />
        </View>
      </View>
      <Button
        label="Сохранить"
        isLoading={isLocked}
        onPress={onSaveClick}
        style={[
          { marginTop: "auto" },
          isKeyboardVisible && { marginBottom: keyboardHeight },
        ]}
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
    paddingTop: 24,
    paddingBottom: Platform.OS === "ios" ? 0 : 24,
  },
  header: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 64,
  },
  title: {
    fontSize: 24,
    fontWeight: "500",
    width: "80%",
    textAlign: "center",
    color: md3Colors.dark.onSurface,
  },
  history: {
    position: "absolute",
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: md3Colors.dark.surfaceContainerHighest,
    borderRadius: 12,
    right: 0,
  },
  description: {
    fontSize: 18,
    color: md3Colors.dark.onSurfaceVariant,
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
    color: md3Colors.dark.onSurface,
  },
  input: {
    height: 64,
    width: 100,
    fontSize: 36,
    textAlign: "center",
    color: md3Colors.dark.onSurface,
  },
})
