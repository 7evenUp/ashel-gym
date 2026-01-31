import { Link } from "expo-router"
import { Text, View, StyleSheet } from "react-native"

export default function TrainingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Training</Text>
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
    backgroundColor: "#25292e",
    paddingInline: 16
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
