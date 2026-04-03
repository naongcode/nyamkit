-- 간식 좋아요
ALTER TABLE snacks
  ADD COLUMN IF NOT EXISTS likes integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS voter_ids jsonb NOT NULL DEFAULT '[]';

-- 간식 댓글
CREATE TABLE IF NOT EXISTS snack_comments (
  id          text        PRIMARY KEY,
  snack_id    text        NOT NULL REFERENCES snacks(id) ON DELETE CASCADE,
  nickname    text        NOT NULL,
  password    text        NOT NULL,
  text        text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_snack_comments_snack_id ON snack_comments (snack_id);
CREATE INDEX IF NOT EXISTS idx_snack_comments_created_at ON snack_comments (created_at DESC);
