import { Pressable, StyleSheet, View, Text } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { Exercise, MuscleGroup } from "@/db/schema"
import { Image } from "expo-image"
import { exerciseImages } from "@/constants/exerciseImages"

const ExercisesGrid = ({
  exercises,
  muscleGroup,
  onExercisePress,
}: {
  exercises: Exercise[]
  muscleGroup: MuscleGroup
  onExercisePress: (exercise: Exercise) => void
}) => {
  const renderFlashListItem = ({
    item,
    index,
  }: {
    item: Exercise
    index: number
  }) => {
    const marginLeft = index % 2 === 0 ? 0 : 6
    const marginRight = index % 2 === 0 ? 6 : 0

    return (
      <Pressable
        key={item.id}
        onPress={() => onExercisePress(item)}
        style={[styles.pressable, { marginLeft, marginRight }]}
      >
        <Image
          style={styles.image}
          source={exerciseImages[muscleGroup.name][item.image]}
          transition={250}
        />
        <Text style={styles.exercise_name}>{item.name}</Text>
      </Pressable>
    )
  }

  return (
    <FlashList
      data={exercises}
      style={{ width: "100%" }}
      contentContainerStyle={{
        padding: 16,
      }}
      numColumns={2}
      renderItem={renderFlashListItem}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
    />
  )
}

export default ExercisesGrid

const styles = StyleSheet.create({
  pressable: {
    alignItems: "center",
    paddingBottom: 8,
    gap: 8,
  },
  image: {
    aspectRatio: 1 / 1,
    width: "100%",
    borderRadius: 24,
  },
  exercise_name: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    paddingHorizontal: 8,
    textAlign: "center",
  },
})
