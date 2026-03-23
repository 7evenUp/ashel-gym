import { ComponentProps, useEffect } from "react"
import { StyleSheet, Pressable, Text } from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from "react-native-reanimated"
import { Loader, LucideIcon } from "lucide-react-native"

import { md3Colors } from "@/constants/colors"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

export default function Button({
  label,
  Icon,
  style,
  isLoading,
  onPress,
  variant = "default",
  ...props
}: {
  label: string
  Icon?: LucideIcon
  isLoading?: boolean
  variant?: "default" | "error"
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

  const animatedRotationStyles = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }))

  return (
    <Pressable
      style={(state) => [
        styles.pressable,
        variant === "error" && styles.pressable__error,
        state.pressed && styles.pressable_pressed,
        state.pressed && variant === "error" && styles.pressable_pressed__error,
        typeof style === "function" ? style(state) : style,
      ]}
      onPress={(event) => {
        makeHapticFeedback()
        if (onPress) onPress(event)
      }}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <Animated.View style={animatedRotationStyles}>
          <Loader
            size={24}
            color={
              variant === "error"
                ? md3Colors.dark.onError
                : md3Colors.dark.onPrimary
            }
          />
        </Animated.View>
      ) : (
        <>
          {Icon && (
            <Icon
              color={
                variant === "error"
                  ? md3Colors.dark.onError
                  : md3Colors.dark.onPrimary
              }
              size={20}
            />
          )}
          <Text
            style={[styles.label, variant === "error" && styles.label__error]}
          >
            {label}
          </Text>
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
    backgroundColor: md3Colors.dark.primary,
  },
  pressable_pressed: {
    backgroundColor: md3Colors.dark.onPrimaryContainer,
    transform: [{ scale: 0.98 }],
  },
  label: {
    color: md3Colors.dark.onPrimary,
    fontSize: 20,
  },
  pressable__error: {
    backgroundColor: md3Colors.dark.error,
  },
  pressable_pressed__error: {
    backgroundColor: md3Colors.light.errorContainer,
  },
  label__error: {
    color: md3Colors.dark.onError,
  },
})
