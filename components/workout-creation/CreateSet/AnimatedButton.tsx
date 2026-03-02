import { Pressable, PressableProps } from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolateColor,
  withSpring,
} from "react-native-reanimated"

import { md3Colors } from "@/constants/colors"

interface AnimatedColorButtonProps extends PressableProps {
  colors?: {
    from: string
    to: string
  }
  duration?: number
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const AnimatedColorButton = ({
  children,
  style,
  colors,
  duration = 200,
  onPressIn: externalOnPressIn,
  onPressOut: externalOnPressOut,
  ...rest
}: AnimatedColorButtonProps) => {
  const fromColor = colors?.from || md3Colors.dark.primaryContainer
  const toColor = colors?.to || md3Colors.dark.primary

  const pressed = useSharedValue(0)

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      pressed.value,
      [0, 1],
      [fromColor, toColor],
    )

    return {
      backgroundColor,
      transform: [{ scale: pressed.value * -0.1 + 1 }],
    }
  })

  const handlePressIn = (e: any) => {
    pressed.value = withSpring(1, { damping: 35, stiffness: 300 })
    externalOnPressIn?.(e)
  }

  const handlePressOut = (e: any) => {
    pressed.value = withSpring(0, { damping: 35, stiffness: 300 })
    externalOnPressOut?.(e)
  }

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  )
}

export default AnimatedColorButton
