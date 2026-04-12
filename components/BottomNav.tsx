'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/lib/useCart'

const NAV_ITEMS = [
  { href: '/', label: '홈', icon: Home },
  { href: '/combos', label: '꿀조합', icon: Honey },
  { href: '/cart', label: '찜 목록', icon: Cart },
  { href: '/community', label: '냠스타', icon: Star },
  { href: '/my', label: '마이', icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()
  const { items } = useCart()
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0)

  // 어드민/로그인/꿀조합 작성 페이지는 하단 탭 숨김
  if (pathname.startsWith('/admin') || pathname === '/login' || pathname === '/combos/new' || pathname.endsWith('/edit')) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-pb">
      <div className="max-w-2xl mx-auto flex">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          const isCart = href === '/cart'
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors ${
                isActive ? 'text-orange-500' : 'text-gray-500'
              }`}
            >
              <div className="relative">
                <Icon active={isActive} />
                {isCart && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-orange-500 text-white text-[10px] font-bold min-w-4 h-4 flex items-center justify-center rounded-full px-1">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <span className={`text-[11px] font-semibold ${isActive ? 'text-orange-500' : 'text-gray-500'}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

function Home({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  )
}

function Honey({ active }: { active: boolean }) {
  // 벌집(허니콤) 아이콘
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l4 2.5v5L12 12 8 9.5v-5L12 2z" />
      <path d="M16 9.5l4 2.5v5l-4 2.5-4-2.5v-5l4-2.5z" />
      <path d="M8 9.5l4 2.5v5l-4 2.5-4-2.5v-5l4-2.5z" />
    </svg>
  )
}

function Cart({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" fill="currentColor" />
      <circle cx="20" cy="21" r="1" fill="currentColor" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  )
}

function Star({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function User({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
