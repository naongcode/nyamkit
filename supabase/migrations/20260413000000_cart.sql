-- ============================================================
-- 장바구니 테이블 (Supabase Auth 연동)
-- ============================================================

CREATE TABLE IF NOT EXISTS cart_items (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snack_id     text        NOT NULL REFERENCES snacks(id) ON DELETE CASCADE,
  name         text        NOT NULL,
  image_url    text        NOT NULL DEFAULT '',
  price_approx text        NOT NULL DEFAULT '',
  purchase_url text        NOT NULL DEFAULT '',
  quantity     integer     NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  created_at   timestamptz NOT NULL DEFAULT now(),

  UNIQUE (user_id, snack_id)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items (user_id);

-- RLS 활성화
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- 본인 데이터만 조회/수정/삭제
CREATE POLICY "cart_select" ON cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cart_insert" ON cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cart_update" ON cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "cart_delete" ON cart_items FOR DELETE USING (auth.uid() = user_id);
