import { ComponentProps } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { LucideIcon } from "lucide-react-native"

import { md3Colors } from "@/constants/colors"

type SplitButtonWithIconAndLabelProps = {
  label: string
  Icon: LucideIcon
}

const SplitButtons = ({
  children,
  style,
  ...props
}: ComponentProps<typeof View>) => {
  return (
    <View style={[styles.container, style]} {...props}>
      {children}
    </View>
  )
}

const LargeButton = ({
  label,
  Icon,
  style,
  ...props
}: ComponentProps<typeof Pressable> & SplitButtonWithIconAndLabelProps) => {
  return (
    <Pressable
      style={(state) => [
        styles.baseButton,
        state.pressed && styles.baseButtonPressed,
        styles.largeButton,
        typeof style === "function" ? style(state) : style,
      ]}
      {...props}
    >
      <Icon color={md3Colors.dark.onPrimary} size={20} />
      <Text style={styles.baseButtonLabel}>{label}</Text>
    </Pressable>
  )
}

const LeftButton = ({
  label,
  Icon,
  style,
  ...props
}: ComponentProps<typeof Pressable> & SplitButtonWithIconAndLabelProps) => {
  return (
    <Pressable
      style={(state) => [
        styles.baseButton,
        state.pressed && styles.baseButtonPressed,
        styles.leftButton,
        typeof style === "function" ? style(state) : style,
      ]}
      {...props}
    >
      <Icon color={md3Colors.dark.onPrimary} size={20} />
      <Text style={styles.baseButtonLabel}>{label}</Text>
    </Pressable>
  )
}

const RightButton = ({
  Icon,
  style,
  ...props
}: ComponentProps<typeof Pressable> &
  Pick<SplitButtonWithIconAndLabelProps, "Icon">) => {
  return (
    <Pressable
      style={(state) => [
        styles.baseButton,
        state.pressed && styles.baseButtonPressed,
        styles.rightButton,
        typeof style === "function" ? style(state) : style,
      ]}
      {...props}
    >
      <Icon color={md3Colors.dark.onPrimary} size={22} />
    </Pressable>
  )
}

SplitButtons.LargeButton = LargeButton
SplitButtons.LeftButton = LeftButton
SplitButtons.RightButton = RightButton

export default SplitButtons

const styles = StyleSheet.create({
  container: {
    height: 40,
    flexDirection: "row",
    gap: 2,
  },
  baseButton: {
    backgroundColor: md3Colors.dark.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    boxShadow:
      "0px 4px 8px 3px rgba(0,0,0,0.15), 0px 1px 3px 0px rgba(0,0,0,0.3)",
  },
  baseButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  baseButtonLabel: {
    color: md3Colors.dark.onPrimary,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  largeButton: {
    borderRadius: 20,
    paddingInline: 16,
  },
  leftButton: {
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    paddingLeft: 16,
    paddingRight: 12,
  },
  rightButton: {
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    paddingLeft: 12,
    paddingRight: 14,
  },
})
