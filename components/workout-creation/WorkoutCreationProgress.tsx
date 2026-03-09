import { Fragment, useEffect, useState } from "react"
import { LayoutChangeEvent, StyleSheet, View } from "react-native"
import Animated, {
  Easing,
  Extrapolation,
  SharedValue,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"

import { md3Colors } from "@/constants/colors"

import { CurrentStep } from "@/store/useWorkoutCreation"

const creationSteps: Exclude<CurrentStep, "idle">[] = [
  "select-muscle-group",
  "select-exercise",
  "create-set",
]

type WorkoutCreationProgressProps = {
  currentStep: CurrentStep
}

type ProgressStepProps = {
  index: number
  animatedStep: SharedValue<number>
}

const ProgressStep = ({ index, animatedStep }: ProgressStepProps) => {
  const animatedCircleStyle = useAnimatedStyle(() => {
    const activation = interpolate(
      animatedStep.value,
      [index - 0.02, index],
      [0, 1],
      Extrapolation.CLAMP,
    )

    return {
      backgroundColor: interpolateColor(
        activation,
        [0, 1],
        [md3Colors.dark.surfaceContainerLow, md3Colors.dark.tertiary],
      ),
      borderColor: interpolateColor(
        activation,
        [0, 1],
        [md3Colors.dark.outlineVariant, md3Colors.dark.tertiary],
      ),
    }
  })

  const animatedTextStyle = useAnimatedStyle(() => {
    const activation = interpolate(
      animatedStep.value,
      [index - 0.02, index],
      [0, 1],
      Extrapolation.CLAMP,
    )

    return {
      color: interpolateColor(
        activation,
        [0, 1],
        [md3Colors.dark.onSurfaceVariant, md3Colors.dark.onTertiary],
      ),
    }
  })

  return (
    <Animated.View style={[styles.stepCircle, animatedCircleStyle]}>
      <Animated.Text style={[styles.stepText, animatedTextStyle]}>
        {index === 0 ? "Мышцы" : index === 1 ? "Упражнение" : "Подходы"}
      </Animated.Text>
    </Animated.View>
  )
}

type ProgressConnectorProps = {
  index: number
  animatedStep: SharedValue<number>
}

const ProgressConnector = ({ index, animatedStep }: ProgressConnectorProps) => {
  const [connectorWidth, setConnectorWidth] = useState(0)

  const onLayout = (event: LayoutChangeEvent) => {
    setConnectorWidth(event.nativeEvent.layout.width)
  }

  const animatedFillStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      animatedStep.value,
      [index - 1, index],
      [0, 1],
      Extrapolation.CLAMP,
    )

    return {
      width: connectorWidth * progress,
    }
  })

  return (
    <View style={styles.connector} onLayout={onLayout}>
      <Animated.View style={[styles.connectorFill, animatedFillStyle]} />
    </View>
  )
}

const WorkoutCreationProgress = ({
  currentStep,
}: WorkoutCreationProgressProps) => {
  const currentStepIndex = creationSteps.indexOf(
    currentStep === "idle" ? "select-muscle-group" : currentStep,
  )

  const animatedStep = useSharedValue(currentStepIndex)

  useEffect(() => {
    if (currentStep === "idle") return

    animatedStep.value = withTiming(currentStepIndex, {
      duration: 520,
      easing: Easing.out(Easing.cubic),
    })
  }, [animatedStep, currentStep, currentStepIndex])

  if (currentStep === "idle") return null

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        {creationSteps.map((step, index) => (
          <Fragment key={step}>
            {index > 0 && (
              <ProgressConnector index={index} animatedStep={animatedStep} />
            )}
            <ProgressStep index={index} animatedStep={animatedStep} />
          </Fragment>
        ))}
      </View>
    </View>
  )
}

export default WorkoutCreationProgress

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingBottom: 20,
  },
  track: {
    flexDirection: "row",
    alignItems: "center",
  },
  connector: {
    flex: 1,
    height: 3,
    backgroundColor: md3Colors.dark.outlineVariant,
    overflow: "hidden",
  },
  connectorFill: {
    height: "100%",
    backgroundColor: md3Colors.dark.tertiary,
  },
  stepCircle: {
    height: 36,
    paddingHorizontal: 8,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: md3Colors.dark.outlineVariant,
    backgroundColor: md3Colors.dark.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: {
    fontSize: 13,
    fontWeight: "700",
  },
})
