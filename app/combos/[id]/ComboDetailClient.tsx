'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { HoneyCombo, SnackSummary, ComboItem } from '@/types/snack'
import { createSupabaseBrowser } from '@/lib/supabase'

interface Props {
  combo: HoneyCombo
  snacks: SnackSummary[]
  userId: string | null
}

export default function ComboDetailClient({ combo, snacks, userId }: Props) {
  const router = useRouter()
  const [likes, setLikes] = useState(combo.likes)
  const [liked, setLiked] = useState(false)
  const [liking, setLiking] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const isOwner = !!userId && userId === combo.user_id

  const snackMap = Object.fromEntries(snacks.map((s) => [s.id, s]))

  async function handleLike() {
    if (liking) return
    const supabase = createSupabaseBrowser()
    const { data: { user } } = await supabase.auth.getUser()
    const voter_id = user?.id || getAnonId()

    setLiking(true)
    const res = await fetch('/api/combos/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: combo.id, voter_id }),
    })
    if (res.ok) {
      const result = await res.json()
      setLikes(result.likes)
      setLiked(result.liked)
    }
    setLiking(false)
  }

  async function handleDelete() {
    if (!confirm(`"${combo.title}" 을 삭제할까요?`)) return
    setDeleting(true)
    await fetch('/api/combos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: combo.id, user_id: userId }),
    })
    router.push('/combos')
  }

  return (
    <main className="max-w-2xl mx-auto px-4 pb-24">
      {/* 헤더 */}
      <header className="py-4 flex items-center gap-3">
        <button onClick={() => history.back()} className="text-gray-500 p-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="text-lg font-bold flex-1 line-clamp-1">{combo.title}</h1>
        {isOwner && (
          <div className="flex items-center gap-2">
            <Link href={`/combos/${combo.id}/edit`} className="text-xs text-gray-500 border border-gray-200 rounded-full px-3 py-1.5 font-medium">
              수정
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs text-red-400 border border-red-200 rounded-full px-3 py-1.5 font-medium disabled:opacity-40"
            >
              {deleting ? '삭제 중' : '삭제'}
            </button>
          </div>
        )}
      </header>

      {/* 대표 이미지 */}
      <div className="flex justify-center mb-4">
        {combo.image_url
          ? <img src={combo.image_url} alt={combo.title} className="w-48 h-48 object-cover rounded-2xl" />
          : <div className="w-48 h-48 bg-orange-50 rounded-2xl flex items-center justify-center text-5xl">🍯</div>
        }
      </div>

      {/* 정보 */}
      <div className="mb-5">
        <p className="text-xs text-gray-400 mb-1">{combo.nickname} · {new Date(combo.created_at).toLocaleDateString('ko-KR')}</p>
        <h2 className="text-xl font-bold">{combo.title}</h2>
        {combo.description && (
          <p className="mt-2 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{combo.description}</p>
        )}
      </div>

      {/* 좋아요 */}
      <button
        onClick={handleLike}
        disabled={liking}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-colors mb-6 ${
          liked ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200'
        }`}
      >
        🍯 {likes > 0 ? likes : ''} {liked ? '꿀조합이에요!' : '꿀조합이에요'}
      </button>

      {/* 구성 목록 */}
      <section>
        <h3 className="text-base font-bold mb-3">구성 ({combo.items.length}가지)</h3>
        <div className="space-y-3">
          {combo.items.map((item, i) => (
            <ComboItemCard key={i} item={item} snack={item.type === 'existing' && item.snack_id ? snackMap[item.snack_id] : undefined} />
          ))}
        </div>
      </section>
    </main>
  )
}

function ComboItemCard({ item, snack }: { item: ComboItem; snack?: SnackSummary }) {
  if (item.type === 'existing' && snack) {
    return (
      <a href={`/snack/${snack.id}`} className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-3 shadow-sm active:scale-95 transition-transform">
        {snack.image_url
          ? <img src={snack.image_url} alt={snack.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
          : <div className="w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center text-2xl shrink-0">🍱</div>
        }
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold line-clamp-1">{snack.name}</p>
          <p className="text-xs text-gray-400">{snack.price_approx}</p>
          {item.note && <p className="text-xs text-orange-500 mt-0.5">{item.note}</p>}
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </a>
    )
  }

  return (
    <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
      <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center text-2xl shrink-0">🛒</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold line-clamp-1">{item.name}</p>
        {item.price && <p className="text-xs text-orange-500">{item.price}</p>}
        {item.url && (
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400">구매 링크 →</a>
        )}
        {item.note && <p className="text-xs text-gray-500 mt-0.5">{item.note}</p>}
      </div>
    </div>
  )
}

function getAnonId(): string {
  const key = 'nyamkit_anon_id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem(key, id)
  }
  return id
}
