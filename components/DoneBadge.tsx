import { StyleSheet, View } from "react-native"
import { CheckIcon } from "lucide-react-native"

import { md3Colors } from "@/constants/colors"

const DoneBadge = () => {
  return (
    <View style={styles.doneBadge}>
      <CheckIcon size={16} color={md3Colors.dark.onPrimaryContainer} />
    </View>
  )
}

export default DoneBadge

const styles = StyleSheet.create({
  doneBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
    backgroundColor: md3Colors.dark.primaryContainer,
    borderWidth: 1,
    borderColor: md3Colors.dark.primary,
    padding: 6,
    borderRadius: 9999,
  },
})
