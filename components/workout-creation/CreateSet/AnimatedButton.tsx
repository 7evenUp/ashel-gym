import { Pressable, PressableProps } from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolateColor,
  withSpring,
} from "react-native-reanimated"

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
  const fromColor = colors?.from || "#3498db" // Default Blue
  const toColor = colors?.to || "#2980b9" // Default Darker Blue

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
