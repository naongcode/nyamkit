-- community_posts 테이블에 items 컬럼 추가 (다중 제품 지원)
ALTER TABLE community_posts
  ADD COLUMN IF NOT EXISTS items jsonb NOT NULL DEFAULT '[]';
