-- ============================================================
-- ESTUDIO ARKIPELAGO — Migration 008: Sketch Studio Storage & Sessions
-- ============================================================

-- 1. Create Dedicated Storage Bucket for Sketch Markups & Exports
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('sketch-exports', 'sketch-exports', true, 52428800, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'application/json'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage Policies for sketch-exports
DO $$ BEGIN
  CREATE POLICY "Public Read Sketch Exports"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'sketch-exports');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated Users Can Upload Sketch Exports"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'sketch-exports'
      AND auth.role() = 'authenticated'
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Sketch Sessions Table for Non-Destructive Vector Editing & Round-trip Auditing
CREATE TABLE IF NOT EXISTS public.sketch_sessions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Architectural Redline Markup',
  sheet_no TEXT,
  project_code TEXT,
  project_name TEXT,
  scale_label TEXT,
  created_by TEXT NOT NULL,
  source_file_url TEXT,
  source_thread_id TEXT,
  source_message_id TEXT,
  vector_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  layers JSONB NOT NULL DEFAULT '[]'::jsonb,
  preview_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sketch_sessions_thread ON public.sketch_sessions(source_thread_id);
CREATE INDEX IF NOT EXISTS idx_sketch_sessions_creator ON public.sketch_sessions(created_by);
CREATE INDEX IF NOT EXISTS idx_sketch_sessions_created_at ON public.sketch_sessions(created_at DESC);

ALTER TABLE public.sketch_sessions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated users to read sketch sessions"
    ON public.sketch_sessions FOR SELECT
    USING (auth.role() = 'authenticated');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated users to insert sketch sessions"
    ON public.sketch_sessions FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated users to update their sketch sessions"
    ON public.sketch_sessions FOR UPDATE
    USING (auth.role() = 'authenticated');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Realtime Publication for sketch_sessions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'sketch_sessions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.sketch_sessions;
  END IF;
END $$;
