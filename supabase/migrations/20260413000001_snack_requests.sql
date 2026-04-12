-- 간식 요청 테이블
CREATE TABLE IF NOT EXISTS snack_requests (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  product_name text        NOT NULL,
  memo         text,
  status       text        NOT NULL DEFAULT 'pending',  -- pending | done | rejected
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_snack_requests_created_at ON snack_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_snack_requests_status     ON snack_requests (status);

-- RLS
ALTER TABLE snack_requests ENABLE ROW LEVEL SECURITY;

-- 본인 요청만 조회/등록
CREATE POLICY "requests_select" ON snack_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "requests_insert" ON snack_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
