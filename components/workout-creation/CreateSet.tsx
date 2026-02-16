import { StyleSheet, Text, TextInput, View } from "react-native"
import { MinusIcon, PlusIcon } from "lucide-react-native"
import { useSQLiteContext } from "expo-sqlite"
import { drizzle } from "drizzle-orm/expo-sqlite"

import { useWorkoutCreation } from "@/store/useWorkoutCreation"

import { exerciseSetTable } from "@/db/schema"

const CreateSet = () => {
  const expoDb = useSQLiteContext()
  const db = drizzle(expoDb)

  const { selectedExercise, createdWorkoutId } = useWorkoutCreation()

  const onCreateSetClick = async () => {
    if (selectedExercise === null) return
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
    <View
      style={{
        backgroundColor: "purple",
        width: "100%",
        padding: 6,
        height: 100,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          flex: 1,
        }}
      >
        <Text style={{ color: "white" }}>Reps</Text>
        <View
          style={{
            flexDirection: "row",
            gap: 12,
            alignItems: "center",
          }}
        >
          <MinusIcon size={20} color="white" />
          <Text style={{ color: "white", fontWeight: "600", fontSize: 24 }}>
            0
          </Text>
          <PlusIcon size={20} color="white" />
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <Text style={{ color: "white" }}>Weight</Text>
        <TextInput
          style={{
            flex: 1,
            color: "black",
            backgroundColor: "white",
            padding: 4,
          }}
          placeholder="0"
          placeholderTextColor="gray"
          keyboardType="numeric"
        />
      </View>
    </View>
  )
}

export default CreateSet

const styles = StyleSheet.create({})
