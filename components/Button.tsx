import { ComponentProps, useEffect } from "react"
import {
  StyleSheet,
  Pressable,
  Text,
  PressableStateCallbackType,
} from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from "react-native-reanimated"
import * as Haptics from "expo-haptics"

import { Loader } from "lucide-react-native"

export default function Button({
  label,
  icon,
  style,
  isLoading,
  onPress,
  ...props
}: {
  label: string
  icon?: React.ReactNode
  isLoading?: boolean
} & ComponentProps<typeof Pressable>) {
  const rotation = useSharedValue(0)

  useEffect(() => {
    rotation.value = isLoading
      ? withRepeat(
          withTiming(360, {
            duration: 800,
            easing: Easing.linear,
          }),
          -2,
          false,
        )
      : 0
  }, [isLoading])

  const animatedRotationStyles = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }))

  return (
    <Pressable
      style={(state: PressableStateCallbackType) => [
        styles.pressable,
        state.pressed && styles.pressable_pressed,
        typeof style === "function" ? style(state) : style,
      ]}
      onPress={(event) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
        if (onPress) onPress(event)
      }}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <Animated.View style={animatedRotationStyles}>
          <Loader size={24} color="white" />
        </Animated.View>
      ) : (
        <>
          {icon && icon}
          <Text style={styles.label}>{label}</Text>
        </>
      )}
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
  pressable_pressed: {
    backgroundColor: "#452E49",
    transform: [{ scale: 0.98 }],
  },
  label: {
    color: "#fff",
    fontSize: 20,
  },
})
