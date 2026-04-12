import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 기존 서버 전용 클라이언트 (API 라우트)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 브라우저 클라이언트 싱글턴 (클라이언트 컴포넌트)
let browserClient: ReturnType<typeof createBrowserClient> | null = null

export function createSupabaseBrowser() {
  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }
  return browserClient
}
