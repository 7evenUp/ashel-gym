import { useState } from "react"
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native"
import { MinusIcon, PlusIcon } from "lucide-react-native"
import { useSQLiteContext } from "expo-sqlite"
import { Image } from "expo-image"
import { drizzle } from "drizzle-orm/expo-sqlite"

import AnimatedColorButton from "./AnimatedButton"

import { useWorkoutCreation } from "@/store/useWorkoutCreation"

import { exerciseSetTable } from "@/db/schema"

import { exerciseImages } from "@/constants/exerciseImages"

const CreateSet = () => {
  const expoDb = useSQLiteContext()
  const db = drizzle(expoDb)

  const [reps, setReps] = useState(0)

  const { selectedExercise, selectedMuscleGroup, createdWorkoutId } =
    useWorkoutCreation()

  if (selectedExercise === null) return
  if (selectedMuscleGroup === null) return

  const onCreateSetClick = async () => {
    if (createdWorkoutId === null) return

    await db.insert(exerciseSetTable).values({
      exercise_id: selectedExercise.id,
      order: 0,
      reps: 8,
      weight: 12,
      workout_id: createdWorkoutId,
    })
  }

  return (
    <>
      <Text style={styles.title}>{selectedExercise.name}</Text>
      <View style={styles.set_item}>
        <View style={styles.reps}>
          <Image
            style={styles.image}
            source={
              exerciseImages[selectedMuscleGroup.name][selectedExercise.image]
            }
          />
          <View style={styles.right}>
            <View style={styles.right_item}>
              <Text style={styles.right_title}>Повторения</Text>
              <View style={styles.counter_wrapper}>
                <AnimatedColorButton
                  style={[
                    styles.counter_pressable,
                    reps === 0 && { opacity: 0.5 },
                  ]}
                  colors={{ from: "#333333", to: "#4d4d4d" }}
                  onPress={() =>
                    setReps((prev) => (prev === 0 ? -0 : prev - 1))
                  }
                  disabled={reps === 0}
                >
                  <MinusIcon size={20} color="white" />
                </AnimatedColorButton>
                <Text style={styles.counter_value}>{reps}</Text>
                <AnimatedColorButton
                  style={styles.counter_pressable}
                  colors={{ from: "#333333", to: "#4d4d4d" }}
                  onPress={() => setReps((prev) => prev + 1)}
                >
                  <PlusIcon size={20} color="white" />
                </AnimatedColorButton>
              </View>
            </View>
            <View style={styles.right_item}>
              <Text style={styles.right_title}>Вес</Text>
              <TextInput
                style={styles.right_input}
                placeholder="Введите вес"
                placeholderTextColor="gray"
                keyboardType="numeric"
                keyboardAppearance="dark"
                returnKeyType="done"
              />
            </View>
          </View>
        </View>
      </View>
      <Pressable
        style={{
          flexDirection: "row",
          gap: 4,
          alignItems: "center",
          marginTop: 20,
          borderWidth: 1,
          borderColor: "hsl(0, 0%, 50%)",
          height: 40,
          paddingInline: 20,
          borderRadius: 9999,
        }}
      >
        <PlusIcon color="hsl(0, 0%, 75%)" />
        <Text style={{ color: "hsl(0, 0%, 75%)" }}>Добавить ещё</Text>
      </Pressable>
    </>
  )
}

export default CreateSet

const styles = StyleSheet.create({
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: 600,
    marginVertical: 12,
  },
  set_item: {
    backgroundColor: "hsl(0, 0%, 10%)",
    padding: 16,
    width: "100%",
    height: 140,
    borderRadius: 12,
  },
  reps: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },
  image: {
    width: 110,
    minHeight: 110,
    borderRadius: 8,
  },
  right: {
    alignItems: "center",
    gap: 8,
  },
  right_item: {
    alignItems: "center",
    gap: 4,
  },
  right_title: {
    color: "hsl(0, 0%, 75%)",
    fontSize: 13,
  },
  right_input: {
    textAlign: "center",
    color: "white",
    backgroundColor: "hsl(0, 0%, 20%)",
    borderRadius: 10,
    height: 32,
    minWidth: 110,
  },
  counter_wrapper: {
    backgroundColor: "hsl(0, 0%, 20%)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    borderRadius: 10,
    height: 32,
    minWidth: 110,
  },
  counter_pressable: {
    paddingInline: 8,
    height: "100%",
    justifyContent: "center",
    borderRadius: 10,
  },
  counter_value: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
})
