/*
  # Add EDU Survey Fields

  1. Changes
    - Add edu_major column to store the student's major
    - Add edu_year column to store the student's year
    - Add edu_goal column to store the student's primary goal

  2. Security
    - Maintains existing RLS policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'survey_responses' AND column_name = 'edu_major'
  ) THEN
    ALTER TABLE survey_responses ADD COLUMN edu_major text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'survey_responses' AND column_name = 'edu_year'
  ) THEN
    ALTER TABLE survey_responses ADD COLUMN edu_year text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'survey_responses' AND column_name = 'edu_goal'
  ) THEN
    ALTER TABLE survey_responses ADD COLUMN edu_goal text;
  END IF;
END $$;