import { ActivityIndicator, StyleSheet, View } from "react-native"

import { md3Colors } from "@/constants/colors"

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
    </View>
  )
}

export default LoadingScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: md3Colors.dark.background,
  },
})
