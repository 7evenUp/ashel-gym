import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite"
import { SQLiteDatabase } from "expo-sqlite"

import {
  exerciseTable,
  muscleGroupTable,
  statsHistoryTable,
  statsTable,
} from "@/db/schema"

import { logger } from "./logger"

export const populateDb = async (
  db: ExpoSQLiteDatabase<Record<string, never>> & {
    $client: SQLiteDatabase
  },
  isPopulateNeeded = false,
) => {
  const initialData = await db.select().from(muscleGroupTable)

  if (initialData.length > 0 && !isPopulateNeeded) return

  await db.delete(muscleGroupTable)
  await db.delete(exerciseTable)
  await db.delete(statsTable)
  await db.delete(statsHistoryTable)

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
    {
      muscle_group_id: back.id,
      name: "Wide-Grip Lat Pulldown",
      image: "wide_grip_lat_pulldown",
    },
    {
      muscle_group_id: back.id,
      name: "Neutral-Grip Lat Pulldown",
      image: "neutral_grip_lat_pulldown",
    },
    {
      muscle_group_id: back.id,
      name: "Barbell Row",
      image: "barbell_row",
    },
    {
      muscle_group_id: back.id,
      name: "One-Arm Dumbbell Row",
      image: "one_arm_dumbbell_row",
    },
    {
      muscle_group_id: back.id,
      name: "Cable Row",
      image: "cable_row",
    },
    {
      muscle_group_id: back.id,
      name: "Lat Pullover",
      image: "lat_pullover",
    },
  ])
  // Chest
  await db.insert(exerciseTable).values([
    {
      muscle_group_id: chest.id,
      name: "Жим лёжа",
      image: "bench_press",
    },
    {
      muscle_group_id: chest.id,
      name: "Жим лёжа в наклоне",
      image: "incline_bench_press",
    },
    {
      muscle_group_id: chest.id,
      name: "Жим гантелей",
      image: "dumbbell_press",
    },
    {
      muscle_group_id: chest.id,
      name: "Pec Fly",
      image: "pec_fly",
    },
    {
      muscle_group_id: chest.id,
      name: "Machine Chest Press",
      image: "machine_chest_press",
    },
  ])
  // Biceps
  await db.insert(exerciseTable).values([
    {
      muscle_group_id: biceps.id,
      name: "Barbell Curl",
      image: "barbell_curl",
    },
    {
      muscle_group_id: biceps.id,
      name: "DB Curl",
      image: "dumbbell_curl",
    },
    {
      muscle_group_id: biceps.id,
      name: "DB Preacher Curl",
      image: "dumbbell_preacher_curl",
    },
    {
      muscle_group_id: biceps.id,
      name: "DB Incline Curl",
      image: "dumbbell_incline_curl",
    },
    {
      muscle_group_id: biceps.id,
      name: "Machine Preacher Curl",
      image: "machine_preacher_curl",
    },
    {
      muscle_group_id: biceps.id,
      name: "Hammer Preacher Curl",
      image: "hammer_preacher_curl",
    },
    {
      muscle_group_id: biceps.id,
      name: "Faceaway Bayesian Cable Curl",
      image: "faceaway_bayesian_cable_curl",
    },
  ])
  // Triceps
  await db.insert(exerciseTable).values([
    {
      muscle_group_id: triceps.id,
      name: "Triceps Pushdown",
      image: "triceps_pushdown",
    },
    {
      muscle_group_id: triceps.id,
      name: "Overhead Cable Extension",
      image: "overhead_cable_extension",
    },
    {
      muscle_group_id: triceps.id,
      name: "Dumbbell French Press",
      image: "db_french_press",
    },
    {
      muscle_group_id: triceps.id,
      name: "Cable Triceps Kickback",
      image: "cable_kickback",
    },
    {
      muscle_group_id: triceps.id,
      name: "Machine Dips",
      image: "machine_dips",
    },
  ])
  // Legs

  // Shoulders
}
