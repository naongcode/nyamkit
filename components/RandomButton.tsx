'use client'

import { Snack } from '@/types/snack'

export default function RandomButton({ snacks }: { snacks: Snack[] }) {

  function handleRandom() {
    window.open('https://link.coupang.com/a/enA7f7', '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      onClick={handleRandom}
      className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 sm:px-4 py-2 rounded-full font-medium transition"
    >
      <span className="sm:hidden">쿠팡</span>
      <span className="hidden sm:inline">바로 쿠팡가기</span>
    </button>
  )
}
