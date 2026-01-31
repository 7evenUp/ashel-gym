import { openDatabaseSync } from "expo-sqlite"
import { drizzle } from "drizzle-orm/expo-sqlite"

export const DATABASE_NAME = "ashel-gym.db"

const useDatabase = () => {
  const expo = openDatabaseSync(DATABASE_NAME)
  const db = drizzle(expo)

  return db
}

export default useDatabase
