'use client'

import { useRef } from 'react'

interface Props {
  children: React.ReactNode
}

export default function ScrollRow({ children }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    ref.current?.scrollBy({ left: dir === 'right' ? 220 : -220, behavior: 'smooth' })
  }

  return (
    <div className="relative -mx-4">
      {/* 왼쪽 버튼 (데스크탑만) */}
      <button
        onClick={() => scroll('left')}
        className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center bg-white border border-gray-200 rounded-full shadow-sm text-gray-500 hover:text-orange-500 hover:border-orange-300 transition-colors"
      >
        ‹
      </button>

      {/* 스크롤 영역 */}
      <div
        ref={ref}
        className="flex gap-3 overflow-x-auto pb-2 px-4 sm:px-10 scrollbar-hide"
      >
        {children}
      </div>

      {/* 오른쪽 버튼 (데스크탑만) */}
      <button
        onClick={() => scroll('right')}
        className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center bg-white border border-gray-200 rounded-full shadow-sm text-gray-500 hover:text-orange-500 hover:border-orange-300 transition-colors"
      >
        ›
      </button>
    </div>
  )
}
