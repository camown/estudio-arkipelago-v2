-- ============================================================
-- ESTUDIO ARKIPELAGO — Migration 006: High-Performance Database Indexing
-- ============================================================
-- Safe, additive B-tree composite indexes to accelerate queries
-- on large datasets, preventing sequential table scans.
-- ============================================================

-- 1. Indexing on Tasks (filtering by project, status, and assignees)
CREATE INDEX IF NOT EXISTS idx_tasks_project_status 
  ON tasks(project_id, status);

CREATE INDEX IF NOT EXISTS idx_tasks_assigned_user 
  ON tasks(assigned_user_id) 
  WHERE assigned_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_created_at 
  ON tasks(created_at DESC);

-- 2. Indexing on Wall Posts & Activity Feed (fast reverse chronological pagination)
CREATE INDEX IF NOT EXISTS idx_wall_posts_created_at 
  ON wall_posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wall_posts_author 
  ON wall_posts(author_id);

-- 3. Indexing on Time Entries & HR Ledger (filtering by user and date ranges)
CREATE INDEX IF NOT EXISTS idx_time_entries_user_project 
  ON time_entries(user_id, project_id, start_time DESC);

CREATE INDEX IF NOT EXISTS idx_hr_requests_user_status 
  ON hr_requests(user_id, status);

-- 4. Indexing on Projects and Members
CREATE INDEX IF NOT EXISTS idx_projects_code 
  ON projects(code);

CREATE INDEX IF NOT EXISTS idx_projects_status 
  ON projects(status);

CREATE INDEX IF NOT EXISTS idx_project_members_lookup 
  ON project_members(user_id, project_id);
