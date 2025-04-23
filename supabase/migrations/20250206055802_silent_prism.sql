/*
  # Add personality column to survey_responses table

  1. Changes
    - Add `personality` column to `survey_responses` table
    - Column will store the user's personality type (e.g., 'Passionate', 'Creative', etc.)

  2. Security
    - Maintains existing RLS policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'survey_responses' AND column_name = 'personality'
  ) THEN
    ALTER TABLE survey_responses ADD COLUMN personality text;
  END IF;
END $$;