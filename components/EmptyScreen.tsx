import { Link } from "expo-router"
import { StyleSheet, Text, View } from "react-native"

import { md3Colors } from "@/constants/colors"

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
    backgroundColor: md3Colors.dark.background,
    padding: 16,
  },
  text: {
    color: md3Colors.dark.onSurfaceVariant,
    fontSize: 16,
    textAlign: "center",
  },
  button: {
    fontSize: 20,
    textDecorationLine: "underline",
    color: md3Colors.dark.primary,
  },
})
