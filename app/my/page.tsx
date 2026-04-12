'use client'

import { createSupabaseBrowser } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/useCart'
import type { User } from '@supabase/supabase-js'

export default function MyPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { items } = useCart()
  const router = useRouter()
  const supabase = createSupabaseBrowser()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => {
      setUser(data.user)
      setLoading(false)
    })
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return <main className="max-w-2xl mx-auto px-4 pb-24 pt-10" />
  }

  if (!user) {
    return (
      <main className="max-w-2xl mx-auto px-4 pb-24 pt-10 flex flex-col items-center gap-6 min-h-[60vh] justify-center">
        <p className="text-5xl">👤</p>
        <div className="text-center space-y-1">
          <p className="text-lg font-bold">로그인이 필요해요</p>
          <p className="text-sm text-gray-400">로그인하면 찜 목록를 저장할 수 있어요</p>
        </div>
        <a href="/login" className="bg-orange-500 text-white px-8 py-3 rounded-full font-semibold text-sm">
          Google로 로그인
        </a>
      </main>
    )
  }

  const avatar = user.user_metadata?.avatar_url
  const name = user.user_metadata?.name ?? user.email
  const email = user.email
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <main className="max-w-2xl mx-auto pb-24">
      {/* 프로필 */}
      <section className="px-4 pt-8 pb-6 flex flex-col items-center gap-3">
        {avatar
          ? <img src={avatar} alt={name} className="w-20 h-20 rounded-full border-2 border-orange-200 shadow-sm" />
          : <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-3xl font-bold text-orange-500">{name?.[0]?.toUpperCase()}</div>
        }
        <div className="text-center">
          <p className="font-bold text-lg">{name}</p>
          {email && <p className="text-xs text-gray-400">{email}</p>}
        </div>
      </section>

      {/* 통계 */}
      <section className="mx-4 bg-white rounded-2xl shadow-sm p-4 flex divide-x divide-gray-100 mb-4">
        <div className="flex-1 flex flex-col items-center gap-1">
          <p className="text-xl font-bold text-orange-500">{cartCount}</p>
          <p className="text-xs text-gray-400">찜 목록</p>
        </div>
        <div className="flex-1 flex flex-col items-center gap-1">
          <p className="text-xl font-bold text-orange-500">{items.length}</p>
          <p className="text-xs text-gray-400">담은 종류</p>
        </div>
      </section>

      {/* 메뉴 */}
      <section className="mx-4 bg-white rounded-2xl shadow-sm overflow-hidden">
        <a href="/cart" className="flex items-center justify-between px-4 py-4 border-b border-gray-50 hover:bg-gray-50 transition">
          <div className="flex items-center gap-3">
            <span className="text-xl">🛒</span>
            <span className="font-medium text-sm">찜 목록</span>
          </div>
          <div className="flex items-center gap-2">
            {cartCount > 0 && <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{cartCount}</span>}
            <span className="text-gray-300 text-sm">→</span>
          </div>
        </a>
        {email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
          <a href="/admin" className="flex items-center justify-between px-4 py-4 border-t border-gray-50 hover:bg-gray-50 transition">
            <div className="flex items-center gap-3">
              <span className="text-xl">🔧</span>
              <span className="font-medium text-sm">관리자 페이지</span>
            </div>
            <span className="text-gray-300 text-sm">→</span>
          </a>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-4 border-t border-gray-50 hover:bg-gray-50 transition text-left"
        >
          <span className="text-xl">👋</span>
          <span className="font-medium text-sm text-red-400">로그아웃</span>
        </button>
      </section>
    </main>
  )
}
