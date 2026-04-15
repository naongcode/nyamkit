'use client'

import { useEffect, useState } from 'react'

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState<any>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault()
      setPrompt(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 bg-white border border-orange-200 rounded-2xl shadow-lg p-4 flex items-center gap-3">
      <span className="text-2xl">🍱</span>
      <div className="flex-1">
        <p className="text-sm font-bold text-gray-800">냠킷 앱 설치</p>
        <p className="text-xs text-gray-400">홈화면에 추가하고 빠르게 접속해요</p>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setShow(false)} className="text-xs text-gray-400 px-2 py-1">닫기</button>
        <button onClick={handleInstall} className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-full font-medium">설치</button>
      </div>
    </div>
  )
}
