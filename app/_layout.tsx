import { Suspense, useEffect } from "react"
import { Link, Stack } from "expo-router"
import { openDatabaseSync, SQLiteProvider } from "expo-sqlite"
import { StatusBar } from "expo-status-bar"
import { Info } from "lucide-react-native"
import { ActivityIndicator } from "react-native"
import { useDrizzleStudio } from "expo-drizzle-studio-plugin"
import { drizzle } from "drizzle-orm/expo-sqlite"
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator"
import migrations from "@/drizzle/migrations"
import { exerciseTable, muscleGroupTable } from "@/db/schema"
import { logger } from "@/utils/logger"
import { eq } from "drizzle-orm"

const DATABASE_NAME = "ashel-gym.db"
const expoDB = openDatabaseSync(DATABASE_NAME)
const db = drizzle(expoDB)

const Layout = () => {
  useDrizzleStudio(expoDB)

  return (
    <>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            title: "Ashel Gym",
            headerShown: true,
            headerStyle: {
              backgroundColor: "#211e27",
            },
            headerTintColor: "#fff",
            headerRight: () => (
              <Link href="/modal">
                <Info color="white" size={24} />
              </Link>
            ),
          }}
        />
        <Stack.Screen
          name="modal"
          options={{
            presentation: "formSheet",
            sheetGrabberVisible: true,
            sheetCornerRadius: 24,
            sheetAllowedDetents: "fitToContents",
          }}
        />
      </Stack>
      <StatusBar style="light" />
    </>
  )
}

export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations)

  useEffect(() => {
    logger("Success: ", success, ". |=====| Error: ", error)
    if (success) logger("Migrations applied successfully")
    if (error) logger("Migrations failed")
  }, [success, error])

  useEffect(() => {
    if (!success) return
    ;(async () => {
      await db.delete(muscleGroupTable)

      await db
        .insert(muscleGroupTable)
        .values([
          { name: "back" },
          { name: "chest" },
          { name: "biceps" },
          { name: "triceps" },
          { name: "legs" },
          { name: "shoulders" },
        ])

      const [backMuscle] = await db
        .select()
        .from(muscleGroupTable)
        .where(eq(muscleGroupTable.name, "back"))
        console.log('backMuscle: ', backMuscle)
      await db.insert(exerciseTable).values([
        {
          muscle_group_id: backMuscle.id,
          name: "Жим лёжа",
        },
      ])
      console.log("After inserting into exercises")
    })()
  }, [success])

  return (
    <Suspense fallback={<ActivityIndicator />}>
      <SQLiteProvider
        useSuspense
        databaseName={DATABASE_NAME}
        options={{ enableChangeListener: true }}
      >
        <Layout />
      </SQLiteProvider>
    </Suspense>
  )
}
