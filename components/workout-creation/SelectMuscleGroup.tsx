import { Pressable, StyleSheet, Text, View } from "react-native"
import { Image } from "expo-image"
import * as Haptics from "expo-haptics"

import { MuscleGroup } from "@/db/schema"

import { muscleGroupImages } from "@/constants/muscleGroupImages"

import useMuscleGroups from "@/hooks/useMuscleGroups"

import { useWorkoutCreation } from "@/store/useWorkoutCreation"

const SelectMuscleGroup = () => {
  const muscleGroups = useMuscleGroups()

  const { setSelectedMuscleGroup, setCurrentStep } = useWorkoutCreation()

  const onMuscleGroupPress = (muscle: MuscleGroup) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
    setSelectedMuscleGroup(muscle)
    setCurrentStep("select-exercise")
  }

  return (
    <>
      <Text style={{ color: "white", marginTop: 20 }}>
        Что сегодня тренировал?
      </Text>
      {muscleGroups && (
        <View style={{ flexWrap: "wrap", flexDirection: "row" }}>
          {muscleGroups.map((muscle) => (
            <Pressable
              key={muscle.id}
              style={styles.imageContainer}
              onPress={() => onMuscleGroupPress(muscle)}
            >
              <Image
                style={styles.image}
                source={muscleGroupImages[muscle.name].img}
                placeholder={{
                  blurhash: muscleGroupImages[muscle.name].blurhash,
                }}
                transition={250}
              />
            </Pressable>
          ))}
        </View>
      )}
    </>
  )
}

export default SelectMuscleGroup

const styles = StyleSheet.create({
  imageContainer: {
    aspectRatio: 1 / 1,
    width: "33.33%",
    height: "100%",
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderBottomWidth: 6,
    borderColor: "#211e27",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
})
