import { notFound } from 'next/navigation'
import { Snack } from '@/types/snack'
import ShareButton from '@/components/ShareButton'
import SnackReactions from '@/components/SnackReactions'
import AddToCartButton from '@/components/AddToCartButton'
import { supabase } from '@/lib/supabase'

async function getSnack(id: string): Promise<Snack | null> {
  const { data } = await supabase.from('snacks').select('*').eq('id', id).single()
  return data || null
}

const PREP_EMOJI: Record<string, string> = {
  '그냥먹기': '🍬',
  '전자레인지': '📡',
  '에어프라이어': '🌬️',
  '끓이기': '🍲',
  '전기밥솥': '🍚',
}

export default async function SnackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const snack = await getSnack(id)
  if (!snack) notFound()

  const priceNum = Number(snack.price_approx.replace(/[^0-9]/g, ''))
  const gramsNum = Number(snack.volume?.replace(/[^0-9]/g, '') ?? '0')
  const volumeUnit = snack.volume?.replace(/[0-9]/g, '').trim() || 'g'
  const volumeDisplay = gramsNum >= 1000 ? `${(gramsNum / 1000).toFixed(1)}k${volumeUnit}` : `${gramsNum}${volumeUnit}`
  const perHundredG = priceNum && gramsNum ? Math.round((priceNum / gramsNum) * 100).toLocaleString('ko-KR') : null

  return (
    <main className="max-w-lg mx-auto pb-24">
      {/* 뒤로가기 */}
      <div className="px-4 pt-4 pb-4">
        <a href="/" className="text-sm text-orange-500 border border-orange-300 px-3 py-1.5 rounded-full">홈으로</a>
      </div>

      {/* 이미지 + 기본 정보 */}
      <div className="px-4 flex flex-col sm:flex-row gap-4">
        {/* 이미지 */}
        <div className="shrink-0 rounded-2xl overflow-hidden bg-gray-100 shadow-sm mx-auto sm:mx-0">
          {snack.image_url ? (
            <img src={snack.image_url} alt={snack.name} className="h-52 w-auto object-contain" />
          ) : (
            <div className="h-52 w-52 flex items-center justify-center text-5xl">🍱</div>
          )}
        </div>

        {/* 태그 + 이름 + 별점 + 가격 */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-3 sm:pl-2">
          {/* 상단 */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap gap-1">
              <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full font-medium">{snack.category}</span>
              {snack.tags.map((tag) => (
                <span key={tag} className="bg-orange-100 text-orange-500 text-xs px-2 py-0.5 rounded-full font-medium">{tag}</span>
              ))}
            </div>
            <h1 className="text-lg font-bold leading-snug">{snack.name}</h1>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black" style={{ color: '#FBBF24' }}>
                {'★'.repeat(snack.value_score)}{'☆'.repeat(5 - snack.value_score)}
              </span>
              <span className="text-xs text-gray-400">가격점수{snack.value_score}.0 / 5</span>
            </div>
          </div>

          {/* 하단: 가격 + 조리법 */}
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-orange-500 font-bold text-xl">{snack.price_approx}</p>
              {snack.volume && <p className="text-xs text-gray-400">{volumeDisplay}</p>}
            </div>
            {perHundredG && <p className="text-xs text-gray-400 mb-1">{perHundredG}원/100{volumeUnit}</p>}
            <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-500">
              <span>{PREP_EMOJI[snack.prep_type] ?? '🍴'}</span>
              <span>{snack.prep_type}</span>
              {snack.prep?.time_min && <span className="text-gray-400">· {snack.prep.time_min}분</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 mt-5 space-y-4">

        {/* 설명 */}
        {(snack.short_desc || snack.description) && (
          <div className="space-y-2">
            {snack.short_desc && (
              <p className="text-gray-800 font-semibold text-base leading-snug">{snack.short_desc}</p>
            )}
            {snack.description && (
              <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-line">{snack.description}</p>
            )}
          </div>
        )}

        {/* 조리법 */}
        {snack.prep?.steps && snack.prep.steps.length > 0 && (
          <div className="bg-orange-50 rounded-2xl p-4 space-y-3">
            <h2 className="font-bold text-sm">조리법</h2>
            <ol className="space-y-2">
              {snack.prep.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* 링크 (조리법 / 관련상품) */}
        {snack.links && snack.links.length > 0 && (() => {
          const recipeLinks = snack.links!.filter((l) => l.type === 'recipe')
          const productLinks = snack.links!.filter((l) => l.type === 'product')
          return (
            <div className="space-y-3">
              {recipeLinks.length > 0 && (
                <div className="space-y-2">
                  <h2 className="font-bold text-sm">조리법 참고</h2>
                  <div className="flex flex-wrap gap-2">
                    {recipeLinks.map((link, i) => (
                      <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-full transition-colors">
                        🎬 {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {productLinks.length > 0 && (
                <div className="space-y-2">
                  <h2 className="font-bold text-sm">관련 상품</h2>
                  <div className="flex flex-wrap gap-2">
                    {productLinks.map((link, i) => (
                      <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 text-sm px-3 py-1.5 rounded-full transition-colors">
                        🛍️ {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })()}

        {/* 액션 버튼 */}
        <div className="flex gap-3 pt-1">
          <AddToCartButton
            snack_id={snack.id}
            name={snack.name}
            image_url={snack.image_url}
            price_approx={snack.price_approx}
            purchase_url={snack.purchase_url}
          />
          {snack.purchase_url && (
            <a
              href={snack.purchase_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-orange-500 text-white py-3.5 rounded-full font-semibold text-center text-sm hover:bg-orange-600 transition-colors"
            >
              사러가기 →
            </a>
          )}
          <ShareButton name={snack.name} />
        </div>

        {/* 좋아요 + 댓글 */}
        <SnackReactions snackId={snack.id} initialLikes={snack.likes ?? 0} />
      </div>
    </main>
  )
}
