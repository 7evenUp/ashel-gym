import { Link } from "expo-router"
import { Text, View, StyleSheet } from "react-native"

export default function EmptyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Не удалось найти необходимые данные</Text>
      <Link href="/(tabs)/profile" style={styles.button}>
        На главную
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
    padding: 16,
  },
  text: {
    color: "#9e9e9e",
    fontSize: 16,
    textAlign: "center",
  },
  button: {
    fontSize: 20,
    textDecorationLine: "underline",
    color: "#fff",
  },
})
