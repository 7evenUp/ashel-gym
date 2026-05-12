-- Custom SQL migration file --
INSERT INTO `exercise` (`name`, `image`, `muscle_group_id`)
SELECT 'Seated Row', 'seated_row', mg.id
FROM `muscle_group` AS mg
WHERE mg.name = 'back'
  AND NOT EXISTS (
    SELECT 1
    FROM `exercise` AS e
    WHERE e.muscle_group_id = mg.id
      AND e.image = 'seated_row'
  );

--> statement-breakpoint

INSERT INTO `exercise` (`name`, `image`, `muscle_group_id`)
SELECT 'Barbell Hip Thrust', 'barbell_hip_thrust', mg.id
FROM `muscle_group` AS mg
WHERE mg.name = 'legs'
  AND NOT EXISTS (
    SELECT 1
    FROM `exercise` AS e
    WHERE e.muscle_group_id = mg.id
      AND e.image = 'barbell_hip_thrust'
  );

--> statement-breakpoint

INSERT INTO `exercise` (`name`, `image`, `muscle_group_id`)
SELECT 'Machine Squats', 'machine_squats', mg.id
FROM `muscle_group` AS mg
WHERE mg.name = 'legs'
  AND NOT EXISTS (
    SELECT 1
    FROM `exercise` AS e
    WHERE e.muscle_group_id = mg.id
      AND e.image = 'machine_squats'
  );

--> statement-breakpoint

INSERT INTO `exercise` (`name`, `image`, `muscle_group_id`)
SELECT 'Prone Leg Curl', 'prone_leg_curl', mg.id
FROM `muscle_group` AS mg
WHERE mg.name = 'legs'
  AND NOT EXISTS (
    SELECT 1
    FROM `exercise` AS e
    WHERE e.muscle_group_id = mg.id
      AND e.image = 'prone_leg_curl'
  );
