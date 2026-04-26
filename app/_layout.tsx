import { useEffect } from "react"
import { Platform } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"

import { useDrizzleStudio } from "expo-drizzle-studio-plugin"
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator"

import { db, expoDb } from "@/db/client"

import migrations from "@/drizzle/migrations"

import { logger } from "@/utils/logger"
import { populateDb } from "@/utils/populateDb"

import { md3Colors } from "@/constants/colors"

const Layout = () => {
  useDrizzleStudio(expoDb)

  const insets = useSafeAreaInsets()

  return (
    <>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            contentStyle: {
              paddingTop: insets.top,
              backgroundColor: md3Colors.dark.background,
            },
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

  return <Layout />
}
