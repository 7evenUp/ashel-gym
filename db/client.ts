import { drizzle } from "drizzle-orm/expo-sqlite"
import { openDatabaseSync } from "expo-sqlite"

import { DATABASE_NAME } from "@/constants/db"

export const expoDb = openDatabaseSync(DATABASE_NAME, {
  enableChangeListener: true,
})

export const db = drizzle(expoDb)

export type DB = typeof db
