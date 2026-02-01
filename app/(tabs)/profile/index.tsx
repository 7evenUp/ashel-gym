import { useEffect, useState } from "react"
import { Text, View, StyleSheet, Pressable } from "react-native"
import { Image } from "expo-image"
import { Dumbbell } from "lucide-react-native"
import { Link, useRouter } from "expo-router"
import { useSQLiteContext } from "expo-sqlite"
import { drizzle } from "drizzle-orm/expo-sqlite"
import { FlashList } from "@shopify/flash-list"

import Button from "@/components/Button"

import { MuscleGroup, muscleGroupTable } from "@/db/schema"

import { logger } from "@/utils/logger"

const BackImage = require("@/assets/images/back_gradient.png")
const ChestImage = require("@/assets/images/chest_gradient.png")
const BicepsImage = require("@/assets/images/biceps_gradient.png")
const TricepsImage = require("@/assets/images/triceps_gradient.png")
const LegsImage = require("@/assets/images/legs_gradient.png")
const ShouldersImage = require("@/assets/images/shoulders_gradient.png")

export default function Index() {
  const router = useRouter()

  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[] | null>(null)

  const expoDB = useSQLiteContext()
  const db = drizzle(expoDB)

  useEffect(() => {
    ;(async () => {
      const muscleGroups = await db.select().from(muscleGroupTable)
      setMuscleGroups(muscleGroups)
    })()
  }, [])

  logger("MuscleGroups: ", muscleGroups)

  return (
    <View style={styles.container}>
      {muscleGroups && (
        <FlashList
          data={muscleGroups}
          style={{ width: "100%" }}
          contentContainerStyle={{
            padding: 16,
            flex: 1,
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
                  {item.name === "back" ? (
                    <Image source={BackImage} style={styles.image} />
                  ) : item.name === "chest" ? (
                    <Image source={ChestImage} style={styles.image} />
                  ) : item.name === "biceps" ? (
                    <Image source={BicepsImage} style={styles.image} />
                  ) : item.name === "triceps" ? (
                    <Image source={TricepsImage} style={styles.image} />
                  ) : item.name === "legs" ? (
                    <Image source={LegsImage} style={styles.image} />
                  ) : item.name === "shoulders" ? (
                    <Image source={ShouldersImage} style={styles.image} />
                  ) : (
                    <Text style={{ color: "black" }}>Name: {item.name}</Text>
                  )}
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
          icon={<Dumbbell color="white" size={20} />}
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
    backgroundColor: "#25292e",
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
