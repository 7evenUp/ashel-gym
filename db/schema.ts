import {
  sqliteTable as createTable,
  int,
  real,
  text,
} from "drizzle-orm/sqlite-core"

export const muscleGroupTable = createTable("muscle_group", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text({
    enum: ["back", "chest", "biceps", "triceps", "legs", "shoulders"],
  }).notNull(),
})

export const exerciseTable = createTable("exercise", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  image: text(),
  muscle_group_id: int()
    .notNull()
    .references(() => muscleGroupTable.id),
})

export const statsTable = createTable("stats", {
  exercise_id: int().primaryKey(),
  max_weight: real(),
  work_weight: real(),
})

export const statsHistoryTable = createTable("stats_history", {
  id: int().primaryKey({ autoIncrement: true }),
  type: text({ enum: ["max", "work"] }).notNull(),
  value: real().notNull(),
  changed_at: int().notNull(),
  exercise_id: int()
    .notNull()
    .references(() => exerciseTable.id),
})

export const workoutTable = createTable("workout", {
  id: int().primaryKey({ autoIncrement: true }),
  created_at: text().notNull(),
})

export const exerciseSetTable = createTable("exercise_set", {
  id: int().primaryKey({ autoIncrement: true }),
  weight: real().notNull(),
  reps: int().notNull(),
  order: int().notNull(),
  workout_id: int()
    .notNull()
    .references(() => workoutTable.id),
  exercise_id: int()
    .notNull()
    .references(() => exerciseTable.id),
})

export const workoutMuscleGroupTable = createTable("workout_muscle_group", {
  id: int().primaryKey({ autoIncrement: true }),
  workout_id: int()
    .notNull()
    .references(() => workoutTable.id),
  muscle_group_id: int()
    .notNull()
    .references(() => muscleGroupTable.id),
})

export type MuscleGroup = typeof muscleGroupTable.$inferSelect
export type Exercise = typeof exerciseTable.$inferSelect
export type Stats = typeof statsTable.$inferSelect
export type StatsHistory = typeof statsHistoryTable.$inferSelect
export type Workout = typeof workoutTable.$inferSelect
export type ExerciseSet = typeof exerciseSetTable.$inferSelect
export type WorkoutMuscleGroup = typeof workoutMuscleGroupTable.$inferSelect

export type InstertMuscleGroup = typeof muscleGroupTable.$inferInsert
export type InstertExercise = typeof exerciseTable.$inferInsert
export type InstertStats = typeof statsTable.$inferInsert
export type InstertStatsHistory = typeof statsHistoryTable.$inferInsert
export type InstertWorkout = typeof workoutTable.$inferInsert
export type InstertExerciseSet = typeof exerciseSetTable.$inferInsert
export type InstertWorkoutMuscleGroup =
  typeof workoutMuscleGroupTable.$inferInsert
