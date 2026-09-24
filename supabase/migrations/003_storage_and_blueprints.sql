-- ============================================================
-- ESTUDIO ARKIPELAGO — Migration 003: Storage Buckets, Blueprints & Chat Channels
-- ============================================================

-- ============================================================
-- 1. STORAGE BUCKETS CONFIGURATION
-- ============================================================

-- Insert storage buckets if they do not exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('blueprints', 'blueprints', true, 52428800, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'application/pdf']),
  ('chat-attachments', 'chat-attachments', true, 26214400, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'application/pdf']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================================
-- 2. STORAGE RLS POLICIES
-- ============================================================

-- Allow public read access to all assets in studio buckets
CREATE POLICY "Public Read Studio Assets"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('blueprints', 'chat-attachments', 'avatars'));

-- Allow authenticated users to upload to studio buckets
CREATE POLICY "Authenticated Users Can Upload Studio Assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id IN ('blueprints', 'chat-attachments', 'avatars')
    AND auth.role() = 'authenticated'
  );

-- Allow uploaders or partners to update / delete their files
CREATE POLICY "Owners or Partners Can Delete Assets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id IN ('blueprints', 'chat-attachments', 'avatars')
    AND (
      auth.uid() = owner
      OR public.is_partner(auth.uid())
    )
  );

-- ============================================================
-- 3. DRAWING SHEETS TABLE (BLUEPRINT VAULT)
-- ============================================================

CREATE TYPE drawing_category AS ENUM (
  'ARCHITECTURAL',
  'STRUCTURAL',
  'RENDERS',
  'MATERIALS'
);

CREATE TABLE IF NOT EXISTS drawing_sheets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sheet_number TEXT NOT NULL,
  title TEXT NOT NULL,
  category drawing_category NOT NULL DEFAULT 'ARCHITECTURAL',
  revision TEXT NOT NULL DEFAULT 'REV 01 - SCHEMATIC',
  file_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drawing_sheets_project ON drawing_sheets(project_id);
CREATE INDEX IF NOT EXISTS idx_drawing_sheets_category ON drawing_sheets(category);

ALTER TABLE drawing_sheets ENABLE ROW LEVEL SECURITY;

-- Junior/Contractor can view drawing sheets for their assigned projects, Partners/Seniors view all
CREATE POLICY "Users can view drawing sheets of accessible projects"
  ON drawing_sheets FOR SELECT
  USING (
    public.get_user_role(auth.uid()) IN ('partner', 'senior_architect')
    OR EXISTS (
      SELECT 1 FROM project_members
      WHERE project_id = drawing_sheets.project_id AND user_id = auth.uid()
    )
  );

-- Staff can insert drawing sheets into accessible projects
CREATE POLICY "Users can upload drawing sheets to accessible projects"
  ON drawing_sheets FOR INSERT
  WITH CHECK (
    public.get_user_role(auth.uid()) IN ('partner', 'senior_architect')
    OR EXISTS (
      SELECT 1 FROM project_members
      WHERE project_id = drawing_sheets.project_id AND user_id = auth.uid()
    )
  );

-- Partners & Senior Architects can update or delete drawing sheets
CREATE POLICY "Senior staff can manage drawing sheets"
  ON drawing_sheets FOR ALL
  USING (
    public.get_user_role(auth.uid()) IN ('partner', 'senior_architect')
  );

-- ============================================================
-- 4. REAL-TIME CHAT THREADS & MESSAGES TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS chat_threads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'PROJECT_TOPIC',
  project_code TEXT,
  project_name TEXT,
  topic_name TEXT,
  participants JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  text TEXT NOT NULL,
  attachment TEXT,
  attachment_title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_thread ON chat_messages(thread_id);

ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view chat threads"
  ON chat_threads FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create chat threads"
  ON chat_threads FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view chat messages"
  ON chat_messages FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can post chat messages"
  ON chat_messages FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Enable Realtime Publication on communication tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'chat_threads'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE chat_threads;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'wall_posts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE wall_posts;
  END IF;
END $$;
