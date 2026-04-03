'use client'

import { useEffect, useRef, useState } from 'react'
import { PublicPost } from '@/types/community'

function formatPrice(raw: string) {
  const num = Number(raw.replace(/[^0-9]/g, ''))
  if (!num) return raw
  return `₩${num.toLocaleString('ko-KR')}`
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '방금 전'
  if (mins < 60) return `${mins}분 전`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}시간 전`
  return `${Math.floor(hours / 24)}일 전`
}

interface RankItem { id: string; snack_name: string; nickname: string; recommendations: number; image_url?: string }

const emptyWrite = { nickname: '', password: '', snack_name: '', short_desc: '', price_approx: '', purchase_url: '', image_url: '' }
const emptyComment = { nickname: '', password: '', text: '' }
const inputCls = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400'

export default function CommunityFeed() {
  const [posts, setPosts] = useState<PublicPost[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState(false)
  const [offset, setOffset] = useState(0)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const LIMIT = 10

  const [voterId, setVoterId] = useState('')
  const [votedPosts, setVotedPosts] = useState<Set<string>>(new Set())
  const [showForm, setShowForm] = useState(false)
  const [writeForm, setWriteForm] = useState(emptyWrite)
  const [submitting, setSubmitting] = useState(false)
  const [writeError, setWriteError] = useState('')

  const [commentInputs, setCommentInputs] = useState<Record<string, typeof emptyComment>>({})
  const [deletingPost, setDeletingPost] = useState<Record<string, string>>({})
  const [deletingComment, setDeletingComment] = useState<Record<string, string>>({})
  const [editingPost, setEditingPost] = useState<Record<string, { password: string; step: 'auth' | 'form'; form: typeof emptyWrite }>>({})

  const [ranking, setRanking] = useState<RankItem[]>([])
  const [rankPeriod, setRankPeriod] = useState<'week' | 'month'>('week')

  useEffect(() => {
    let id = localStorage.getItem('nyamkit_voter_id')
    if (!id) { id = crypto.randomUUID(); localStorage.setItem('nyamkit_voter_id', id) }
    setVoterId(id)
    const voted: string[] = JSON.parse(localStorage.getItem('nyamkit_voted_community') || '[]')
    setVotedPosts(new Set(voted))
    fetchPosts(0)
  }, [])

  useEffect(() => {
    fetch(`/api/community/ranking?period=${rankPeriod}`)
      .then((r) => r.json())
      .then(setRanking)
      .catch(() => {})
  }, [rankPeriod])

  // IntersectionObserver — 맨 아래 sentinel 감지
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) fetchMore() },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, error, offset])

  async function fetchPosts(off: number) {
    try {
      const res = await fetch(`/api/community?offset=${off}&limit=${LIMIT}`)
      if (!res.ok) throw new Error()
      const { posts: newPosts, hasMore: more } = await res.json()
      setPosts(newPosts)
      setHasMore(more)
      setOffset(LIMIT)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  async function fetchMore() {
    if (!hasMore || loadingMore || error) return
    setLoadingMore(true)
    try {
      const res = await fetch(`/api/community?offset=${offset}&limit=${LIMIT}`)
      if (!res.ok) throw new Error()
      const { posts: newPosts, hasMore: more } = await res.json()
      setPosts((ps) => [...ps, ...newPosts])
      setHasMore(more)
      setOffset((o) => o + LIMIT)
    } catch {
      setError(true)
    } finally {
      setLoadingMore(false)
    }
  }

  async function handleSubmitPost() {
    if (!writeForm.snack_name.trim() || !writeForm.nickname.trim() || !writeForm.password.trim()) {
      setWriteError('닉네임, 비밀번호, 간식 이름은 필수예요.')
      return
    }
    setSubmitting(true)
    setWriteError('')
    const res = await fetch('/api/community', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(writeForm),
    })
    if (res.ok) {
      const newPost = await res.json()
      setPosts((ps) => [newPost, ...ps])
      setWriteForm(emptyWrite)
      setShowForm(false)
    } else {
      const { error } = await res.json()
      setWriteError(error)
    }
    setSubmitting(false)
  }

  async function handleRecommend(postId: string) {
    if (votedPosts.has(postId)) return
    const res = await fetch(`/api/community/${postId}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voter_id: voterId }),
    })
    if (res.ok) {
      const { recommendations } = await res.json()
      setPosts((ps) => ps.map((p) => p.id === postId ? { ...p, recommendations } : p))
      const next = new Set([...votedPosts, postId])
      setVotedPosts(next)
      localStorage.setItem('nyamkit_voted_community', JSON.stringify([...next]))
    }
  }

  async function handleSubmitComment(postId: string) {
    const input = commentInputs[postId] || emptyComment
    if (!input.text.trim() || !input.nickname.trim() || !input.password.trim()) return
    const res = await fetch(`/api/community/${postId}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (res.ok) {
      const comment = await res.json()
      setPosts((ps) => ps.map((p) => p.id === postId ? { ...p, comments: [...p.comments, comment] } : p))
      setCommentInputs((ci) => ({ ...ci, [postId]: { ...input, text: '' } }))
    }
  }

  function handleEditAuth(postId: string) {
    const state = editingPost[postId]
    if (!state || !state.password.trim()) return
    const post = posts.find((p) => p.id === postId)
    if (!post) return
    setEditingPost((ep) => ({
      ...ep,
      [postId]: {
        ...state,
        step: 'form',
        form: {
          nickname: post.nickname,
          password: state.password,
          snack_name: post.snack_name,
          short_desc: post.short_desc ?? '',
          price_approx: post.price_approx ?? '',
          purchase_url: post.purchase_url ?? '',
          image_url: post.image_url ?? '',
        },
      },
    }))
  }

  async function handleEditSubmit(postId: string) {
    const state = editingPost[postId]
    if (!state || state.step !== 'form') return
    const res = await fetch(`/api/community/${postId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: state.password, ...state.form }),
    })
    if (res.ok) {
      const updated = await res.json()
      setPosts((ps) => ps.map((p) => p.id === postId ? { ...p, ...updated } : p))
      setEditingPost((ep) => { const { [postId]: _, ...r } = ep; return r })
    } else {
      const { error } = await res.json()
      alert(error ?? '수정에 실패했어요.')
    }
  }

  async function handleDeletePost(postId: string) {
    const password = deletingPost[postId]
    if (!password) return
    const res = await fetch(`/api/community/${postId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      setPosts((ps) => ps.filter((p) => p.id !== postId))
    } else {
      alert('비밀번호가 틀렸어요.')
    }
    setDeletingPost((dp) => { const { [postId]: _, ...r } = dp; return r })
  }

  async function handleDeleteComment(postId: string, commentId: string) {
    const password = deletingComment[commentId]
    if (!password) return
    const res = await fetch(`/api/community/${postId}/comment`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment_id: commentId, password }),
    })
    if (res.ok) {
      setPosts((ps) => ps.map((p) => p.id === postId ? { ...p, comments: p.comments.filter((c) => c.id !== commentId) } : p))
    } else {
      alert('비밀번호가 틀렸어요.')
    }
    setDeletingComment((dc) => { const { [commentId]: _, ...r } = dc; return r })
  }

  return (
    <main className="max-w-lg mx-auto pb-16">
      {/* 헤더 */}
      <header className="px-4 pt-6 pb-4">
        <a href="/" className="text-sm text-orange-500 border border-orange-300 px-3 py-1.5 rounded-full">홈으로</a>
        <div className="mt-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">냠킷 커뮤니티 🍜</h1>
            <p className="text-sm text-gray-500 mt-1">혼자 알기 아까운 간식 공유하자</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="shrink-0 bg-orange-500 text-white text-sm px-4 py-2 rounded-full font-semibold hover:bg-orange-600 transition-colors"
            >
              공유하기
            </button>
          )}
        </div>
      </header>

      {/* 랭킹 */}
      <div className="px-4 mb-5">
        <div className="bg-white border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <h2 className="text-sm font-bold">🏆 추천 랭킹</h2>
            <div className="flex gap-1">
              {(['week', 'month'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setRankPeriod(p)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${rankPeriod === p ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-300 text-gray-500'}`}
                >
                  {p === 'week' ? '주간' : '월간'}
                </button>
              ))}
            </div>
          </div>
          {ranking.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">아직 추천받은 간식이 없어요</p>
          ) : (
            <ol className="grid grid-cols-3 gap-2 px-3 pb-3">
              {ranking.slice(0, 3).map((item, i) => (
                <li key={item.id} className="flex flex-col items-center text-center gap-1.5">
                  <span className={`text-xs font-black ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-400' : 'text-orange-300'}`}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                  </span>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.snack_name} className="w-28 h-28 rounded-xl object-cover bg-gray-100" />
                  ) : (
                    <div className="w-28 h-28 rounded-xl bg-orange-50 flex items-center justify-center text-3xl">🍱</div>
                  )}
                  <div className="w-full">
                    <p className="text-xs font-semibold line-clamp-1">{item.snack_name}</p>
                    <p className="text-xs text-orange-500 font-bold">👍 {item.recommendations}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* 글쓰기 */}
      <div className="px-4 mb-6">
        {!showForm ? null : (
          <div className="border border-orange-200 rounded-xl p-4 space-y-3 bg-orange-50">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm">꿀템 공유하기</h2>
              <button onClick={() => { setShowForm(false); setWriteError('') }} className="text-gray-400 text-xl leading-none">×</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input className={inputCls} placeholder="닉네임 *" value={writeForm.nickname} onChange={(e) => setWriteForm((f) => ({ ...f, nickname: e.target.value }))} />
              <input className={inputCls} placeholder="비밀번호 *" type="password" value={writeForm.password} onChange={(e) => setWriteForm((f) => ({ ...f, password: e.target.value }))} />
            </div>
            <input className={inputCls} placeholder="간식 이름 *" value={writeForm.snack_name} onChange={(e) => setWriteForm((f) => ({ ...f, snack_name: e.target.value }))} />
            <input className={inputCls} placeholder="한 줄 설명 (예: 전자레인지 3분, 이거 진짜 맛있음)" value={writeForm.short_desc} onChange={(e) => setWriteForm((f) => ({ ...f, short_desc: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  className={inputCls}
                  placeholder="가격 (숫자만, 예: 11900)"
                  type="number"
                  value={writeForm.price_approx}
                  onChange={(e) => setWriteForm((f) => ({ ...f, price_approx: e.target.value.replace(/[^0-9]/g, '') }))}
                />
                {writeForm.price_approx && (
                  <p className="text-xs text-orange-500 mt-1">{formatPrice(writeForm.price_approx)}</p>
                )}
              </div>
              <input className={inputCls} placeholder="구매링크 URL" value={writeForm.purchase_url} onChange={(e) => setWriteForm((f) => ({ ...f, purchase_url: e.target.value }))} />
            </div>
            <input className={inputCls} placeholder="이미지 URL (선택)" value={writeForm.image_url} onChange={(e) => setWriteForm((f) => ({ ...f, image_url: e.target.value }))} />
            {writeError && <p className="text-xs text-red-500">{writeError}</p>}
            <button
              onClick={handleSubmitPost}
              disabled={submitting}
              className="w-full bg-orange-500 text-white py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50 hover:bg-orange-600 transition-colors"
            >
              {submitting ? '올리는 중...' : '공유하기'}
            </button>
          </div>
        )}
      </div>

      {/* 피드 */}
      {loading ? (
        <p className="text-center text-gray-400 py-16 text-sm">불러오는 중...</p>
      ) : error && posts.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <p className="text-3xl">⚠️</p>
          <p className="text-gray-500 text-sm">불러오지 못했어요</p>
          <button onClick={() => { setError(false); setLoading(true); fetchPosts(0) }} className="text-xs text-orange-500 border border-orange-300 px-3 py-1.5 rounded-full">다시 시도</button>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <p className="text-4xl">🍱</p>
          <p className="text-gray-500 text-sm">아직 공유된 꿀템이 없어요</p>
          <p className="text-gray-400 text-xs">첫 번째로 올려보세요!</p>
        </div>
      ) : (
        <div className="space-y-5 px-4">
          {posts.map((post) => {
            const voted = votedPosts.has(post.id)
            const commentInput = commentInputs[post.id] || emptyComment
            const setCommentInput = (patch: Partial<typeof emptyComment>) =>
              setCommentInputs((ci) => ({ ...ci, [post.id]: { ...commentInput, ...patch } }))

            return (
              <article key={post.id} className="bg-white border rounded-2xl overflow-hidden">
                <div className="p-3 space-y-2">
                  {/* 작성자 + 수정/삭제 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-500 shrink-0">
                        {post.nickname[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{post.nickname}</p>
                        <p className="text-xs text-gray-400">{timeAgo(post.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {deletingPost[post.id] !== undefined ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="password"
                            placeholder="비밀번호"
                            className="text-xs border rounded px-2 py-1 w-20 focus:outline-none focus:border-orange-400"
                            value={deletingPost[post.id]}
                            onChange={(e) => setDeletingPost((dp) => ({ ...dp, [post.id]: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleDeletePost(post.id) }}
                            autoFocus
                          />
                          <button onClick={() => handleDeletePost(post.id)} className="text-xs text-red-500">확인</button>
                          <button onClick={() => setDeletingPost((dp) => { const { [post.id]: _, ...r } = dp; return r })} className="text-xs text-gray-400">취소</button>
                        </div>
                      ) : !editingPost[post.id] && (
                        <>
                          <button
                            onClick={() => setEditingPost((ep) => ({ ...ep, [post.id]: { password: '', step: 'auth', form: emptyWrite } }))}
                            className="text-xs text-gray-300 hover:text-gray-500 transition-colors"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => setDeletingPost((dp) => ({ ...dp, [post.id]: '' }))}
                            className="text-xs text-gray-300 hover:text-gray-500 transition-colors"
                          >
                            삭제
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 수정 — 비밀번호 확인 */}
                  {editingPost[post.id]?.step === 'auth' && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="password"
                        placeholder="비밀번호 확인"
                        className="text-xs border rounded px-2 py-1 w-28 focus:outline-none focus:border-orange-400"
                        value={editingPost[post.id].password}
                        onChange={(e) => setEditingPost((ep) => ({ ...ep, [post.id]: { ...ep[post.id], password: e.target.value } }))}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleEditAuth(post.id) }}
                        autoFocus
                      />
                      <button onClick={() => handleEditAuth(post.id)} className="text-xs text-orange-500 font-semibold">확인</button>
                      <button onClick={() => setEditingPost((ep) => { const { [post.id]: _, ...r } = ep; return r })} className="text-xs text-gray-400">취소</button>
                    </div>
                  )}

                  {/* 수정 폼 */}
                  {editingPost[post.id]?.step === 'form' && (
                    <div className="border border-orange-200 rounded-xl p-3 space-y-2 bg-orange-50 mt-1">
                      <input className={inputCls} placeholder="간식 이름 *" value={editingPost[post.id].form.snack_name}
                        onChange={(e) => setEditingPost((ep) => ({ ...ep, [post.id]: { ...ep[post.id], form: { ...ep[post.id].form, snack_name: e.target.value } } }))} />
                      <input className={inputCls} placeholder="한 줄 설명" value={editingPost[post.id].form.short_desc}
                        onChange={(e) => setEditingPost((ep) => ({ ...ep, [post.id]: { ...ep[post.id], form: { ...ep[post.id].form, short_desc: e.target.value } } }))} />
                      <div className="grid grid-cols-2 gap-2">
                        <input className={inputCls} placeholder="가격 (숫자만)" type="number" value={editingPost[post.id].form.price_approx}
                          onChange={(e) => setEditingPost((ep) => ({ ...ep, [post.id]: { ...ep[post.id], form: { ...ep[post.id].form, price_approx: e.target.value.replace(/[^0-9]/g, '') } } }))} />
                        <input className={inputCls} placeholder="구매링크 URL" value={editingPost[post.id].form.purchase_url}
                          onChange={(e) => setEditingPost((ep) => ({ ...ep, [post.id]: { ...ep[post.id], form: { ...ep[post.id].form, purchase_url: e.target.value } } }))} />
                      </div>
                      <input className={inputCls} placeholder="이미지 URL" value={editingPost[post.id].form.image_url}
                        onChange={(e) => setEditingPost((ep) => ({ ...ep, [post.id]: { ...ep[post.id], form: { ...ep[post.id].form, image_url: e.target.value } } }))} />
                      <div className="flex gap-2">
                        <button onClick={() => handleEditSubmit(post.id)} className="flex-1 bg-orange-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors">저장</button>
                        <button onClick={() => setEditingPost((ep) => { const { [post.id]: _, ...r } = ep; return r })} className="px-4 py-2 border rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors">취소</button>
                      </div>
                    </div>
                  )}

                  {/* 간식 제목 + 가격 */}
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-base">{post.snack_name}</p>
                    {(post.price_approx || post.purchase_url) && (
                      <div className="text-right shrink-0">
                        {post.price_approx && <p className="text-sm font-bold text-orange-500">{formatPrice(post.price_approx)}</p>}
                        {post.purchase_url && (
                          <a href={post.purchase_url} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-blue-500 underline underline-offset-2">구매링크 →</a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 이미지 */}
                  {post.image_url && (
                    <div className="rounded-xl overflow-hidden bg-gray-100">
                      <img src={post.image_url} alt={post.snack_name} className="w-full max-h-72 object-cover" />
                    </div>
                  )}

                  {/* 한 줄 설명 */}
                  {post.short_desc && <p className="text-sm text-gray-600">{post.short_desc}</p>}

                  {/* 추천 */}
                  <div className="flex items-center gap-3 mt-2 pt-2 border-t">
                    <button
                      onClick={() => handleRecommend(post.id)}
                      disabled={voted}
                      className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-colors ${voted ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-300 text-gray-600 hover:border-orange-300 hover:text-orange-500'}`}
                    >
                      👍 추천 {post.recommendations}
                    </button>
                    <span className="text-xs text-gray-400">💬 댓글 {post.comments.length}</span>
                  </div>
                </div>

                {/* 댓글 목록 */}
                {post.comments.length > 0 && (
                  <div className="border-t bg-gray-50 px-3 py-2 space-y-2">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0 mt-0.5">
                          {comment.nickname[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-semibold">{comment.nickname}</span>
                            <span className="text-xs text-gray-400">{timeAgo(comment.created_at)}</span>
                            {deletingComment[comment.id] !== undefined ? (
                              <span className="flex items-center gap-1 ml-auto">
                                <input
                                  type="password"
                                  placeholder="비밀번호"
                                  className="text-xs border rounded px-1.5 py-0.5 w-20 focus:outline-none"
                                  value={deletingComment[comment.id]}
                                  onChange={(e) => setDeletingComment((dc) => ({ ...dc, [comment.id]: e.target.value }))}
                                  onKeyDown={(e) => { if (e.key === 'Enter') handleDeleteComment(post.id, comment.id) }}
                                  autoFocus
                                />
                                <button onClick={() => handleDeleteComment(post.id, comment.id)} className="text-xs text-red-500">확인</button>
                                <button onClick={() => setDeletingComment((dc) => { const { [comment.id]: _, ...r } = dc; return r })} className="text-xs text-gray-400">취소</button>
                              </span>
                            ) : (
                              <button
                                onClick={() => setDeletingComment((dc) => ({ ...dc, [comment.id]: '' }))}
                                className="text-xs text-gray-300 hover:text-gray-400 ml-auto"
                              >
                                삭제
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mt-0.5">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 댓글 입력 */}
                <div className="border-t px-3 py-2 space-y-1.5">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className="border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-orange-400"
                      placeholder="닉네임"
                      value={commentInput.nickname}
                      onChange={(e) => setCommentInput({ nickname: e.target.value })}
                    />
                    <input
                      type="password"
                      className="border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-orange-400"
                      placeholder="비밀번호"
                      value={commentInput.password}
                      onChange={(e) => setCommentInput({ password: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-orange-400"
                      placeholder="댓글 남기기..."
                      value={commentInput.text}
                      onChange={(e) => setCommentInput({ text: e.target.value })}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSubmitComment(post.id) }}
                    />
                    <button
                      onClick={() => handleSubmitComment(post.id)}
                      className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-colors shrink-0"
                    >
                      등록
                    </button>
                  </div>
                </div>
              </article>
            )
          })}

          {/* sentinel + 하단 상태 */}
          <div ref={sentinelRef} className="py-4 text-center">
            {loadingMore && <p className="text-xs text-gray-400">불러오는 중...</p>}
            {error && <p className="text-xs text-red-400">불러오지 못했어요 — 스크롤을 올렸다 내려보세요</p>}
            {!hasMore && !error && <p className="text-xs text-gray-300">모두 불러왔어요</p>}
          </div>
        </div>
      )}
    </main>
  )
}
