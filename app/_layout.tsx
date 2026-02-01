import { Suspense, useEffect } from "react"
import { ActivityIndicator } from "react-native"
import { Link, Stack } from "expo-router"
import { openDatabaseSync, SQLiteProvider } from "expo-sqlite"
import { StatusBar } from "expo-status-bar"

import { Info } from "lucide-react-native"

import { useDrizzleStudio } from "expo-drizzle-studio-plugin"
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator"
import { drizzle } from "drizzle-orm/expo-sqlite"

import migrations from "@/drizzle/migrations"

import { logger } from "@/utils/logger"
import { populateDb } from "@/utils/populateDb"

const DATABASE_NAME = "test1.db"
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

    populateDb(db)
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
