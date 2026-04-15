import { Snack, Category } from '@/types/snack'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const CATEGORIES: { name: Category; emoji: string; desc: string }[] = [
  { name: '냉동식품', emoji: '🧊', desc: '간편하게 즐기는 냉동 간식' },
  { name: '과자',     emoji: '🍪', desc: '손이 멈추지 않는 과자들' },
  { name: '라면·면·즉석', emoji: '🍜', desc: '뜨끈하고 간편한 한 끼' },
  { name: '음료',     emoji: '🥤', desc: '시원하고 달달한 음료' },
  { name: '편의점',   emoji: '🏪', desc: '편의점 인기 간식 모음' },
  { name: '야채',     emoji: '🥬', desc: '신선하고 건강한 야채류' },
  { name: '소스·양념·재료', emoji: '🫙', desc: '요리를 살리는 소스와 양념' },
  { name: '기타',     emoji: '🍱', desc: '그 외 다양한 먹거리' },
]

async function getSnacks(): Promise<Snack[]> {
  const { data } = await supabase.from('snacks').select('*').order('created_at', { ascending: false })
  return data || []
}

export const dynamic = 'force-dynamic'

export default async function CategoryIndexPage() {
  const snacks = await getSnacks()

  const grouped = CATEGORIES.map(({ name, emoji, desc }) => {
    const items = snacks.filter(s => s.category === name)
    return { name, emoji, desc, items, count: items.length }
  }).filter(g => g.count > 0)

  return (
    <main className="max-w-2xl mx-auto pb-24">
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold">카테고리</h1>
        <p className="text-sm text-gray-400 mt-0.5">총 {snacks.length}개 간식</p>
      </header>

      <div className="px-4 space-y-3">
        {grouped.map(({ name, emoji, desc, items, count }) => {
          const previews = items.slice(0, 4)
          const bestScore = Math.max(...items.map(i => i.value_score))

          return (
            <Link
              key={name}
              href={`/category/${encodeURIComponent(name)}`}
              className="block bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4 p-4">
                {/* 이모지 + 텍스트 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-2xl">{emoji}</span>
                    <span className="font-bold text-base">{name}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{count}개</span>
                  </div>
                  <p className="text-xs text-gray-400">{desc}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <span className="text-xs text-yellow-500">{'★'.repeat(bestScore)}</span>
                    <span className="text-xs text-gray-400">최고 가성비 {bestScore}.0</span>
                  </div>
                </div>

                {/* 미리보기 이미지 */}
                <div className="flex -space-x-2 shrink-0">
                  {previews.map((snack, i) => (
                    <div
                      key={snack.id}
                      className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-orange-50 shrink-0"
                      style={{ zIndex: previews.length - i }}
                    >
                      {snack.image_url
                        ? <img src={snack.image_url} alt={snack.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-sm">{emoji}</div>
                      }
                    </div>
                  ))}
                </div>

                <span className="text-gray-300 text-sm shrink-0">→</span>
              </div>

              {/* 상품 미리보기 가로 스크롤 */}
              <div className="flex gap-3 overflow-x-auto overflow-y-hidden scrollbar-hide px-4 pb-3 -mt-1">
                {items.slice(0, 8).map(snack => (
                  <div key={snack.id} className="shrink-0 w-28">
                    <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-50 mb-1">
                      {snack.image_url
                        ? <img src={snack.image_url} alt={snack.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-2xl">{emoji}</div>
                      }
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-tight">{snack.name}</p>
                    <p className="text-xs text-orange-500 font-bold mt-0.5">{snack.price_approx}</p>
                  </div>
                ))}
                {count > 8 && (
                  <div className="shrink-0 w-28 h-28 rounded-xl bg-orange-50 flex flex-col items-center justify-center gap-0.5">
                    <span className="text-orange-400 font-bold text-sm">+{count - 8}</span>
                    <span className="text-orange-300 text-xs">더보기</span>
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
