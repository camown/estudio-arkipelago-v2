-- ============================================================
-- ESTUDIO ARKIPELAGO — Migration 004: Fix RBAC, Tasks, and Directory
-- ============================================================

-- 1. Align HR Requests RLS with Senior Architect role capabilities
DROP POLICY IF EXISTS "Users can view own HR requests" ON hr_requests;
CREATE POLICY "Users can view own HR requests or senior staff can view non-complaints"
  ON hr_requests FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.is_partner(auth.uid())
    OR (public.get_user_role(auth.uid()) = 'senior_architect' AND type != 'complaint')
  );

DROP POLICY IF EXISTS "Partners can manage HR requests" ON hr_requests;
CREATE POLICY "Senior staff and partners can manage HR requests"
  ON hr_requests FOR UPDATE
  USING (public.get_user_role(auth.uid()) IN ('partner', 'senior_architect'));

-- 2. Tasks table
DO $$ BEGIN
  CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE task_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  project_phase TEXT,
  task_type TEXT NOT NULL,
  priority task_priority NOT NULL DEFAULT 'MEDIUM',
  assigned_member TEXT,
  assigned_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  start_date DATE,
  end_date DATE,
  time_needed TEXT,
  deliverables JSONB DEFAULT '[]'::jsonb,
  status task_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view tasks"
  ON tasks FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Senior staff and partners can manage tasks"
  ON tasks FOR ALL
  USING (public.get_user_role(auth.uid()) IN ('partner', 'senior_architect'));

CREATE POLICY "Assignees can update their task status"
  ON tasks FOR UPDATE
  USING (auth.uid() = assigned_user_id)
  WITH CHECK (auth.uid() = assigned_user_id);

-- 3. Directory Entries table
CREATE TABLE IF NOT EXISTS directory_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE directory_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view directory entries"
  ON directory_entries FOR SELECT
  USING (public.get_user_role(auth.uid()) IN ('partner', 'senior_architect', 'junior_architect'));

CREATE POLICY "Staff can insert directory entries"
  ON directory_entries FOR INSERT
  WITH CHECK (public.get_user_role(auth.uid()) IN ('partner', 'senior_architect', 'junior_architect'));

CREATE POLICY "Senior staff can update directory entries"
  ON directory_entries FOR UPDATE
  USING (public.get_user_role(auth.uid()) IN ('partner', 'senior_architect'));
