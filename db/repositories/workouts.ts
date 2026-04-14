import { and, desc, eq, gt, gte, inArray, lt } from "drizzle-orm"

import { db } from "@/db/client"
import {
  exerciseSetTable,
  exerciseTable,
  InsertWorkout,
  Workout,
  WorkoutMuscleGroup,
  workoutMuscleGroupTable,
  workoutTable,
} from "@/db/schema"

const getDayBounds = (date: Date) => {
  const startOfDay = new Date(date)

  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(startOfDay)

  endOfDay.setDate(endOfDay.getDate() + 1)

  return {
    startAt: startOfDay.getTime(),
    endAt: endOfDay.getTime(),
  }
}

export const getLatestWorkoutForDay = async (
  date: Date = new Date(),
): Promise<Workout | null> => {
  const { startAt, endAt } = getDayBounds(date)

  const [workout] = await db
    .select()
    .from(workoutTable)
    .where(
      and(
        gte(workoutTable.created_at, startAt),
        lt(workoutTable.created_at, endAt),
      ),
    )
    .orderBy(desc(workoutTable.created_at))

  return workout ?? null
}

export const createWorkout = async (
  values: Partial<InsertWorkout> = {},
): Promise<Workout> => {
  const [createdWorkout] = await db
    .insert(workoutTable)
    .values({
      created_at: values.created_at ?? Date.now(),
      finished_at: values.finished_at ?? null,
    })
    .returning()

  return createdWorkout
}

export const finishWorkout = async (
  workoutId: number,
  finishedAt: number = Date.now(),
) => {
  const [updatedWorkout] = await db
    .update(workoutTable)
    .set({ finished_at: finishedAt })
    .where(eq(workoutTable.id, workoutId))
    .returning()

  return updatedWorkout
}

export const ensureWorkoutMuscleGroup = async ({
  muscle_group_id,
  workout_id,
}: Pick<WorkoutMuscleGroup, "muscle_group_id" | "workout_id">) => {
  const [existingLink] = await db
    .select()
    .from(workoutMuscleGroupTable)
    .where(
      and(
        eq(workoutMuscleGroupTable.workout_id, workout_id),
        eq(workoutMuscleGroupTable.muscle_group_id, muscle_group_id),
      ),
    )

  if (existingLink) return existingLink

  const [createdLink] = await db
    .insert(workoutMuscleGroupTable)
    .values({
      workout_id,
      muscle_group_id,
    })
    .returning()

  return createdLink
}

export const getCompletedMuscleGroupIdsForWorkout = async (
  workoutId: number,
): Promise<number[]> => {
  const rows = await db
    .select({
      muscleGroupId: exerciseTable.muscle_group_id,
    })
    .from(exerciseSetTable)
    .innerJoin(
      exerciseTable,
      eq(exerciseTable.id, exerciseSetTable.exercise_id),
    )
    .where(
      and(
        eq(exerciseSetTable.workout_id, workoutId),
        gt(exerciseSetTable.reps, 0),
        gt(exerciseSetTable.weight, 0),
      ),
    )

  return Array.from(new Set(rows.map((row) => row.muscleGroupId)))
}

export const getCompletedExerciseIdsForWorkout = async ({
  workoutId,
  exerciseIds,
}: {
  workoutId: number
  exerciseIds: number[]
}): Promise<number[]> => {
  if (exerciseIds.length === 0) return []

  const rows = await db
    .select({
      exerciseId: exerciseSetTable.exercise_id,
    })
    .from(exerciseSetTable)
    .where(
      and(
        eq(exerciseSetTable.workout_id, workoutId),
        inArray(exerciseSetTable.exercise_id, exerciseIds),
        gt(exerciseSetTable.reps, 0),
        gt(exerciseSetTable.weight, 0),
      ),
    )

  return Array.from(new Set(rows.map((row) => row.exerciseId)))
}

export const deleteWorkoutsByIds = async (workoutIds: number[]) => {
  if (workoutIds.length === 0) return

  await db.transaction(async (tx) => {
    await tx
      .delete(exerciseSetTable)
      .where(inArray(exerciseSetTable.workout_id, workoutIds))

    await tx
      .delete(workoutMuscleGroupTable)
      .where(inArray(workoutMuscleGroupTable.workout_id, workoutIds))

    await tx.delete(workoutTable).where(inArray(workoutTable.id, workoutIds))
  })
}
