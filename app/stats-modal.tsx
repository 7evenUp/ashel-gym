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
import {
  ChartNoAxesColumnIncreasingIcon,
  CrownIcon,
  HistoryIcon,
} from "lucide-react-native"

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
        <Text style={styles.title}>{exercise.name}</Text>
        <Pressable
          style={styles.history}
          onPress={() => router.navigate("/stats-history-modal")}
        >
          <HistoryIcon size={24} color={md3Colors.dark.onSurface} />
        </Pressable>
      </View>

      <View style={styles.stat}>
        <View style={styles.icon_wrapper}>
          <ChartNoAxesColumnIncreasingIcon
            width={36}
            height={36}
            color={md3Colors.dark.onSecondaryContainer}
            strokeWidth={4}
          />
        </View>
        <View style={styles.stat_right}>
          <View style={styles.input_wrapper}>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={md3Colors.dark.onSurfaceVariant}
              keyboardType="numeric"
              keyboardAppearance="dark"
              value={workWeight}
              onChangeText={(text) => setWorkWeight(text)}
            />
            <Text style={styles.input_kg}>kg</Text>
          </View>
          <Text style={styles.input_description}>Work weight</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.stat}>
        <View style={styles.icon_wrapper}>
          <CrownIcon
            width={36}
            height={36}
            color={md3Colors.dark.onSecondaryContainer}
            fill={md3Colors.dark.onSecondaryContainer}
            strokeWidth={2}
          />
        </View>
        <View style={styles.stat_right}>
          <View style={styles.input_wrapper}>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={md3Colors.dark.onSurfaceVariant}
              keyboardType="numeric"
              value={maxWeight}
              onChangeText={(text) => setMaxWeight(text)}
            />
            <Text style={styles.input_kg}>kg</Text>
          </View>
          <Text style={styles.input_description}>Max weight</Text>
        </View>
      </View>

      <Button
        label="Save"
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
    marginBottom: 32,
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
  stat: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: md3Colors.dark.outlineVariant,
    marginBlock: 20,
  },
  icon_wrapper: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: md3Colors.dark.secondaryContainer,
  },
  stat_right: {
    gap: 4,
  },
  input_wrapper: {
    position: "relative",
  },
  input: {
    fontSize: 26,
    fontWeight: 600,
    color: md3Colors.dark.primary,
    backgroundColor: md3Colors.dark.surfaceContainer,
    padding: 4,
    paddingLeft: 16,
    paddingRight: 48,
    height: 40,
    minWidth: 80,
    width: "auto",
    borderRadius: 12,
  },
  input_kg: {
    color: md3Colors.dark.onSurfaceVariant,
    fontSize: 18,
    position: "absolute",
    right: 16,
    top: 10,
  },
  input_description: {
    color: md3Colors.dark.onSurfaceVariant,
  },
})
