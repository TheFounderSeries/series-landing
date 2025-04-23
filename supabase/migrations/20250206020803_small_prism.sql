/*
  # Create survey responses table

  1. New Tables
    - `survey_responses`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `dream` (text)
      - `struggle` (text)
      - `session_id` (uuid)
  2. Security
    - Enable RLS on `survey_responses` table
    - Add policy for inserting responses
*/

CREATE TABLE IF NOT EXISTS survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  dream text,
  struggle text,
  session_id uuid NOT NULL
);

ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for anonymous users"
  ON survey_responses
  FOR INSERT
  TO anon
  WITH CHECK (true);