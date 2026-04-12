-- snack_requests RLS 비활성화 (API 라우트에서 인증 처리)
ALTER TABLE snack_requests DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "requests_select" ON snack_requests;
DROP POLICY IF EXISTS "requests_insert" ON snack_requests;
