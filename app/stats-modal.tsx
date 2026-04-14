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
import { HistoryIcon } from "lucide-react-native"

import { useSelectedExercise } from "@/store/useSelectedExercise"
import { getExerciseStats, saveExerciseStats } from "@/db/repositories/stats"

import Button from "@/components/Button"

import { md3Colors } from "@/constants/colors"

import { useKeyboardHeight } from "@/hooks/useKeyboardHeight"

import { logger } from "@/utils/logger"

const formatWeightInput = (value: number) => value.toString().replace(".", ",")

const parseWeightInput = (value: string) => {
  if (value === "") return null

  const parsedValue = parseFloat(value.replace(",", "."))

  return Number.isFinite(parsedValue) ? parsedValue : null
}

const StatsModal = () => {
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

    let isActive = true

    const getData = async () => {
      const stats = await getExerciseStats(exercise.id)

      if (!isActive) return

      const nextWorkWeight =
        stats?.work_weight !== null && stats?.work_weight !== undefined
          ? formatWeightInput(stats.work_weight)
          : ""
      const nextMaxWeight =
        stats?.max_weight !== null && stats?.max_weight !== undefined
          ? formatWeightInput(stats.max_weight)
          : ""

      setWorkWeight(nextWorkWeight)
      setInitialWorkWeight(nextWorkWeight)
      setMaxWeight(nextMaxWeight)
      setInitialMaxWeight(nextMaxWeight)
    }

    getData()

    return () => {
      isActive = false
    }
  }, [exercise])

  if (exercise === null) return null

  const onSaveClick = async () => {
    if (isLocked) return

    setIsLocked(true)

    const workWeightValue = parseWeightInput(workWeight)
    const maxWeightValue = parseWeightInput(maxWeight)

    try {
      const { maxWeightChanged, workWeightChanged } = await saveExerciseStats({
        exerciseId: exercise.id,
        initialMaxWeight: parseWeightInput(initialMaxWeight),
        initialWorkWeight: parseWeightInput(initialWorkWeight),
        maxWeight: maxWeightValue,
        workWeight: workWeightValue,
      })

      if (workWeightChanged) {
        setInitialWorkWeight(workWeight)
      }

      if (maxWeightChanged) {
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
