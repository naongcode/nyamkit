'use client'

import { useEffect, useState } from 'react'

interface Comment { id: string; nickname: string; text: string; created_at: string }

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '방금 전'
  if (mins < 60) return `${mins}분 전`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}시간 전`
  return `${Math.floor(hours / 24)}일 전`
}

const inputCls = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400'

export default function SnackReactions({ snackId, initialLikes }: { snackId: string; initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes)
  const [voted, setVoted] = useState(false)
  const [voterId, setVoterId] = useState('')

  const [comments, setComments] = useState<Comment[]>([])
  const [form, setForm] = useState({ nickname: '', password: '', text: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState<Record<string, string>>({})

  useEffect(() => {
    let id = localStorage.getItem('nyamkit_voter_id')
    if (!id) { id = crypto.randomUUID(); localStorage.setItem('nyamkit_voter_id', id) }
    setVoterId(id)
    const voted = JSON.parse(localStorage.getItem('nyamkit_voted_snacks') || '[]') as string[]
    setVoted(voted.includes(snackId))

    fetch(`/api/snacks/${snackId}/comments`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setComments(data) })
      .catch(() => {})
  }, [snackId])

  async function handleLike() {
    if (voted) return
    const res = await fetch(`/api/snacks/${snackId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voter_id: voterId }),
    })
    if (res.ok) {
      const { likes: newLikes } = await res.json()
      setLikes(newLikes)
      setVoted(true)
      const prev = JSON.parse(localStorage.getItem('nyamkit_voted_snacks') || '[]') as string[]
      localStorage.setItem('nyamkit_voted_snacks', JSON.stringify([...prev, snackId]))
    }
  }

  async function handleSubmit() {
    if (!form.nickname.trim() || !form.password.trim() || !form.text.trim()) {
      setError('닉네임, 비밀번호, 내용은 필수예요.')
      return
    }
    setSubmitting(true)
    setError('')
    const res = await fetch(`/api/snacks/${snackId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const comment = await res.json()
      setComments((cs) => [...cs, comment])
      setForm({ nickname: '', password: '', text: '' })
    } else {
      const { error } = await res.json()
      setError(error)
    }
    setSubmitting(false)
  }

  async function handleDelete(commentId: string) {
    const password = deleting[commentId]
    if (!password) return
    const res = await fetch(`/api/snacks/${snackId}/comments`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment_id: commentId, password }),
    })
    if (res.ok) {
      setComments((cs) => cs.filter((c) => c.id !== commentId))
    } else {
      alert('비밀번호가 틀렸어요.')
    }
    setDeleting((d) => { const { [commentId]: _, ...r } = d; return r })
  }

  return (
    <div className="space-y-5 mt-6">
      {/* 좋아요 */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleLike}
          disabled={voted}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-colors ${voted ? 'bg-orange-500 text-white' : 'border border-gray-300 text-gray-600 hover:border-orange-400 hover:text-orange-500'}`}
        >
          🍊 맛있겠다! {likes > 0 && <span>{likes}</span>}
        </button>
        {voted && <p className="text-xs text-gray-400">공감했어요</p>}
      </div>

      {/* 댓글 */}
      <div className="space-y-3">
        <h2 className="font-bold text-sm">💬 댓글 {comments.length > 0 && <span className="text-gray-400 font-normal">{comments.length}</span>}</h2>

        {/* 댓글 목록 */}
        {comments.length > 0 && (
          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-500 shrink-0 mt-0.5">
                  {c.nickname[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold">{c.nickname}</span>
                    <span className="text-xs text-gray-400">{timeAgo(c.created_at)}</span>
                    {deleting[c.id] !== undefined ? (
                      <span className="flex items-center gap-1 ml-auto">
                        <input
                          type="password"
                          placeholder="비밀번호"
                          className="text-xs border rounded px-1.5 py-0.5 w-20 focus:outline-none"
                          value={deleting[c.id]}
                          onChange={(e) => setDeleting((d) => ({ ...d, [c.id]: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleDelete(c.id) }}
                          autoFocus
                        />
                        <button onClick={() => handleDelete(c.id)} className="text-xs text-red-500">확인</button>
                        <button onClick={() => setDeleting((d) => { const { [c.id]: _, ...r } = d; return r })} className="text-xs text-gray-400">취소</button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setDeleting((d) => ({ ...d, [c.id]: '' }))}
                        className="text-xs text-gray-300 hover:text-gray-500 ml-auto"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mt-0.5">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 댓글 입력 */}
        <div className="border rounded-xl p-3 space-y-2 bg-gray-50">
          <div className="grid grid-cols-2 gap-2">
            <input className={inputCls} placeholder="닉네임" value={form.nickname}
              onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))} />
            <input type="password" className={inputCls} placeholder="비밀번호"
              value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <input className={inputCls} placeholder="맛 어때요? 후기 남겨주세요 😋"
              value={form.text} onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }} />
            <button onClick={handleSubmit} disabled={submitting}
              className="shrink-0 bg-orange-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50">
              등록
            </button>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  )
}
