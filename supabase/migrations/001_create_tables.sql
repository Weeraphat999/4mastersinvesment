-- Migration: Create holdings and journal_entries tables
-- Description: Sets up the core data tables for portfolio tracking and decision journaling
-- with Row Level Security (RLS) policies for user-scoped access.

-- ============================================================================
-- Holdings Table
-- ============================================================================

CREATE TABLE holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  company_name TEXT NOT NULL,
  shares NUMERIC NOT NULL,
  avg_cost NUMERIC NOT NULL,
  current_price NUMERIC NOT NULL,
  purchase_date DATE NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  risk_level TEXT NOT NULL DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own holdings
CREATE POLICY "Users can select own holdings"
  ON holdings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own holdings"
  ON holdings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own holdings"
  ON holdings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own holdings"
  ON holdings FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Journal Entries Table
-- ============================================================================

CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  ticker TEXT NOT NULL,
  company_name TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('BUY', 'PASS', 'WATCHLIST')),
  position_size_percent NUMERIC NOT NULL DEFAULT 0,
  position_size_amount NUMERIC NOT NULL DEFAULT 0,
  entry_price_target NUMERIC NOT NULL DEFAULT 0,
  current_price NUMERIC NOT NULL DEFAULT 0,
  reasoning TEXT NOT NULL DEFAULT '',
  expected_outcome TEXT NOT NULL DEFAULT '',
  exit_plan TEXT NOT NULL DEFAULT '',
  review_dates JSONB NOT NULL DEFAULT '[]',
  scores JSONB NOT NULL DEFAULT '{}',
  alerts_set JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  actual_outcome TEXT NOT NULL DEFAULT '',
  lessons_learned TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own journal entries
CREATE POLICY "Users can select own journal entries"
  ON journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries"
  ON journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries"
  ON journal_entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries"
  ON journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Indexes for common query patterns
-- ============================================================================

CREATE INDEX idx_holdings_user_id ON holdings(user_id);
CREATE INDEX idx_holdings_user_ticker ON holdings(user_id, ticker);
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_user_date ON journal_entries(user_id, date DESC);
