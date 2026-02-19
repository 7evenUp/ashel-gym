import { drizzle } from "drizzle-orm/expo-sqlite"
import { openDatabaseSync } from "expo-sqlite"

import { DATABASE_NAME } from "@/constants/db"
import { ExerciseSet, exerciseSetTable, InsertExerciseSet } from "./schema"
import { eq, and } from "drizzle-orm"

const expoDB = openDatabaseSync(DATABASE_NAME)
const db = drizzle(expoDB)

export const getExerciseSets = async ({
  exercise_id,
  workout_id,
}: Pick<ExerciseSet, "exercise_id" | "workout_id">) => {
  const sets = await db
    .select()
    .from(exerciseSetTable)
    .where(
      and(
        eq(exerciseSetTable.exercise_id, exercise_id),
        eq(exerciseSetTable.workout_id, workout_id),
      ),
    )

  return sets
}

export const createExerciseSet = async (values: InsertExerciseSet) => {
  const [insertedResult] = await db
    .insert(exerciseSetTable)
    .values({
      exercise_id: values.exercise_id,
      workout_id: values.workout_id,
      order: values.order,
      reps: values.reps,
      weight: values.weight,
    })
    .returning()

  return insertedResult
}

export const updateExerciseSet = async (
  values: Required<Pick<InsertExerciseSet, "id" | "order" | "reps" | "weight">>,
) => {
  const [updatedResult] = await db
    .update(exerciseSetTable)
    .set({ order: values.order, reps: values.reps, weight: values.weight })
    .where(eq(exerciseSetTable.id, values.id))
    .returning()

  return updatedResult
}
