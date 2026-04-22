-- Custom SQL migration file --
INSERT INTO `exercise` (`name`, `image`, `muscle_group_id`)
SELECT 'Chest Press', 'chest_press', mg.id
FROM `muscle_group` AS mg
WHERE mg.name = 'chest'
  AND NOT EXISTS (
    SELECT 1
    FROM `exercise` AS e
    WHERE e.muscle_group_id = mg.id
      AND e.image = 'chest_press'
  );

--> statement-breakpoint

INSERT INTO `exercise` (`name`, `image`, `muscle_group_id`)
SELECT 'Lateral Raise', 'lateral_raise', mg.id
FROM `muscle_group` AS mg
WHERE mg.name = 'shoulders'
  AND NOT EXISTS (
    SELECT 1
    FROM `exercise` AS e
    WHERE e.muscle_group_id = mg.id
      AND e.image = 'lateral_raise'
  );
