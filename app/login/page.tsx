'use client'

import { createSupabaseBrowser } from '@/lib/supabase'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { isTossEnvironment } from '@/lib/toss-env'
import { appLogin } from '@apps-in-toss/web-framework'

function LoginContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get('error')
  const [isToss, setIsToss] = useState(false)

  useEffect(() => {
    setIsToss(isTossEnvironment())
  }, [])

  async function handleGoogleLogin() {
    const supabase = createSupabaseBrowser()
    const next = searchParams.get('next') || '/'
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
  }

  async function handleTossLogin() {
    try {
      const { authorizationCode } = await appLogin()
      const next = searchParams.get('next') || '/'

      const res = await fetch('/api/auth/toss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorizationCode }),
      })

      if (!res.ok) throw new Error('toss login failed')

      router.push(next)
    } catch {
      router.push('/login?error=1')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-orange-50">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <img src="/logo.svg" alt="냠킷 로고" className="w-14 h-14" />
          <h1 className="text-2xl font-bold">냠킷</h1>
          <p className="text-sm text-gray-400">냠냠이의 먹킷리스트</p>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center">로그인에 실패했어요. 다시 시도해 주세요.</p>
        )}

        {isToss ? (
          <button
            onClick={handleTossLogin}
            className="w-full flex items-center justify-center gap-3 bg-[#0064FF] rounded-xl px-4 py-3 hover:bg-[#0052D4] transition font-medium text-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="white"/>
            </svg>
            토스로 로그인
          </button>
        ) : (
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl px-4 py-3 hover:bg-gray-50 transition font-medium text-gray-700"
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            Google로 계속하기
          </button>
        )}

        <p className="text-xs text-gray-400 text-center">
          로그인하면 찜 목록을 저장할 수 있어요
        </p>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
