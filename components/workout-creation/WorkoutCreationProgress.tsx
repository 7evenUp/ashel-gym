import { Fragment } from "react"
import { StyleSheet, Text, View } from "react-native"

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

const WorkoutCreationProgress = ({
  currentStep,
}: WorkoutCreationProgressProps) => {
  if (currentStep === "idle") return null

  const currentStepIndex = creationSteps.indexOf(currentStep)

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        {creationSteps.map((step, index) => {
          const isActive = index <= currentStepIndex

          return (
            <Fragment key={step}>
              {index > 0 && (
                <View
                  style={[
                    styles.connector,
                    index <= currentStepIndex && styles.connectorActive,
                  ]}
                />
              )}

              <View
                style={[styles.stepCircle, isActive && styles.stepCircleActive]}
              >
                <Text
                  style={[styles.stepText, isActive && styles.stepTextActive]}
                >
                  {index + 1}
                </Text>
              </View>
            </Fragment>
          )
        })}
      </View>
    </View>
  )
}

export default WorkoutCreationProgress

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  track: {
    flexDirection: "row",
    alignItems: "center",
  },
  connector: {
    flex: 1,
    height: 3,
    borderRadius: 9999,
    backgroundColor: md3Colors.dark.outlineVariant,
  },
  connectorActive: {
    backgroundColor: md3Colors.dark.primary,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: md3Colors.dark.outlineVariant,
    backgroundColor: md3Colors.dark.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleActive: {
    borderColor: md3Colors.dark.primary,
    backgroundColor: md3Colors.dark.primary,
  },
  stepText: {
    color: md3Colors.dark.onSurfaceVariant,
    fontSize: 15,
    fontWeight: "700",
  },
  stepTextActive: {
    color: md3Colors.dark.onPrimary,
  },
})
