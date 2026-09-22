-- ============================================================
-- ESTUDIO ARKIPELAGO — Initial Database Schema
-- ============================================================
-- Run this migration against your Supabase project once ready.
-- For the MVP, the app runs in localStorage-only mode.
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM: User roles
-- ============================================================
CREATE TYPE user_role AS ENUM (
  'partner',
  'senior_architect',
  'junior_architect',
  'contractor'
);

CREATE TYPE project_status AS ENUM (
  'active',
  'on-hold',
  'completed',
  'archived'
);

-- ============================================================
-- TABLE: profiles (extends Supabase auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'junior_architect',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: projects
-- ============================================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  status project_status NOT NULL DEFAULT 'active',
  client_name TEXT,
  description TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: project_members (junction table)
-- ============================================================
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- ============================================================
-- TABLE: time_entries
-- ============================================================
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_seconds INTEGER,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER FUNCTIONS FOR RLS (Security Definer to prevent infinite recursion)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_partner(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = user_id AND role = 'partner'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ----------------------------------------
-- PROFILES POLICIES
-- ----------------------------------------

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Partners can read all profiles (using SECURITY DEFINER function to prevent recursion)
CREATE POLICY "Partners can view all profiles"
  ON profiles FOR SELECT
  USING (public.is_partner(auth.uid()));

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ----------------------------------------
-- PROJECTS POLICIES
-- ----------------------------------------

-- Partners and senior architects can view all projects
CREATE POLICY "Senior staff can view all projects"
  ON projects FOR SELECT
  USING (
    public.get_user_role(auth.uid()) IN ('partner', 'senior_architect')
  );

-- Junior architects can only view assigned projects
CREATE POLICY "Juniors can view assigned projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_id = projects.id AND user_id = auth.uid()
    )
  );

-- Only partners can create/update/delete projects
CREATE POLICY "Partners can manage projects"
  ON projects FOR ALL
  USING (public.is_partner(auth.uid()));

-- ----------------------------------------
-- PROJECT MEMBERS POLICIES
-- ----------------------------------------

-- Users can view their own project assignments
CREATE POLICY "Users can view own assignments"
  ON project_members FOR SELECT
  USING (auth.uid() = user_id OR public.is_partner(auth.uid()));

-- Partners can insert/update/delete project members
CREATE POLICY "Partners can manage project members"
  ON project_members FOR ALL
  USING (public.is_partner(auth.uid()));

-- ----------------------------------------
-- TIME ENTRIES POLICIES
-- ----------------------------------------

-- Users can manage their own time entries
CREATE POLICY "Users can manage own time entries"
  ON time_entries FOR ALL
  USING (auth.uid() = user_id);

-- Partners can view all time entries
CREATE POLICY "Partners can view all time entries"
  ON time_entries FOR SELECT
  USING (public.is_partner(auth.uid()));

-- ----------------------------------------
-- INDEXES
-- ----------------------------------------
CREATE INDEX idx_time_entries_user ON time_entries(user_id);
CREATE INDEX idx_time_entries_project ON time_entries(project_id);
CREATE INDEX idx_time_entries_start ON time_entries(start_time);
CREATE INDEX idx_project_members_user ON project_members(user_id);
CREATE INDEX idx_project_members_project ON project_members(project_id);

-- ----------------------------------------
-- TRIGGERS: auto-update updated_at
-- ----------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
