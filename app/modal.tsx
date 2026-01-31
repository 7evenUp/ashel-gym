import { useEffect, useState } from "react"
import { useSQLiteContext } from "expo-sqlite"
import { StyleSheet, Text, View } from "react-native"

const Modal = () => {
  const db = useSQLiteContext()

  const [userVersion, setUserVersion] = useState("")
  const [sqliteVersion, setSQLiteVersion] = useState("")

  useEffect(() => {
    ;(async () => {
      const sqliteVersion = await db.getFirstAsync<{
        "sqlite_version()": string
      }>("SELECT sqlite_version()")
      const userVersion = await db.getFirstAsync<{
        user_version: number
      }>("PRAGMA user_version")

      if (sqliteVersion) setSQLiteVersion(sqliteVersion["sqlite_version()"])
      else setSQLiteVersion("-")
      if (userVersion) setUserVersion(userVersion["user_version"].toString())
      else setUserVersion("-")
    })()
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.label}>SQLite version: {sqliteVersion}</Text>
      <Text style={styles.label}>User version: {userVersion}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    minHeight: 400,
    paddingInline: 16,
    paddingBlock: 24,
  },
  label: {
    fontSize: 20,
  },
})

export default Modal
