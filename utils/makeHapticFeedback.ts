import * as Haptics from "expo-haptics"

export const makeHapticFeedback = () =>
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
