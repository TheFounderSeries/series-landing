/*
  # Add Color Mappings Table

  1. New Tables
    - `color_mappings`
      - `id` (uuid, primary key)
      - `personality` (text)
      - `name` (text) - The AI name (e.g., Vera, Jaren)
      - `color_code` (text) - Hex color code
      - `description` (text) - Personality description
  
  2. Security
    - Enable RLS on `color_mappings` table
    - Add policy for reading color mappings
*/

CREATE TABLE IF NOT EXISTS color_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  personality text NOT NULL,
  name text NOT NULL,
  color_code text NOT NULL,
  description text NOT NULL
);

-- Insert default color mappings
INSERT INTO color_mappings (personality, name, color_code, description) VALUES
  ('Analytical', 'Vera', '#95A5A6', 'Logical Problem Solver'),
  ('Creative', 'Jaren', '#4ECDC4', 'Imaginative Thinker'),
  ('Optimistic', 'Jess', '#FFD93D', 'Positive Visionary'),
  ('Intuitive', 'Pat', '#6C5CE7', 'Naturally Insightful'),
  ('Passionate', 'Alex', '#FF6B6B', 'Purpose Driven');

ALTER TABLE color_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to color_mappings for all users"
  ON color_mappings
  FOR SELECT
  TO anon
  USING (true);