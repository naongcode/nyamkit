-- ============================================================
-- 꿀조합 테이블
-- ============================================================

CREATE TABLE IF NOT EXISTS honey_combos (
  id          text        PRIMARY KEY,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname    text        NOT NULL,
  title       text        NOT NULL,
  description text,
  image_url   text,
  items       jsonb       NOT NULL DEFAULT '[]',
  -- items 구조: { type: 'existing'|'custom', snack_id?: string, name?: string, url?: string, note?: string }[]
  likes       integer     NOT NULL DEFAULT 0,
  voter_ids   jsonb       NOT NULL DEFAULT '[]',
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- RLS 비활성화 (다른 테이블과 동일)
ALTER TABLE honey_combos DISABLE ROW LEVEL SECURITY;

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_honey_combos_created_at ON honey_combos (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_honey_combos_user_id    ON honey_combos (user_id);
CREATE INDEX IF NOT EXISTS idx_honey_combos_likes      ON honey_combos (likes DESC);
