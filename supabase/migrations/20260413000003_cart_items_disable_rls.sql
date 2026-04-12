-- cart_items RLS 비활성화 (API 라우트에서 인증 처리)
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cart_select" ON cart_items;
DROP POLICY IF EXISTS "cart_insert" ON cart_items;
DROP POLICY IF EXISTS "cart_update" ON cart_items;
DROP POLICY IF EXISTS "cart_delete" ON cart_items;
