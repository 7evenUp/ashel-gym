import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite"
import { SQLiteDatabase } from "expo-sqlite"

import { exerciseTable, muscleGroupTable } from "@/db/schema"
import { logger } from "./logger"

export const populateDb = async (
  db: ExpoSQLiteDatabase<Record<string, never>> & {
    $client: SQLiteDatabase
  },
) => {
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

  const muscleGroups = await db.select().from(muscleGroupTable)

  const back = muscleGroups.find((item) => item.name === "back")
  const chest = muscleGroups.find((item) => item.name === "chest")
  const biceps = muscleGroups.find((item) => item.name === "biceps")
  const triceps = muscleGroups.find((item) => item.name === "triceps")
  const legs = muscleGroups.find((item) => item.name === "legs")
  const shoulders = muscleGroups.find((item) => item.name === "shoulders")

  if (!back || !chest || !biceps || !triceps || !legs || !shoulders) {
    logger("Couldn't find inserted muscleGroups: ", muscleGroups)
    return
  }

  await db.insert(exerciseTable).values([
    {
      muscle_group_id: back.id,
      name: "Жим лёжа",
    },
  ])
  console.log("After inserting into exercises")
}
