import { useSQLiteContext } from "expo-sqlite"
import { drizzle } from "drizzle-orm/expo-sqlite"

const useDb = () => {
  const expoDb = useSQLiteContext()
  const db = drizzle(expoDb)

  return db
}

export default useDb
