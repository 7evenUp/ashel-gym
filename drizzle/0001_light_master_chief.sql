PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_exercise` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`image` text NOT NULL,
	`muscle_group_id` integer NOT NULL,
	FOREIGN KEY (`muscle_group_id`) REFERENCES `muscle_group`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_exercise`("id", "name", "image", "muscle_group_id") SELECT "id", "name", "image", "muscle_group_id" FROM `exercise`;--> statement-breakpoint
DROP TABLE `exercise`;--> statement-breakpoint
ALTER TABLE `__new_exercise` RENAME TO `exercise`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_workout` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_workout`("id", "created_at") SELECT "id", "created_at" FROM `workout`;--> statement-breakpoint
DROP TABLE `workout`;--> statement-breakpoint
ALTER TABLE `__new_workout` RENAME TO `workout`;