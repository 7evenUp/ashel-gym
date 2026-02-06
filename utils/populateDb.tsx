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

  // Back
  await db.insert(exerciseTable).values([
    {
      muscle_group_id: back.id,
      name: "Становая",
      image: "deadlift",
    },
  ])
  // Chest
  await db.insert(exerciseTable).values([
    {
      muscle_group_id: chest.id,
      name: "Жим лёжа",
      image: "bench_press",
    },
  ])
  // Biceps
  await db.insert(exerciseTable).values([
    {
      muscle_group_id: biceps.id,
      name: "Barbell curl",
      image: "barbell_curl",
    },
    {
      muscle_group_id: biceps.id,
      name: "DB curl",
      image: "dumbbell_curl",
    },
    {
      muscle_group_id: biceps.id,
      name: "DB preacher curl",
      image: "dumbbell_preacher_curl",
    },
    {
      muscle_group_id: biceps.id,
      name: "DB incline curl",
      image: "dumbbell_incline_curl",
    },
    {
      muscle_group_id: biceps.id,
      name: "Machine preacher curl",
      image: "machine_preacher_curl",
    },
    {
      muscle_group_id: biceps.id,
      name: "Hammer preacher curl",
      image: "hammer_preacher_curl",
    },
    {
      muscle_group_id: biceps.id,
      name: "Faceaway bayesian cable curl",
      image: "faceaway_bayesian_cable_curl",
    },
  ])
  console.log("After inserting into exercises")
}
