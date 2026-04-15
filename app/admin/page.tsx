'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Snack, PrepType, Category, Tag, SnackLink } from '@/types/snack'

function calcValueScore(priceApprox: string, volume: string): number | null {
  const price = Number(priceApprox.replace(/[^0-9]/g, ''))
  const grams = Number(volume.replace(/[^0-9]/g, ''))
  if (!price || !grams) return null
  const per100g = (price / grams) * 100
  if (per100g < 1000) return 5
  if (per100g < 1500) return 4
  if (per100g < 2000) return 3
  if (per100g < 3000) return 2
  return 1
}

const CATEGORIES: Category[] = ['냉동식품', '과자', '라면·면·즉석', '음료', '편의점', '야채', '소스·양념·재료', '기타']
const PREP_TYPES: PrepType[] = ['그냥먹기', '전자레인지', '에어프라이어', '끓이기', '전기밥솥']
const ALL_TAGS: Tag[] = ['주인장픽', '신상', '혼밥', '야식', '든든함', '간단함']

const emptyForm = {
  name: '',
  short_desc: '',
  description: '',
  category: '기타' as Category,
  price_approx: '',
  volume: '',
  value_score: 3,
  prep_type: '그냥먹기' as PrepType,
  tags: [] as Tag[],
  prep_steps: '',
  prep_time: '',
  links: [] as SnackLink[],
  purchase_url: '',
  image_url: '',
}

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'form' | 'list' | 'requests'>('form')
  const [requests, setRequests] = useState<{ id: string; product_name: string; memo: string | null; status: string; created_at: string }[]>([])
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null)
  const [url, setUrl] = useState('')
  const [parsing, setParsing] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [snacks, setSnacks] = useState<Snack[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchSnacks()
  }, [])

  async function fetchSnacks() {
    const res = await fetch('/api/snacks')
    setSnacks(await res.json())
  }

  async function handleParse() {
    if (!url.trim()) return
    setParsing(true)
    setMessage('')
    try {
      const res = await fetch('/api/parse-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage(data.error ?? '파싱 실패')
      } else {
        setForm((f) => ({
          ...f,
          name: data.name ?? f.name,
          price_approx: data.price_approx ?? f.price_approx,
          image_url: data.image_url ?? f.image_url,
          purchase_url: data.purchase_url ?? f.purchase_url,
        }))
      }
    } finally {
      setParsing(false)
    }
  }

  function handleEdit(snack: Snack) {
    setEditingId(snack.id)
    setForm({
      name: snack.name,
      short_desc: snack.short_desc,
      description: snack.description ?? '',
      category: snack.category,
      price_approx: snack.price_approx,
      volume: snack.volume,
      value_score: snack.value_score,
      prep_type: snack.prep_type,
      tags: snack.tags,
      prep_steps: snack.prep?.steps.join('\n') ?? '',
      prep_time: snack.prep?.time_min ? String(snack.prep.time_min) : '',
      links: snack.links ?? [],
      purchase_url: snack.purchase_url,
      image_url: snack.image_url,
    })
    setTab('form')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleCancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
    setUrl('')
    setMessage('')
  }

  async function handleSave() {
    if (!form.name.trim()) { setMessage('상품명을 입력해주세요.'); return }
    setSaving(true)
    setMessage('')
    try {
      const payload = {
        name: form.name,
        short_desc: form.short_desc,
        description: form.description || undefined,
        category: form.category,
        price_approx: form.price_approx,
        volume: form.volume,
        value_score: form.value_score,
        prep_type: form.prep_type,
        tags: form.tags,
        purchase_url: form.purchase_url,
        image_url: form.image_url,
        prep: form.prep_steps.trim() ? {
          steps: form.prep_steps.split('\n').filter(Boolean),
          time_min: Number(form.prep_time) || 0,
        } : undefined,
        links: form.links.filter((l) => l.label.trim() && l.url.trim()),
        ...(editingId && { id: editingId }),
      }
      const res = await fetch('/api/snacks', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setMessage(editingId ? '수정됐어요!' : '저장됐어요!')
        setEditingId(null)
        setForm(emptyForm)
        setUrl('')
        fetchSnacks()
        if (pendingRequestId) {
          const saved = await res.json()
          await fetch(`/api/requests/${pendingRequestId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'done', snack_id: saved.id }) })
          setRequests(prev => prev.map(x => x.id === pendingRequestId ? { ...x, status: 'done' } : x))
          setPendingRequestId(null)
        }
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    await fetch('/api/snacks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchSnacks()
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  function toggleTag(tag: Tag) {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
    }))
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">냠킷 어드민</h1>
        <div className="flex gap-2">
          <a href="/" className="text-sm text-orange-500 border border-orange-300 px-3 py-1.5 rounded-full">홈으로</a>
          <button onClick={handleLogout} className="text-sm text-gray-500 border border-gray-300 px-3 py-1.5 rounded-full hover:bg-gray-50">로그아웃</button>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex border-b">
        <button
          onClick={() => setTab('form')}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${tab === 'form' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400'}`}
        >
          {editingId ? '✏️ 수정 중' : '+ 입력'}
        </button>
        <button
          onClick={() => setTab('list')}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${tab === 'list' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400'}`}
        >
          목록 ({snacks.length})
        </button>
        <button
          onClick={async () => {
            setTab('requests')
            const res = await fetch('/api/requests')
            const data = await res.json()
            setRequests(data)
          }}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${tab === 'requests' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400'}`}
        >
          요청
        </button>
      </div>

      {/* 입력 탭 */}
      {tab === 'form' && (
        <>
          {/* URL 파싱 */}
          <section className="space-y-2">
            <label className="block font-semibold">쿠팡 URL 자동완성</label>
            <div className="flex gap-2">
              <input
                className="flex-1 border rounded px-3 py-2 text-sm"
                placeholder="https://www.coupang.com/vp/products/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <button
                onClick={handleParse}
                disabled={parsing}
                className="bg-blue-500 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
              >
                {parsing ? '불러오는 중...' : '불러오기'}
              </button>
            </div>
          </section>

          {/* 입력 폼 */}
          <section className="space-y-4 border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{editingId ? '간식 수정' : '간식 정보'}</h2>
              {editingId && (
                <button onClick={handleCancelEdit} className="text-xs text-gray-400 border border-gray-300 px-2 py-1 rounded">취소</button>
              )}
            </div>

            {form.image_url && (
              <img src={form.image_url} alt="미리보기" className="w-32 h-32 object-cover rounded" />
            )}

            <Field label="상품명 *">
              <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>

            <Field label="한 줄 설명">
              <input className={inputCls} value={form.short_desc} onChange={(e) => setForm({ ...form, short_desc: e.target.value })} placeholder="예: 전자레인지 2분이면 끝, 가성비 최고" />
            </Field>

            <Field label="조리법 / 메모">
              <textarea
                className={inputCls + ' h-28 resize-none'}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={'에어프라이어 180도 예열 후 10분.\n뒤집어서 5분 더 구우면 바삭해요.\n냉동 상태 그대로 넣어도 됨.'}
              />
            </Field>

            <div className="grid grid-cols-3 gap-4">
              <Field label="가격">
                <input
                  className={inputCls}
                  type="number"
                  placeholder="3980"
                  value={form.price_approx.replace(/[^0-9]/g, '')}
                  onChange={(e) => {
                    const num = e.target.value.replace(/[^0-9]/g, '')
                    const newPrice = num ? `약 ${Number(num).toLocaleString('ko-KR')}원` : ''
                    const auto = calcValueScore(newPrice, form.volume)
                    setForm((f) => ({ ...f, price_approx: newPrice, ...(auto !== null && { value_score: auto }) }))
                  }}
                />
                {form.price_approx && <p className="text-xs text-orange-500 mt-1">{form.price_approx}</p>}
              </Field>
              <Field label="용량">
                <input
                  className={inputCls}
                  value={form.volume}
                  placeholder="375g"
                  onChange={(e) => {
                    const newVol = e.target.value
                    const auto = calcValueScore(form.price_approx, newVol)
                    setForm((f) => ({ ...f, volume: newVol, ...(auto !== null && { value_score: auto }) }))
                  }}
                />
              </Field>
              <Field label="가성비 점수">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setForm({ ...form, value_score: n })}
                      className={`text-2xl transition-all duration-150 ${n <= form.value_score ? 'text-yellow-400 scale-110 drop-shadow-sm' : 'text-gray-200'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                {(() => {
                  const price = Number(form.price_approx.replace(/[^0-9]/g, ''))
                  const grams = Number(form.volume.replace(/[^0-9]/g, ''))
                  if (!price || !grams) return null
                  const per100g = Math.round((price / grams) * 100)
                  return (
                    <p className="text-xs text-gray-400 mt-1">
                      {per100g.toLocaleString('ko-KR')}원/100g
                    </p>
                  )
                })()}
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="카테고리">
                <select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Category })}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="준비 방식">
                <select className={inputCls} value={form.prep_type} onChange={(e) => setForm({ ...form, prep_type: e.target.value as PrepType })}>
                  {PREP_TYPES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </Field>
            </div>

            <Field label="태그">
              <div className="flex flex-wrap gap-2">
                {ALL_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm border ${form.tags.includes(tag) ? 'bg-orange-400 text-white border-orange-400' : 'border-gray-300'}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </Field>

            {form.prep_type !== '그냥먹기' && (
              <>
                <Field label="준비 방법 (줄바꿈으로 스텝 구분)">
                  <textarea
                    className={inputCls + ' h-24'}
                    value={form.prep_steps}
                    onChange={(e) => setForm({ ...form, prep_steps: e.target.value })}
                    placeholder={'180도 예열\n앞면 10분\n뒤집어서 5분'}
                  />
                </Field>
                <Field label="총 소요 시간 (분)">
                  <input className={inputCls} type="number" value={form.prep_time} onChange={(e) => setForm({ ...form, prep_time: e.target.value })} placeholder="15" />
                </Field>
              </>
            )}

            <Field label="이미지 URL">
              <input className={inputCls} value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
            </Field>

            <Field label="구매 링크">
              <input className={inputCls} value={form.purchase_url} onChange={(e) => setForm({ ...form, purchase_url: e.target.value })} />
            </Field>

            <Field label="링크">
              <div className="space-y-2">
                {form.links.map((link, i) => {
                  const update = (patch: Partial<SnackLink>) => {
                    const updated = [...form.links]
                    updated[i] = { ...updated[i], ...patch }
                    setForm((f) => ({ ...f, links: updated }))
                  }
                  return (
                    <div key={i} className="border rounded-lg p-3 space-y-2 relative">
                      <button
                        onClick={() => setForm((f) => ({ ...f, links: f.links.filter((_, j) => j !== i) }))}
                        className="absolute top-2 right-2 text-gray-300 hover:text-red-400 text-lg leading-none"
                      >
                        ×
                      </button>
                      {/* 타입 선택 */}
                      <div className="flex gap-2">
                        {(['recipe', 'product'] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => update({ type: t })}
                            className={`text-xs px-3 py-1 rounded-full border transition-colors ${link.type === t ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-300 text-gray-500'}`}
                          >
                            {t === 'recipe' ? '🎬 조리법' : '🛍️ 관련상품'}
                          </button>
                        ))}
                      </div>
                      <input
                        className={inputCls}
                        placeholder={link.type === 'recipe' ? '이름 (예: 지현맘)' : '이름 (예: 쿠팡)'}
                        value={link.label}
                        onChange={(e) => update({ label: e.target.value })}
                      />
                      <input
                        className={inputCls}
                        placeholder="https://..."
                        value={link.url}
                        onChange={(e) => update({ url: e.target.value })}
                      />
                    </div>
                  )
                })}
                <button
                  onClick={() => setForm((f) => ({ ...f, links: [...f.links, { label: '', url: '', type: 'recipe' }] }))}
                  className="text-xs text-orange-500 border border-orange-300 px-3 py-1.5 rounded"
                >
                  + 링크 추가
                </button>
              </div>
            </Field>

            {message && <p className="text-sm text-green-600">{message}</p>}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-orange-500 text-white py-2 rounded font-semibold disabled:opacity-50"
            >
              {saving ? '저장 중...' : editingId ? '수정 완료' : '저장하기'}
            </button>
          </section>
        </>
      )}

      {/* 요청 탭 */}
      {tab === 'requests' && (
        <section className="space-y-2">
          {requests.length === 0 && <p className="text-sm text-gray-400 text-center py-10">요청이 없어요</p>}
          {requests.map((r) => (
            <div key={r.id} className="border rounded-lg px-3 py-2 flex items-center gap-2">
              {/* 텍스트 */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{r.product_name}</p>
                {r.memo && <p className="text-xs text-gray-400 truncate">{r.memo}</p>}
              </div>

              {/* 상태 + 버튼 */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  r.status === 'done' ? 'bg-green-100 text-green-600' :
                  r.status === 'rejected' ? 'bg-red-100 text-red-400' :
                  'bg-orange-100 text-orange-500'
                }`}>
                  {r.status === 'done' ? '완료' : r.status === 'rejected' ? '거절' : '대기'}
                </span>

                {r.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        setForm({ ...emptyForm, name: r.product_name })
                        setPendingRequestId(r.id)
                        setTab('form')
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className="text-xs text-orange-500 border border-orange-300 px-2 py-0.5 rounded font-medium"
                    >
                      등록
                    </button>
                    <button
                      onClick={async () => {
                        await fetch(`/api/requests/${r.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'done' }) })
                        setRequests(prev => prev.map(x => x.id === r.id ? { ...x, status: 'done' } : x))
                      }}
                      className="text-xs text-green-600 border border-green-300 px-2 py-0.5 rounded"
                    >
                      완료
                    </button>
                  </>
                )}
                {r.status !== 'pending' && (
                  <button
                    onClick={async () => {
                      await fetch(`/api/requests/${r.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'pending' }) })
                      setRequests(prev => prev.map(x => x.id === r.id ? { ...x, status: 'pending' } : x))
                    }}
                    className="text-xs text-gray-400 border border-gray-200 px-2 py-0.5 rounded"
                  >
                    되돌리기
                  </button>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* 목록 탭 */}
      {tab === 'list' && (
        <section>
          <div className="grid grid-cols-2 gap-3">
            {snacks.map((s) => (
              <div key={s.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  {s.image_url && <img src={s.image_url} alt={s.name} className="w-10 h-10 object-cover rounded shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{s.name}</p>
                    <p className="text-xs text-gray-500 truncate">{s.category} · {s.price_approx}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(s)} className="flex-1 text-xs text-blue-500 border border-blue-300 py-1 rounded">수정</button>
                  <button onClick={() => { if (window.confirm(`"${s.name}" 을 삭제할까요?`)) handleDelete(s.id) }} className="flex-1 text-xs text-red-500 border border-red-300 py-1 rounded">삭제</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full border rounded px-3 py-2 text-sm'
