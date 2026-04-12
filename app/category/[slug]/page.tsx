import { notFound } from 'next/navigation'
import { Snack, PrepType, Category } from '@/types/snack'
import SnackCard from '@/components/SnackCard'
import { supabase } from '@/lib/supabase'

const PREP_TYPES: PrepType[] = ['그냥먹기', '전자레인지', '에어프라이어', '끓이기', '전기밥솥']
const CATEGORIES: Category[] = ['냉동식품', '과자', '라면·즉석', '음료', '편의점', '야채', '소스·양념', '기타']

async function getSnacks(): Promise<Snack[]> {
  const { data } = await supabase.from('snacks').select('*').order('created_at', { ascending: false })
  return data || []
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ prep?: string; sort?: string }>
}) {
  const { slug } = await params
  const { prep, sort } = await searchParams
  const category = decodeURIComponent(slug)

  const all = await getSnacks()
  const inCategory = all.filter((s) => s.category === category)
  if (inCategory.length === 0) notFound()

  // 데이터 있는 카테고리만
  const activeCategories = CATEGORIES.filter((c) => all.some((s) => s.category === c))

  let filtered = prep ? inCategory.filter((s) => s.prep_type === prep) : inCategory
  if (sort === 'value') {
    filtered = [...filtered].sort((a, b) => b.value_score - a.value_score)
  } else {
    filtered = [...filtered].sort((a, b) => b.created_at.localeCompare(a.created_at))
  }

  return (
    <main className="max-w-2xl mx-auto pb-24">
      <header className="px-4 py-5 flex items-center gap-3">
        <a href="/" className="text-gray-400 text-sm">←</a>
        <h1 className="text-xl font-bold">{category}</h1>
        <span className="text-sm text-gray-400">{filtered.length}개</span>
      </header>

      {/* 카테고리 탭 */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pb-3 mb-2">
        <a
          href="/category"
          className="shrink-0 text-sm px-4 py-1.5 rounded-full border font-medium transition-colors border-gray-300 text-gray-500"
        >
          전체
        </a>
        {activeCategories.map((cat) => (
          <a
            key={cat}
            href={`/category/${encodeURIComponent(cat)}`}
            className={`shrink-0 text-sm px-4 py-1.5 rounded-full border font-medium transition-colors ${cat === category ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 text-gray-500'}`}
          >
            {cat}
          </a>
        ))}
      </div>

      <div className="px-4">
      {/* 필터 */}
      <div className="flex gap-2 flex-wrap mb-4">
        <a
          href={`/category/${slug}${sort ? `?sort=${sort}` : ''}`}
          className={`text-xs px-3 py-1.5 rounded-full border ${!prep ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-300 text-gray-600'}`}
        >
          전체
        </a>
        {PREP_TYPES.map((p) => (
          <a
            key={p}
            href={`/category/${slug}?prep=${encodeURIComponent(p)}${sort ? `&sort=${sort}` : ''}`}
            className={`text-xs px-3 py-1.5 rounded-full border ${prep === p ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-300 text-gray-600'}`}
          >
            {p}
          </a>
        ))}
      </div>

      {/* 정렬 */}
      <div className="flex gap-2 mb-5">
        <a
          href={`/category/${slug}${prep ? `?prep=${encodeURIComponent(prep)}` : ''}`}
          className={`text-xs px-3 py-1.5 rounded-full border ${!sort || sort === 'latest' ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-300 text-gray-600'}`}
        >
          최신순
        </a>
        <a
          href={`/category/${slug}?${prep ? `prep=${encodeURIComponent(prep)}&` : ''}sort=value`}
          className={`text-xs px-3 py-1.5 rounded-full border ${sort === 'value' ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-300 text-gray-600'}`}
        >
          가성비순
        </a>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {filtered.map((s) => <SnackCard key={s.id} snack={s} />)}
      </div>
      </div>
    </main>
  )
}
