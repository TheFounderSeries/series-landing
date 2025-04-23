/*
  # Add Visitor Identification Fields

  1. Changes
    - Add fingerprint_id to visitor_sessions for browser fingerprinting
    - Add user_agent for detailed browser info
    - Add local_storage_id for returning visitor tracking
    - Add social_referrer_data for social media context

  2. Security
    - Maintains existing RLS policies
*/

-- Add new columns to visitor_sessions
ALTER TABLE visitor_sessions 
ADD COLUMN IF NOT EXISTS fingerprint_id text,
ADD COLUMN IF NOT EXISTS user_agent text,
ADD COLUMN IF NOT EXISTS local_storage_id text,
ADD COLUMN IF NOT EXISTS social_referrer_data jsonb;

-- Create index for fingerprint lookups
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_fingerprint ON visitor_sessions(fingerprint_id);

-- Create index for local storage id lookups
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_local_storage ON visitor_sessions(local_storage_id);