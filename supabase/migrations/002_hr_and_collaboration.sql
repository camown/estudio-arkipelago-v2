-- ============================================================
-- ESTUDIO ARKIPELAGO — Migration 002: HR Requests & Wall Posts
-- ============================================================

CREATE TYPE hr_request_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TYPE hr_request_type AS ENUM (
  'overtime',
  'leave',
  'schedule_adjustment',
  'official_business',
  'certificate',
  'reimbursement',
  'hours_adjustment',
  'complaint'
);

-- ============================================================
-- TABLE: hr_requests
-- ============================================================
CREATE TABLE hr_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type hr_request_type NOT NULL,
  status hr_request_status NOT NULL DEFAULT 'pending',
  reason TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: wall_posts
-- ============================================================
CREATE TABLE wall_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE hr_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE wall_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own HR requests"
  ON hr_requests FOR SELECT
  USING (auth.uid() = user_id OR public.is_partner(auth.uid()));

CREATE POLICY "Users can create HR requests"
  ON hr_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Partners can manage HR requests"
  ON hr_requests FOR UPDATE
  USING (public.is_partner(auth.uid()));

CREATE POLICY "All users can view wall posts"
  ON wall_posts FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create wall posts"
  ON wall_posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);
