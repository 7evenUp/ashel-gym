import { Link } from "expo-router"
import { StyleSheet, Text, View } from "react-native"

export default function CalendarScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Calendar</Text>
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
