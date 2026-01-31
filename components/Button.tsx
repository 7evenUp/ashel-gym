import { ComponentProps } from "react"
import { StyleSheet, Pressable, Text } from "react-native"

export default function Button({
  label,
  icon,
  ...props
}: {
  label: string
  icon?: React.ReactNode
} & ComponentProps<typeof Pressable>) {
  return (
    <Pressable style={styles.pressable} {...props}>
      {icon && icon}
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  pressable: {
    width: "100%",
    height: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#56395B",
  },
  label: {
    color: "#fff",
    fontSize: 20,
  },
})
