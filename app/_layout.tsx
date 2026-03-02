import { Suspense, useEffect } from "react"
import { ActivityIndicator, Platform } from "react-native"
import { Stack } from "expo-router"
import { openDatabaseSync, SQLiteProvider } from "expo-sqlite"
import { StatusBar } from "expo-status-bar"

import { useDrizzleStudio } from "expo-drizzle-studio-plugin"
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator"
import { drizzle } from "drizzle-orm/expo-sqlite"

import migrations from "@/drizzle/migrations"

import { logger } from "@/utils/logger"
import { populateDb } from "@/utils/populateDb"

import { useWorkoutCreation } from "@/store/useWorkoutCreation"

import HeaderLeft from "@/components/header-buttons/HeaderLeft"
import HeaderRight from "@/components/header-buttons/HeaderRight"

import { md3Colors } from "@/constants/colors"
import { DATABASE_NAME } from "@/constants/db"

const expoDB = openDatabaseSync(DATABASE_NAME)
const db = drizzle(expoDB)

const Layout = () => {
  useDrizzleStudio(expoDB)

  const { currentStep, createdWorkoutId } = useWorkoutCreation()

  return (
    <>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            title: "Ashel Gym",
            headerShown: true,
            headerStyle: {
              backgroundColor: md3Colors.dark.background,
            },
            headerTintColor: md3Colors.dark.onSurface,
            headerLeft:
              currentStep !== "idle" ? () => <HeaderLeft /> : undefined,
            headerRight:
              createdWorkoutId !== null ? () => <HeaderRight /> : undefined,
          }}
        />
        <Stack.Screen
          name="stats-modal"
          options={{
            presentation: "formSheet",
            sheetAllowedDetents: "fitToContents",
            sheetGrabberVisible: true,
            headerShown: false,
            sheetCornerRadius: Platform.OS === "ios" ? undefined : 24,
            contentStyle: {
              backgroundColor: md3Colors.dark.surfaceContainerHigh,
            },
          }}
        />
        <Stack.Screen
          name="stats-history-modal"
          options={{
            presentation: "formSheet",
            sheetAllowedDetents: [0.75],
            sheetInitialDetentIndex: 0,
            sheetGrabberVisible: true,
            headerShown: false,
            sheetCornerRadius: Platform.OS === "ios" ? undefined : 24,
            contentStyle: {
              backgroundColor: md3Colors.dark.surfaceContainerHigh,
            },
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
    if (success) logger("Migrations applied successfully")
    if (error) logger("Migrations failed: ", error)
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
