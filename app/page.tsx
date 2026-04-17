import Image from 'next/image'
import { Snack, HoneyCombo } from '@/types/snack'
import SnackCard from '@/components/SnackCard'
import SnackCardSmall from '@/components/SnackCardSmall'
import RandomButton from '@/components/RandomButton'
import ScrollRow from '@/components/ScrollRow'
import { supabase } from '@/lib/supabase'

interface RankItem { id: string; snack_name: string; nickname: string; recommendations: number; image_url?: string }

async function getWeeklyRanking(): Promise<RankItem[]> {
  try {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 7)
    const { data, error } = await supabase
      .from('community_posts')
      .select('id, snack_name, nickname, recommendations, image_url')
      .gte('created_at', cutoff.toISOString())
      .gt('recommendations', 0)
      .order('recommendations', { ascending: false })
      .limit(5)
    if (error) console.error('[getWeeklyRanking error]', error)
    return data || []
  } catch (e) {
    console.error('[getWeeklyRanking exception]', e)
    return []
  }
}

async function getSnacks(): Promise<Snack[]> {
  try {
    const { data, error } = await supabase.from('snacks').select('*').order('created_at', { ascending: false })
    if (error) console.error('[getSnacks error]', error)
    return data || []
  } catch (e) {
    console.error('[getSnacks exception]', e)
    return []
  }
}

async function getRecentCombos(): Promise<HoneyCombo[]> {
  try {
    const { data, error } = await supabase
      .from('honey_combos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6)
    if (error) console.error('[getRecentCombos error]', error)
    return data || []
  } catch (e) {
    console.error('[getRecentCombos exception]', e)
    return []
  }
}

export const revalidate = 60 // 60초 캐시

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export default async function Home() {
  const [snacks, ranking, combos] = await Promise.all([getSnacks(), getWeeklyRanking(), getRecentCombos()])
  const picks = shuffle(snacks.filter((s) => s.tags.includes('냠킷PICK'))).slice(0, 3)

  // 상품이 있는 카테고리 중 랜덤 1개
  const categories = ['냉동식품', '과자', '라면·면·즉석', '음료', '편의점', '야채', '소스·양념·재료', '기타'] as const
  const filledCategories = categories.filter((cat) => snacks.some((s) => s.category === cat))
  const randomCat = shuffle(filledCategories)[0]
  const randomCatItems = randomCat ? shuffle(snacks.filter((s) => s.category === randomCat)).slice(0, 10) : []

  if (snacks.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-3xl font-bold">냠킷 🍱</h1>
        <p className="text-gray-500">냠냠이의 먹킷리스트</p>
        <p className="text-sm text-gray-400">아직 등록된 간식이 없어요.</p>
      </main>
    )
  }

  return (
    <main className="max-w-2xl mx-auto px-4 pb-24">
      {/* 헤더 */}
      <header className="py-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="냠킷 로고" className="w-12 h-12" />
            <div>
              <p className="text-xs font-semibold tracking-widest text-orange-400 uppercase mb-0.5">냠냠이의 먹킷리스트</p>
              <h1 className="text-2xl font-bold">냠킷</h1>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RandomButton snacks={snacks} />
        </div>
      </header>

      {/* 쿠팡 파트너스 고지 */}
      <p className="text-xs text-gray-400 mb-6 leading-relaxed">
        이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
      </p>

      {/* 주인장 픽 */}
      {picks.length > 0 && (
        <section className="mb-8 -mx-4 px-4 py-5 bg-orange-100 rounded-2xl">
          <h2 className="text-base font-bold mb-3">✨ 냠킷 PICK</h2>
          <div className="grid grid-cols-3 gap-3">
            {picks.map((s) => <SnackCard key={s.id} snack={s} />)}
          </div>
        </section>
      )}

      {/* 냠스타 주간랭킹 */}
      {ranking.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold">⭐ 냠스타 주간랭킹</h2>
            <a href="/community" className="text-xs text-orange-500">냠스타 보기</a>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {ranking.slice(0, 3).map((item, i) => {
              const medal = ['🥇', '🥈', '🥉'][i]
              const cardStyle = [
                'border-2 border-yellow-400 shadow-md shadow-yellow-100',
                'border-2 border-gray-300 shadow-sm',
                'border-2 border-orange-300 shadow-sm shadow-orange-100',
              ][i]
              return (
                <a key={item.id} href="/community" className={`rounded-2xl overflow-hidden bg-white ${cardStyle}`}>
                  <div className="relative aspect-square">
                    {item.image_url
                      ? <Image src={item.image_url} alt={item.snack_name} fill className="object-cover" sizes="33vw" />
                      : <div className="w-full h-full bg-orange-50 flex items-center justify-center text-3xl">🍱</div>
                    }
                    <span className="absolute bottom-1.5 right-1.5 bg-black/50 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">👍 {item.recommendations}</span>
                  </div>
                  <div className="px-2 py-2">
                    <p className="text-sm">{medal}</p>
                    <p className="text-xs font-bold line-clamp-2 leading-snug mt-0.5">{item.snack_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.nickname}</p>
                  </div>
                </a>
              )
            })}
          </div>
        </section>
      )}

      {/* 꿀조합 */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold">🍯 꿀조합</h2>
          <a href="/combos" className="text-xs text-orange-500">전체보기</a>
        </div>
        {combos.length === 0 ? (
          <div className="rounded-2xl bg-orange-50 py-10 flex flex-col items-center gap-2 text-center">
            <span className="text-3xl">🍯</span>
            <p className="text-sm font-medium text-gray-600">아직 꿀조합이 없어요</p>
            <a href="/combos/new" className="mt-1 text-xs bg-orange-500 text-white px-4 py-1.5 rounded-full font-medium">첫 조합 올리기</a>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {combos.map((combo) => {
              const snackMap = Object.fromEntries(snacks.map((s) => [s.id, s]))
              const thumb = combo.image_url
                || combo.items.map(i => i.type === 'existing' && i.snack_id ? snackMap[i.snack_id]?.image_url : null).find(Boolean)
                || null
              return (
                <a key={combo.id} href={`/combos/${combo.id}`} className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm active:scale-95 transition-transform">
                  <div className="relative aspect-square">
                    {thumb
                      ? <Image src={thumb} alt={combo.title} fill className="object-cover" sizes="33vw" />
                      : <div className="w-full h-full bg-orange-50 flex items-center justify-center text-3xl">🍯</div>
                    }
                  </div>
                  <div className="px-2 py-2">
                    <p className="text-xs font-bold line-clamp-1">{combo.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{combo.items.length}가지</p>
                  </div>
                </a>
              )
            })}
          </div>
        )}
        <a href="/combos/new" className="mt-3 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-dashed border-orange-300 text-orange-500 text-sm font-medium">
          <span>+</span> 꿀조합 올리기
        </a>
      </section>

      {/* 랜덤 카테고리 */}
      {randomCat && randomCatItems.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-gray-700">🎲 {randomCat}</h2>
              <a href="/category" className="text-xs text-gray-400 border border-gray-200 rounded-full px-2 py-0.5">전체 카테고리</a>
            </div>
            <a href={`/category/${encodeURIComponent(randomCat)}`} className="text-xs text-orange-500">전체보기</a>
          </div>
          <ScrollRow>
            {randomCatItems.map((s) => (
              <div key={s.id} className="w-36 sm:w-44 shrink-0">
                <SnackCard snack={s} />
              </div>
            ))}
          </ScrollRow>
        </section>
      )}
    </main>
  )
}
