import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
const sb = createClient(url, key)

// items 컬럼이 없으면 테스트 insert로 확인 후 안내
const { error } = await sb.from('community_posts').select('items').limit(1)
if (error?.message?.includes('items')) {
  console.log('items 컬럼이 없습니다. Supabase 대시보드 SQL Editor에서 아래 쿼리를 실행하세요:')
  console.log("ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS items jsonb NOT NULL DEFAULT '[]';")
} else {
  console.log('✓ items 컬럼 확인 완료')
}
