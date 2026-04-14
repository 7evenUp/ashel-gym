import { and, asc, eq } from "drizzle-orm"

import { db } from "@/db/client"
import { ExerciseSet, exerciseSetTable, InsertExerciseSet } from "@/db/schema"

export const getExerciseSets = async ({
  exercise_id,
  workout_id,
}: Pick<ExerciseSet, "exercise_id" | "workout_id">) => {
  return db
    .select()
    .from(exerciseSetTable)
    .where(
      and(
        eq(exerciseSetTable.exercise_id, exercise_id),
        eq(exerciseSetTable.workout_id, workout_id),
      ),
    )
    .orderBy(asc(exerciseSetTable.order), asc(exerciseSetTable.id))
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
