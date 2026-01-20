import { Link } from "expo-router"
import { StyleSheet, Text, View } from "react-native"

const SessionsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Sessions screen</Text>
      <Link href="/(tabs)" style={styles.button}>
        Go to Home screen
      </Link>
    </View>
  )
}

export default SessionsScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#fff",
  },
  button: {
    fontSize: 20,
    textDecorationLine: "underline",
    color: "#fff",
  },
})
