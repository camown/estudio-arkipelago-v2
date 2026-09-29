-- ============================================================
-- ESTUDIO ARKIPELAGO — Migration 005: Wall Post Interactions
-- ============================================================
-- Adds interaction columns to wall_posts:
-- likes, liked_by, comments, and updated_at
-- ============================================================

ALTER TABLE wall_posts 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS likes INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS liked_by JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS comments JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Ensure Realtime publication includes wall_posts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'wall_posts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE wall_posts;
  END IF;
END $$;
