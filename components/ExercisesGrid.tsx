import {
  Pressable,
  StyleSheet,
  View,
  Text,
  StyleProp,
  ViewStyle,
} from "react-native"
import { FlashList } from "@shopify/flash-list"
import { Image } from "expo-image"

import DoneBadge from "./DoneBadge"

import { Exercise, MuscleGroup } from "@/db/schema"

import { md3Colors } from "@/constants/colors"
import { exerciseImages } from "@/constants/exerciseImages"

const ExercisesGrid = ({
  exercises,
  muscleGroup,
  onExercisePress,
  highlightedExerciseIds = [],
  containerStyle,
}: {
  exercises: Exercise[]
  muscleGroup: MuscleGroup
  onExercisePress: (exercise: Exercise) => void
  highlightedExerciseIds?: number[]
  containerStyle?: StyleProp<ViewStyle>
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

    const isHighlighted = highlightedExerciseIds.includes(item.id)

    return (
      <Pressable
        key={item.id}
        onPress={() => onExercisePress(item)}
        style={[
          styles.pressable,
          { marginLeft, marginRight },
          isHighlighted && styles.pressable_highlighted,
        ]}
      >
        {isHighlighted && <DoneBadge />}
        <Image
          style={[styles.image, isHighlighted && styles.image_highlighted]}
          source={exerciseImages[muscleGroup.name][item.image]}
          transition={250}
        />
        <Text
          style={[
            styles.exercise_name,
            isHighlighted && styles.exercise_name_highlighted,
          ]}
        >
          {item.name}
        </Text>
      </Pressable>
    )
  }

  return (
    <FlashList
      data={exercises}
      style={{ width: "100%" }}
      contentContainerStyle={containerStyle}
      numColumns={2}
      renderItem={renderFlashListItem}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      showsVerticalScrollIndicator={false}
    />
  )
}

export default ExercisesGrid

const styles = StyleSheet.create({
  pressable: {
    alignItems: "center",
    paddingBottom: 8,
    gap: 8,
    flex: 1,
  },
  pressable_highlighted: {
    backgroundColor: md3Colors.dark.surfaceContainerLow,
    borderRadius: 24,
  },
  image: {
    aspectRatio: 1 / 1,
    width: "100%",
    borderRadius: 24,
  },
  image_highlighted: {
    borderWidth: 1,
    borderColor: md3Colors.dark.primary,
  },
  exercise_name: {
    fontSize: 14,
    color: md3Colors.dark.onSurface,
    paddingHorizontal: 8,
    textAlign: "center",
  },
  exercise_name_highlighted: {
    color: md3Colors.dark.primary,
  },
})
