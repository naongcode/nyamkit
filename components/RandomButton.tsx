'use client'

import { useRouter } from 'next/navigation'
import { Snack } from '@/types/snack'

export default function RandomButton({ snacks }: { snacks: Snack[] }) {
  const router = useRouter()

  function handleRandom() {
    if (snacks.length === 0) return
    const pick = snacks[Math.floor(Math.random() * snacks.length)]
    router.push(`/snack/${pick.id}`)
  }

  return (
    <button
      onClick={handleRandom}
      className="text-gray-500 border border-gray-300 text-sm px-3 sm:px-4 py-2 rounded-full font-medium"
    >
      <span className="sm:hidden">🎲</span>
      <span className="hidden sm:inline">오늘 뭐 먹지? 🎲</span>
    </button>
  )
}
