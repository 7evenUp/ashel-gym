import { drizzle } from "drizzle-orm/expo-sqlite"
import { openDatabaseSync } from "expo-sqlite"
import { and, eq } from "drizzle-orm"

import { DATABASE_NAME } from "@/constants/db"

import { WorkoutMuscleGroup, workoutMuscleGroupTable } from "../schema"

const expoDB = openDatabaseSync(DATABASE_NAME)
const db = drizzle(expoDB)

type DB = typeof db

export const getWorkoutMuscleGroups = async (database: DB = db) => {
  const workoutMuscleGroups = await database
    .select()
    .from(workoutMuscleGroupTable)

  return workoutMuscleGroups
}

export const createWorkoutMuscleGroupIfNotExist = async (
  {
    muscle_group_id,
    workout_id,
  }: Pick<WorkoutMuscleGroup, "muscle_group_id" | "workout_id">,
  database: DB = db,
) => {
  const [existingLink] = await database
    .select()
    .from(workoutMuscleGroupTable)
    .where(
      and(
        eq(workoutMuscleGroupTable.workout_id, workout_id),
        eq(workoutMuscleGroupTable.muscle_group_id, muscle_group_id),
      ),
    )

  if (!existingLink) {
    await database.insert(workoutMuscleGroupTable).values({
      workout_id: workout_id,
      muscle_group_id: muscle_group_id,
    })
  }
}
