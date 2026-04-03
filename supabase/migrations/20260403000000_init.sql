-- ============================================================
-- 냠킷 초기 스키마
-- ============================================================

-- 간식 테이블
CREATE TABLE IF NOT EXISTS snacks (
  id            text        PRIMARY KEY,
  name          text        NOT NULL,
  short_desc    text        NOT NULL DEFAULT '',
  description   text,
  category      text        NOT NULL,
  price_approx  text        NOT NULL DEFAULT '',
  volume        text        NOT NULL DEFAULT '',
  value_score   integer     NOT NULL DEFAULT 3,
  prep_type     text        NOT NULL DEFAULT '그냥먹기',
  tags          jsonb       NOT NULL DEFAULT '[]',
  prep          jsonb,                              -- { steps: string[], time_min: number }
  links         jsonb,                              -- SnackLink[] { label, url, type }
  purchase_url  text        NOT NULL DEFAULT '',
  image_url     text        NOT NULL DEFAULT '',
  created_at    text        NOT NULL
);

-- 커뮤니티 게시글 테이블 (댓글은 JSONB로 내장)
CREATE TABLE IF NOT EXISTS community_posts (
  id              text        PRIMARY KEY,
  nickname        text        NOT NULL,
  password        text        NOT NULL,
  snack_name      text        NOT NULL,
  short_desc      text        NOT NULL DEFAULT '',
  price_approx    text,
  purchase_url    text,
  image_url       text,
  recommendations integer     NOT NULL DEFAULT 0,
  voter_ids       jsonb       NOT NULL DEFAULT '[]',   -- 추천 중복 방지용 UUID 배열
  comments        jsonb       NOT NULL DEFAULT '[]',   -- CommunityComment 배열
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_snacks_category    ON snacks (category);
CREATE INDEX IF NOT EXISTS idx_snacks_created_at  ON snacks (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_created_at   ON community_posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_recommend    ON community_posts (recommendations DESC);
