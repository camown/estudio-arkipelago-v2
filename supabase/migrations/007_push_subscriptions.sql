-- ============================================================
-- ESTUDIO ARKIPELAGO — Migration 007: Web Push Notification Subscriptions
-- ============================================================
-- Stores browser and mobile PWA push tokens for background alerts
-- ============================================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_email TEXT,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_subs_user_email 
  ON push_subscriptions(user_email);

CREATE INDEX IF NOT EXISTS idx_push_subs_user_id 
  ON push_subscriptions(user_id);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to manage their own push subscriptions"
  ON push_subscriptions FOR ALL
  USING (true)
  WITH CHECK (true);
