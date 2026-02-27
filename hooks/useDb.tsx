import { useMemo } from "react"
import { useSQLiteContext } from "expo-sqlite"
import { drizzle } from "drizzle-orm/expo-sqlite"

const useDb = () => {
  const expoDb = useSQLiteContext()
  const db = useMemo(() => drizzle(expoDb), [expoDb])

  return db
}

export default useDb
