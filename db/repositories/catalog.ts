import { asc, eq } from "drizzle-orm"

import { db } from "@/db/client"
import {
  Exercise,
  exerciseTable,
  MuscleGroup,
  muscleGroupTable,
} from "@/db/schema"

export const getMuscleGroups = async (): Promise<MuscleGroup[]> => {
  return db.select().from(muscleGroupTable).orderBy(asc(muscleGroupTable.id))
}

export const getExercisesByMuscleGroupId = async (
  muscleGroupId: number,
): Promise<Exercise[]> => {
  return db
    .select()
    .from(exerciseTable)
    .where(eq(exerciseTable.muscle_group_id, muscleGroupId))
    .orderBy(asc(exerciseTable.id))
}
