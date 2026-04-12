'use client'

import { createSupabaseBrowser } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createSupabaseBrowser()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => {
      setUser(data.user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null)
      router.refresh()
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) return <div className="w-8 h-8" />

  if (user) {
    const avatar = user.user_metadata?.avatar_url
    const name = user.user_metadata?.name ?? user.email
    return (
      <div className="flex items-center gap-2">
        {avatar
          ? <img src={avatar} alt={name} className="w-8 h-8 rounded-full border border-orange-200" />
          : <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-sm font-bold text-orange-600">{name?.[0]?.toUpperCase()}</div>
        }
        <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-gray-600 transition">로그아웃</button>
      </div>
    )
  }

  return (
    <a href="/login" className="text-sm font-medium text-orange-500 border border-orange-300 px-3 py-1.5 rounded-full hover:bg-orange-50 transition">
      로그인
    </a>
  )
}
