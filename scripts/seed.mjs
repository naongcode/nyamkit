import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY

if (!url || !key) {
  console.error('NEXT_PUBLIC_SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_SERVICE_KEY가 없습니다.')
  process.exit(1)
}

const supabase = createClient(url, key)
const raw = JSON.parse(readFileSync(join(__dirname, '../data/snacks.json'), 'utf-8'))

const snacks = raw.map(({ recipe_links, ...s }) => ({
  ...s,
  links: s.links ?? recipe_links ?? null,
}))

const { data, error } = await supabase.from('snacks').insert(snacks).select()
if (error) {
  console.error('삽입 실패:', error.message)
  process.exit(1)
}
console.log(`✓ ${data.length}개 데이터 Supabase에 삽입 완료`)
