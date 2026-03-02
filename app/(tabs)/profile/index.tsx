import { Pressable, StyleSheet, View } from "react-native"
import { Image } from "expo-image"
import { Link, useRouter } from "expo-router"
import { FlashList } from "@shopify/flash-list"
import { Dumbbell } from "lucide-react-native"

import Button from "@/components/Button"

import { md3Colors } from "@/constants/colors"
import { muscleGroupImages } from "@/constants/muscleGroupImages"

import useMuscleGroups from "@/hooks/useMuscleGroups"

import { logger } from "@/utils/logger"

export default function ProfileScreen() {
  const router = useRouter()

  const muscleGroups = useMuscleGroups()

  logger("MuscleGroups: ", muscleGroups)

  return (
    <View style={styles.container}>
      {muscleGroups && (
        <FlashList
          data={muscleGroups}
          style={{ width: "100%" }}
          contentContainerStyle={{
            padding: 16,
          }}
          numColumns={2}
          renderItem={({ item, index }) => {
            const marginLeft = index % 2 === 0 ? 0 : 6
            const marginRight = index % 2 === 0 ? 6 : 0

            return (
              <Link href={`/(tabs)/profile/${item.id}`} asChild>
                <Pressable
                  style={{
                    aspectRatio: 1 / 1,
                    borderRadius: 20,
                    marginLeft,
                    marginRight,
                  }}
                >
                  <Image
                    style={styles.image}
                    source={muscleGroupImages[item.name].img}
                    placeholder={{
                      blurhash: muscleGroupImages[item.name].blurhash,
                    }}
                    transition={250}
                  />
                </Pressable>
              </Link>
            )
          }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
      <View style={styles.buttonContainer}>
        <Button
          label="Gym session"
          icon={<Dumbbell color={md3Colors.dark.onPrimary} size={20} />}
          onPress={() => {
            router.push("/(tabs)")
          }}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: md3Colors.dark.background,
    alignItems: "center",
  },
  buttonContainer: {
    width: "100%",
    padding: 16,
  },
  image: {
    height: "100%",
    width: "100%",
    borderRadius: 20,
  },
})
