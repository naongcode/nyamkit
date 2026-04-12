'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HoneyCombo, Snack, ComboItem } from '@/types/snack'

type SnackSummary = Pick<Snack, 'id' | 'name' | 'image_url' | 'price_approx' | 'purchase_url'>

interface Props {
  combo: HoneyCombo
  snacks: SnackSummary[]
}

export default function ComboEditForm({ combo, snacks }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState(combo.title)
  const [description, setDescription] = useState(combo.description || '')
  const [imageUrl, setImageUrl] = useState(combo.image_url || '')
  const [nickname, setNickname] = useState(combo.nickname)
  const [items, setItems] = useState<ComboItem[]>(combo.items)
  const [submitting, setSubmitting] = useState(false)
  const [showSnackPicker, setShowSnackPicker] = useState(false)
  const [snackSearch, setSnackSearch] = useState('')

  const [customName, setCustomName] = useState('')
  const [customPrice, setCustomPrice] = useState('')
  const [customUrl, setCustomUrl] = useState('')
  const [customNote, setCustomNote] = useState('')

  const snackMap = Object.fromEntries(snacks.map((s) => [s.id, s]))
  const filteredSnacks = snacks.filter((s) => s.name.toLowerCase().includes(snackSearch.toLowerCase()))

  function addExistingItem(snack: SnackSummary) {
    if (items.some((i) => i.type === 'existing' && i.snack_id === snack.id)) return
    setItems((prev) => [...prev, { type: 'existing', snack_id: snack.id }])
    setShowSnackPicker(false)
    setSnackSearch('')
  }

  function addCustomItem() {
    if (!customName.trim()) return
    setItems((prev) => [...prev, {
      type: 'custom',
      name: customName.trim(),
      price: customPrice.trim() || undefined,
      url: customUrl.trim() || undefined,
      note: customNote.trim() || undefined,
    }])
    setCustomName(''); setCustomPrice(''); setCustomUrl(''); setCustomNote('')
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  function updateItemNote(index: number, note: string) {
    setItems((prev) => prev.map((item, i) => i === index ? { ...item, note } : item))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { alert('제목을 입력해주세요.'); return }
    if (items.length === 0) { alert('구성을 1개 이상 추가해주세요.'); return }

    setSubmitting(true)
    const res = await fetch('/api/combos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: combo.id,
        user_id: combo.user_id,
        nickname: nickname.trim(),
        title: title.trim(),
        description: description.trim() || null,
        image_url: imageUrl.trim() || null,
        items,
      }),
    })

    if (res.ok) {
      router.push('/combos')
    } else {
      alert('수정에 실패했습니다.')
      setSubmitting(false)
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 pb-10">
      <header className="py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-500 p-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="text-lg font-bold">🍯 꿀조합 수정</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">닉네임</label>
          <input value={nickname} onChange={(e) => setNickname(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400"
            maxLength={20} />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">제목 <span className="text-orange-500">*</span></label>
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400"
            maxLength={50} />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">설명 / 조리법</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 resize-none"
            rows={4} maxLength={500} />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">대표 이미지 URL</label>
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400"
            placeholder="https://..." />
          {imageUrl && (
            <div className="mt-2 flex justify-center">
              <img src={imageUrl} alt="미리보기" className="w-40 h-40 object-cover rounded-xl"
                onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">구성 <span className="text-orange-500">*</span></label>

          {items.length > 0 && (
            <div className="space-y-2 mb-3">
              {items.map((item, i) => {
                const snack = item.type === 'existing' && item.snack_id ? snackMap[item.snack_id] : null
                return (
                  <div key={i} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      {snack?.image_url
                        ? <img src={snack.image_url} alt={snack.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        : <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-xl shrink-0">{item.type === 'existing' ? '🍱' : '🛒'}</div>
                      }
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{snack?.name || item.name}</p>
                        {(snack?.price_approx || item.price) && (
                          <p className="text-xs text-orange-500">{snack?.price_approx || item.price}</p>
                        )}
                      </div>
                      <button type="button" onClick={() => removeItem(i)} className="text-gray-300 hover:text-red-400 p-1">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <input value={item.note || ''} onChange={(e) => updateItemNote(i, e.target.value)}
                      className="mt-2 w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-orange-400"
                      placeholder="메모 (선택)" maxLength={50} />
                  </div>
                )
              })}
            </div>
          )}

          <button type="button" onClick={() => setShowSnackPicker(!showSnackPicker)}
            className="w-full py-2.5 rounded-xl border border-dashed border-orange-300 text-orange-500 text-sm font-medium mb-2">
            + 냠킷 상품에서 추가
          </button>

          {showSnackPicker && (
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-3">
              <input value={snackSearch} onChange={(e) => setSnackSearch(e.target.value)}
                className="w-full px-3 py-2.5 text-sm outline-none border-b border-gray-100"
                placeholder="상품 검색..." autoFocus />
              <div className="max-h-56 overflow-y-auto">
                {filteredSnacks.length === 0
                  ? <p className="text-sm text-gray-400 text-center py-4">검색 결과 없음</p>
                  : filteredSnacks.map((snack) => (
                    <button key={snack.id} type="button" onClick={() => addExistingItem(snack)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-orange-50 text-left">
                      {snack.image_url
                        ? <img src={snack.image_url} alt={snack.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                        : <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center text-lg shrink-0">🍱</div>
                      }
                      <div className="min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{snack.name}</p>
                        <p className="text-xs text-gray-400">{snack.price_approx}</p>
                      </div>
                    </button>
                  ))
                }
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-3 space-y-2">
            <p className="text-xs font-medium text-gray-500">직접 추가</p>
            <input value={customName} onChange={(e) => setCustomName(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
              placeholder="상품명 *" maxLength={50} />
            <input value={customPrice} onChange={(e) => setCustomPrice(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
              placeholder="가격 (선택) — 예: 2,980원" maxLength={20} />
            <input value={customUrl} onChange={(e) => setCustomUrl(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
              placeholder="구매 링크 (선택)" />
            <input value={customNote} onChange={(e) => setCustomNote(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
              placeholder="메모 (선택)" maxLength={50} />
            <button type="button" onClick={addCustomItem} disabled={!customName.trim()}
              className="w-full py-2 bg-gray-200 rounded-lg text-sm font-medium text-gray-600 disabled:opacity-40">
              추가
            </button>
          </div>
        </div>

        <button type="submit" disabled={submitting || !title.trim() || items.length === 0}
          className="w-full py-3.5 bg-orange-500 text-white font-bold rounded-2xl disabled:opacity-40 text-sm">
          {submitting ? '저장 중...' : '✅ 수정 완료'}
        </button>
      </form>
    </main>
  )
}
