-- Custom SQL migration file, put your code below! --
UPDATE `exercise`
SET `name` = CASE `image`
  WHEN 'deadlift' THEN 'Deadlift'
  WHEN 'bench_press' THEN 'Bench Press'
  WHEN 'incline_bench_press' THEN 'Incline Bench Press'
  WHEN 'dumbbell_press' THEN 'Dumbbell Press'
  WHEN 'dumbbell_curl' THEN 'Dumbbell Curl'
  WHEN 'dumbbell_preacher_curl' THEN 'Dumbbell Preacher Curl'
  WHEN 'dumbbell_incline_curl' THEN 'Dumbbell Incline Curl'
  WHEN 'squats' THEN 'Squats'
  WHEN 'smith_machine_squat' THEN 'Smith Machine Squat'
  ELSE `name`
END
WHERE `image` IN (
  'deadlift',
  'bench_press',
  'incline_bench_press',
  'dumbbell_press',
  'dumbbell_curl',
  'dumbbell_preacher_curl',
  'dumbbell_incline_curl',
  'squats',
  'smith_machine_squat'
);