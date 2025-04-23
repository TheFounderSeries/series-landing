/*
  # Add Analytics Tables for Visitor Tracking

  1. New Tables
    - `visitor_sessions`
      - Basic session info and device data
      - One record per visitor session
    - `page_views`
      - Individual page view events within a session
    - `interaction_events`
      - Click, scroll, and other user interactions
    - `performance_metrics`
      - Loading times and technical performance data

  2. Security
    - Enable RLS on all tables
    - Add policies for inserting analytics data
*/

-- Create enum for device types
CREATE TYPE device_type AS ENUM ('mobile', 'tablet', 'desktop');

-- Create enum for event types
CREATE TYPE event_type AS ENUM ('click', 'scroll', 'navigation', 'error');

-- Main visitor sessions table
CREATE TABLE IF NOT EXISTS visitor_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  session_id uuid NOT NULL UNIQUE,  -- Added UNIQUE constraint
  ip_address text,
  device_type device_type,
  os_name text,
  browser_name text,
  screen_resolution text,
  timezone text,
  language text,
  country text,
  city text,
  referrer_source text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  connection_type text
);

-- Page views tracking
CREATE TABLE IF NOT EXISTS page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  session_id uuid NOT NULL REFERENCES visitor_sessions(session_id),
  page_url text NOT NULL,
  time_spent_seconds integer,
  scroll_depth integer,
  exit_page boolean DEFAULT false
);

-- User interaction events
CREATE TABLE IF NOT EXISTS interaction_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  session_id uuid NOT NULL REFERENCES visitor_sessions(session_id),
  event_type event_type NOT NULL,
  event_data jsonb,
  page_url text
);

-- Performance metrics
CREATE TABLE IF NOT EXISTS performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  session_id uuid NOT NULL REFERENCES visitor_sessions(session_id),
  page_load_time_ms integer,
  first_paint_time_ms integer,
  dom_interactive_time_ms integer,
  latency_ms integer,
  errors jsonb
);

-- Enable RLS
ALTER TABLE visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE interaction_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable insert for anonymous users on visitor_sessions"
  ON visitor_sessions
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Enable insert for anonymous users on page_views"
  ON page_views
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Enable insert for anonymous users on interaction_events"
  ON interaction_events
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Enable insert for anonymous users on performance_metrics"
  ON performance_metrics
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_session_id ON visitor_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_interaction_events_session_id ON interaction_events(session_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_session_id ON performance_metrics(session_id);