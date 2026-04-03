import { promises as fs } from 'fs'
import path from 'path'
import { Snack } from '@/types/snack'
import SnackCard from '@/components/SnackCard'
import SnackCardSmall from '@/components/SnackCardSmall'
import RandomButton from '@/components/RandomButton'
import ScrollRow from '@/components/ScrollRow'

async function getSnacks(): Promise<Snack[]> {
  const file = await fs.readFile(path.join(process.cwd(), 'data', 'snacks.json'), 'utf-8')
  return JSON.parse(file)
}

export const dynamic = 'force-dynamic'

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export default async function Home() {
  const snacks = await getSnacks()
  const picks = shuffle(snacks.filter((s) => s.tags.includes('주인장픽'))).slice(0, 3)
  const categories = ['냉동식품', '과자', '라면·즉석', '음료', '편의점', '기타'] as const

  if (snacks.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-3xl font-bold">냠킷 🍱</h1>
        <p className="text-gray-500">냠냠이의 먹킷리스트</p>
        <p className="text-sm text-gray-400">아직 등록된 간식이 없어요. 어드민에서 추가해보세요!</p>
        <a href="/admin" className="inline-block mt-4 text-sm text-white bg-orange-500 px-4 py-2 rounded-full">어드민 바로가기</a>
      </main>
    )
  }

  return (
    <main className="max-w-2xl mx-auto px-4 pb-16">
      {/* 헤더 */}
      <header className="py-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest text-orange-400 uppercase mb-0.5">냠냠이의 먹킷리스트</p>
          <h1 className="text-2xl font-bold">냠킷 🍱</h1>
        </div>
        <div className="flex items-center gap-2">
          <RandomButton snacks={snacks} />
          <a href="/community" className="text-sm text-gray-500 border border-gray-300 px-3 py-2 rounded-full">커뮤니티</a>
          <a href="/admin" className="text-sm text-gray-400 border border-gray-300 px-3 py-2 rounded-full">어드민</a>
        </div>
      </header>

      {/* 주인장 픽 */}
      {picks.length > 0 && (
        <section className="mb-8 -mx-4 px-4 py-5 bg-orange-100 rounded-2xl">
          <h2 className="text-base font-bold mb-3">👑 주인장 픽</h2>
          <div className="grid grid-cols-3 gap-3">
            {picks.map((s) => <SnackCard key={s.id} snack={s} />)}
          </div>
        </section>
      )}

      {/* 카테고리별 */}
      {categories.map((cat) => {
        const items = shuffle(snacks.filter((s) => s.category === cat)).slice(0, 10)
        if (items.length === 0) return null
        return (
          <section key={cat} className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-gray-700">{cat}</h2>
              <a href={`/category/${encodeURIComponent(cat)}`} className="text-xs text-orange-500">더보기</a>
            </div>
            <ScrollRow>
              {items.map((s) => (
                <div key={s.id} className="w-36 sm:w-44 shrink-0">
                  <SnackCard snack={s} />
                </div>
              ))}
            </ScrollRow>
          </section>
        )
      })}
    </main>
  )
}
