/*
  # Add education email to survey responses

  1. Changes
    - Add `edu_email` column to `survey_responses` table
    - Column will store the user's .edu email address

  2. Security
    - Maintains existing RLS policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'survey_responses' AND column_name = 'edu_email'
  ) THEN
    ALTER TABLE survey_responses ADD COLUMN edu_email text;
  END IF;
END $$;