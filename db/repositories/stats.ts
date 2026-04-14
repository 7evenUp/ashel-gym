import { asc, eq } from "drizzle-orm"

import { db } from "@/db/client"
import { Stats, StatsHistory, statsHistoryTable, statsTable } from "@/db/schema"

type SaveExerciseStatsInput = {
  exerciseId: number
  initialMaxWeight: number | null
  initialWorkWeight: number | null
  maxWeight: number | null
  workWeight: number | null
  changedAt?: number
}

type SaveExerciseStatsResult = {
  maxWeightChanged: boolean
  workWeightChanged: boolean
}

export const getExerciseStats = async (
  exerciseId: number,
): Promise<Stats | null> => {
  const [stats] = await db
    .select()
    .from(statsTable)
    .where(eq(statsTable.exercise_id, exerciseId))

  return stats ?? null
}

export const saveExerciseStats = async ({
  exerciseId,
  initialMaxWeight,
  initialWorkWeight,
  maxWeight,
  workWeight,
  changedAt = Date.now(),
}: SaveExerciseStatsInput): Promise<SaveExerciseStatsResult> => {
  return db.transaction(async (tx) => {
    const [existingStats] = await tx
      .select()
      .from(statsTable)
      .where(eq(statsTable.exercise_id, exerciseId))

    if (!existingStats) {
      await tx.insert(statsTable).values({
        exercise_id: exerciseId,
        work_weight: workWeight,
        max_weight: maxWeight,
      })
    } else {
      await tx
        .update(statsTable)
        .set({
          work_weight: workWeight,
          max_weight: maxWeight,
        })
        .where(eq(statsTable.exercise_id, exerciseId))
    }

    let workWeightChanged = false
    let maxWeightChanged = false

    if (workWeight !== null && initialWorkWeight !== workWeight) {
      await tx.insert(statsHistoryTable).values({
        exercise_id: exerciseId,
        type: "work",
        value: workWeight,
        changed_at: changedAt,
      })
      workWeightChanged = true
    }

    if (maxWeight !== null && initialMaxWeight !== maxWeight) {
      await tx.insert(statsHistoryTable).values({
        exercise_id: exerciseId,
        type: "max",
        value: maxWeight,
        changed_at: changedAt,
      })
      maxWeightChanged = true
    }

    return {
      maxWeightChanged,
      workWeightChanged,
    }
  })
}

export const getExerciseStatsHistory = async (
  exerciseId: number,
): Promise<StatsHistory[]> => {
  return db
    .select()
    .from(statsHistoryTable)
    .where(eq(statsHistoryTable.exercise_id, exerciseId))
    .orderBy(asc(statsHistoryTable.changed_at))
}
