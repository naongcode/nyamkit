'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { HoneyCombo, SnackSummary, ComboItem } from '@/types/snack'
import { useCart } from '@/lib/useCart'

interface Props {
  combo: HoneyCombo
  snackMap: Record<string, SnackSummary>
  userId: string | null
}

export default function ComboCard({ combo, snackMap, userId }: Props) {
  const router = useRouter()
  const [likes, setLikes] = useState(combo.likes)
  const [liked, setLiked] = useState(false)
  const [liking, setLiking] = useState(false)
  const [page, setPage] = useState(0)
  const [deleting, setDeleting] = useState(false)

  const isOwner = !!userId && userId === combo.user_id
  const [expanded, setExpanded] = useState(false)
  const PAGE_SIZE = 4
  const totalPages = Math.ceil(combo.items.length / PAGE_SIZE)
  const visibleItems = combo.items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const heroImage = combo.image_url
    || combo.items.map(i => i.type === 'existing' && i.snack_id ? snackMap[i.snack_id]?.image_url : null).find(Boolean)
    || null

  async function handleLike() {
    if (liking) return
    const voter_id = userId || getAnonId()
    setLiking(true)
    const res = await fetch('/api/combos/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: combo.id, voter_id }),
    })
    if (res.ok) {
      const r = await res.json()
      setLikes(r.likes)
      setLiked(r.liked)
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
    router.refresh()
  }

  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* 헤더 */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/combos/${combo.id}`}>
              <h2 className="text-base font-bold line-clamp-1 hover:text-orange-500 transition-colors">{combo.title}</h2>
            </Link>
            <button onClick={handleLike} disabled={liking}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border transition-colors shrink-0 ${
                liked ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-400 border-gray-200'
              }`}>
              🍯 {likes > 0 ? likes : ''}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{combo.nickname} · {combo.items.length}가지 · {new Date(combo.created_at).toLocaleDateString('ko-KR')}</p>
        </div>
        {isOwner && (
          <div className="flex items-center gap-1.5 shrink-0">
            <Link href={`/combos/${combo.id}/edit`}
              className="text-xs text-gray-400 border border-gray-200 rounded-full px-2.5 py-1">수정</Link>
            <button onClick={handleDelete} disabled={deleting}
              className="text-xs text-red-300 border border-red-200 rounded-full px-2.5 py-1 disabled:opacity-40">
              {deleting ? '…' : '삭제'}
            </button>
          </div>
        )}
      </div>

      {/* 이미지 영역: CSS Grid으로 왼쪽 높이 = 오른쪽 높이 */}
      <div className="px-3 pb-3 grid grid-cols-[48%_1fr] gap-2">
        {/* 대표 이미지 — aspect-square가 행 높이를 결정 */}
        <div className="relative aspect-square rounded-xl overflow-hidden bg-orange-50">
          {heroImage
            ? <Image src={heroImage} alt={combo.title} fill className="object-cover" sizes="45vw" />
            : <div className="w-full h-full flex items-center justify-center text-3xl">🍯</div>
          }
        </div>

        {/* 상품 2x2 그리드 — 왼쪽과 동일 높이로 채움 */}
        <div className="flex flex-col gap-1.5">
          <div className="grid grid-cols-2 grid-rows-2 gap-1.5 flex-1">
            {visibleItems.map((item, i) => (
              <ItemTile key={i} item={item} snack={item.type === 'existing' && item.snack_id ? snackMap[item.snack_id] : undefined} />
            ))}
            {Array.from({ length: PAGE_SIZE - visibleItems.length }).map((_, i) => (
              <div key={`empty-${i}`} className="rounded-lg bg-gray-50" />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-0.5">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 0}
                className="text-gray-400 disabled:opacity-20 hover:text-orange-400 p-0.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i} onClick={() => setPage(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${i === page ? 'bg-orange-400' : 'bg-gray-200'}`} />
                ))}
              </div>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}
                className="text-gray-400 disabled:opacity-20 hover:text-orange-400 p-0.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 설명 */}
      {combo.description && (
        <div className="px-4 pb-2">
          <p className={`text-sm text-gray-600 leading-relaxed whitespace-pre-wrap ${expanded ? '' : 'line-clamp-3'}`}>
            {combo.description}
          </p>
          {combo.description.length > 60 && (
            <button onClick={() => setExpanded(e => !e)} className="text-xs text-orange-400 mt-0.5">
              {expanded ? '접기' : '더보기'}
            </button>
          )}
        </div>
      )}

    </article>
  )
}

function ItemTile({ item, snack }: { item: ComboItem; snack?: SnackSummary }) {
  const { user, addItem, isInCart } = useCart()
  const router = useRouter()
  const [added, setAdded] = useState(false)
  const [hovered, setHovered] = useState(false)
  const inCart = snack ? isInCart(snack.id) : false

  function handleClick() {
    if (item.type === 'existing' && snack) router.push(`/snack/${snack.id}`)
    else if (item.type === 'custom' && item.url) window.open(item.url, '_blank', 'noopener,noreferrer')
  }

  async function handleCart(e: React.MouseEvent) {
    e.stopPropagation()
    if (!snack) return
    if (!user) { router.push('/login'); return }
    await addItem({ snack_id: snack.id, name: snack.name, image_url: snack.image_url, price_approx: snack.price_approx, purchase_url: snack.purchase_url })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const image = snack?.image_url || null
  const name = snack?.name || item.name || '?'
  const price = snack?.price_approx || item.price || null
  const isClickable = (item.type === 'existing' && !!snack) || (item.type === 'custom' && !!item.url)

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative w-full h-full rounded-lg overflow-hidden bg-gray-50 ${isClickable ? 'cursor-pointer active:scale-95 transition-transform' : ''}`}
    >
      {image
        ? <Image src={image} alt={name} fill className="object-cover" sizes="22vw" />
        : <div className="w-full h-full flex items-center justify-center text-lg">{item.type === 'existing' ? '🍱' : '🛒'}</div>
      }
      {/* 이름 오버레이 */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-1.5 py-1">
        <p className="text-[10px] text-white font-medium line-clamp-1 leading-tight">{name}</p>
        <p className="text-[9px] text-orange-300 leading-tight">{price || '-'}</p>
      </div>
      {/* 찜하기 — hover 시에만 표시 (찜된 상태면 항상 표시) */}
      {snack && (
        <button onClick={handleCart}
          className={`absolute bottom-7 right-1 w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-md transition-opacity ${
            added ? 'bg-green-500 text-white' : inCart ? 'bg-orange-500 text-white' : 'bg-orange-400 text-white'
          } ${hovered || inCart || added ? 'opacity-100' : 'opacity-0'}`}>
          {added ? '✓' : '🛒'}
        </button>
      )}
    </div>
  )
}

function getAnonId(): string {
  const key = 'nyamkit_anon_id'
  let id = localStorage.getItem(key)
  if (!id) { id = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem(key, id) }
  return id
}
