'use client'

import { useCart } from '@/lib/useCart'
import { createSupabaseBrowser } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface SnackRequest {
  id: string
  product_name: string
  memo: string | null
  status: 'pending' | 'done' | 'rejected'
  created_at: string
}

export default function CartPage() {
  const { items, user, loading, removeItem, clearCart } = useCart()
  const router = useRouter()
  const [tab, setTab] = useState<'cart' | 'requests'>('cart')
  const [requests, setRequests] = useState<SnackRequest[]>([])
  const [requestsLoading, setRequestsLoading] = useState(false)
  const [showRequest, setShowRequest] = useState(false)
  const [productName, setProductName] = useState('')
  const [memo, setMemo] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [loading, user])

  async function fetchRequests() {
    if (!user) return
    setRequestsLoading(true)
    const supabase = createSupabaseBrowser()
    const { data } = await supabase
      .from('snack_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setRequests(data ?? [])
    setRequestsLoading(false)
  }

  function handleBuyAll() {
    items.forEach(item => window.open(item.purchase_url, '_blank', 'noopener,noreferrer'))
  }

  async function handleRequest() {
    if (!productName.trim()) return
    setSubmitting(true)
    await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_name: productName, memo }),
    })
    setSubmitting(false)
    setDone(true)
    setProductName('')
    setMemo('')
    setTimeout(() => {
      setDone(false)
      setShowRequest(false)
      fetchRequests()
    }, 1000)
  }

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto px-4 pb-24 pt-16 flex justify-center">
        <p className="text-gray-400 text-sm">불러오는 중...</p>
      </main>
    )
  }

  return (
    <main className="max-w-2xl mx-auto pb-24">
      {/* 헤더 */}
      <header className="px-4 pt-5 pb-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">찜 목록</h1>
        {tab === 'cart' && items.length > 0 && (
          <button onClick={clearCart} className="text-xs text-gray-400 hover:text-red-400 transition">
            전체 삭제
          </button>
        )}
      </header>

      {/* 탭 */}
      <div className="flex border-b border-gray-100 px-4 mb-4">
        <button
          onClick={() => setTab('cart')}
          className={`pb-2.5 mr-5 text-sm font-semibold border-b-2 transition-colors ${tab === 'cart' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400'}`}
        >
          찜 목록 {items.length > 0 && <span className="text-xs">({items.length})</span>}
        </button>
        <button
          onClick={() => { setTab('requests'); fetchRequests() }}
          className={`pb-2.5 text-sm font-semibold border-b-2 transition-colors ${tab === 'requests' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400'}`}
        >
          요청 내역
        </button>
      </div>

      {/* 찜 목록 탭 */}
      {tab === 'cart' && (
        <>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
              <p className="text-4xl">🛒</p>
              <p className="font-bold text-gray-700">찜한 간식이 없어요</p>
              <Link href="/" className="text-sm bg-orange-500 text-white px-5 py-2.5 rounded-full font-semibold">
                간식 구경하기
              </Link>
            </div>
          ) : (
            <>
              <div className="px-4 mb-4 flex gap-2">
                <button
                  onClick={handleBuyAll}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold py-3.5 rounded-2xl text-sm transition"
                >
                  쿠팡에서 사기 🛒
                </button>
                <button
                  onClick={() => setShowRequest(true)}
                  className="bg-white border border-orange-300 text-orange-500 font-bold py-3.5 px-4 rounded-2xl text-sm hover:bg-orange-50 transition"
                >
                  요청하기
                </button>
              </div>
              <p className="text-xs text-gray-400 text-center -mt-2 mb-4">* 담긴 상품이 쿠팡에서 각각 열려요</p>
              <ul className="px-4 grid grid-cols-4 gap-2">
                {items.map((item) => (
                  <li key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
                    <div className="relative">
                      <Link href={`/snack/${item.snack_id}`}>
                        {item.image_url
                          ? <img src={item.image_url} alt={item.name} className="w-full aspect-square object-cover bg-gray-100" />
                          : <div className="w-full aspect-square bg-orange-50 flex items-center justify-center text-2xl">🍱</div>
                        }
                      </Link>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-400 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] transition"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="px-1.5 py-1.5">
                      <p className="text-[11px] text-gray-700 font-medium line-clamp-2 leading-tight">{item.name}</p>
                      <p className="text-[11px] text-orange-500 font-bold mt-0.5">{item.price_approx}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}

      {/* 요청 내역 탭 */}
      {tab === 'requests' && (
        <div className="px-4">
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs text-gray-400">요청한 간식을 냠냠이가 추가해 드려요</p>
            <button
              onClick={() => setShowRequest(true)}
              className="text-xs text-orange-500 border border-orange-300 px-3 py-1.5 rounded-full"
            >
              + 요청하기
            </button>
          </div>

          {requestsLoading ? (
            <p className="text-sm text-gray-400 text-center py-10">불러오는 중...</p>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
              <p className="text-4xl">📝</p>
              <p className="font-bold text-gray-700">요청 내역이 없어요</p>
              <button
                onClick={() => setShowRequest(true)}
                className="text-sm bg-orange-500 text-white px-5 py-2.5 rounded-full font-semibold"
              >
                먹고 싶은 거 요청하기
              </button>
            </div>
          ) : (
            <ul className="space-y-2">
              {requests.map((r) => (
                <li key={r.id} className="bg-white rounded-xl px-3 py-2.5 flex items-center justify-between gap-2 shadow-sm">
                  <p className="text-sm font-medium truncate flex-1">{r.product_name}</p>
                  <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${
                    r.status === 'done' ? 'bg-green-100 text-green-600' :
                    r.status === 'rejected' ? 'bg-gray-100 text-gray-400' :
                    'bg-orange-100 text-orange-500'
                  }`}>
                    {r.status === 'done' ? '✓ 등록됨' : r.status === 'rejected' ? '미등록' : '검토중'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* 요청하기 바텀 시트 */}
      {showRequest && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowRequest(false)} />
          <div className="relative w-full max-w-2xl mx-auto bg-white rounded-t-2xl px-4 pt-4 pb-24 space-y-3">
            <div className="w-8 h-1 bg-gray-200 rounded-full mx-auto mb-1" />
            <h2 className="text-sm font-bold">간식 요청하기</h2>
            <input
              type="text"
              placeholder="상품명 (예: 오뚜기 진라면 순한맛)"
              value={productName}
              onChange={e => setProductName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              autoFocus
            />
            <textarea
              placeholder="메모 (선택)"
              value={memo}
              onChange={e => setMemo(e.target.value)}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
            <button
              onClick={handleRequest}
              disabled={!productName.trim() || submitting}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition"
            >
              {done ? '✓ 요청됐어요!' : submitting ? '전송 중...' : '요청 보내기'}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
