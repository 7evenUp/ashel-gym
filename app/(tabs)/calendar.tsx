import { Link } from "expo-router"
import { StyleSheet, Text, View } from "react-native"

import useWorkoutMuscleGroups from "@/hooks/useWorkoutMuscleGroups"

export default function CalendarScreen() {
  const { workoutMuscleGroups } = useWorkoutMuscleGroups()

  console.log(workoutMuscleGroups)
  console.log("rerender")

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Calendar</Text>
      <View style={{ gap: 4, marginVertical: 20 }}>
        {workoutMuscleGroups &&
          workoutMuscleGroups.map((el) => (
            <Text
              key={el.id}
              style={{
                padding: 6,
                borderRadius: 4,
                backgroundColor: "hsl(0, 0%, 20%)",
                color: "white",
              }}
            >
              id: {el.id}, muscle: {el.muscle_group_id}, workout:{" "}
              {el.workout_id}
            </Text>
          ))}
      </View>
      <Link href="/(tabs)/profile" style={styles.button}>
        Go to profile screen
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#211e27",
  },
  text: {
    color: "#9e9e9e",
    fontSize: 24,
  },
  button: {
    fontSize: 20,
    textDecorationLine: "underline",
    color: "#fff",
  },
})
