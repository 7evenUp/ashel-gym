CREATE TABLE `exercise_set` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`weight` real NOT NULL,
	`reps` integer NOT NULL,
	`order` integer NOT NULL,
	`workout_id` integer NOT NULL,
	`exercise_id` integer NOT NULL,
	FOREIGN KEY (`workout_id`) REFERENCES `workout`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercise`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `exercise` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`image` text,
	`muscle_group_id` integer NOT NULL,
	FOREIGN KEY (`muscle_group_id`) REFERENCES `muscle_group`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `muscle_group` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `stats_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`value` real NOT NULL,
	`changed_at` integer NOT NULL,
	`exercise_id` integer NOT NULL,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercise`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `stats` (
	`exercise_id` integer PRIMARY KEY NOT NULL,
	`max_weight` real,
	`work_weight` real
);
--> statement-breakpoint
CREATE TABLE `workout_muscle_group` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workout_id` integer NOT NULL,
	`muscle_group_id` integer NOT NULL,
	FOREIGN KEY (`workout_id`) REFERENCES `workout`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`muscle_group_id`) REFERENCES `muscle_group`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `workout` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text NOT NULL
);
