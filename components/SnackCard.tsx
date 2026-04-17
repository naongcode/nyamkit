import Link from 'next/link'
import Image from 'next/image'
import { Snack } from '@/types/snack'

const PREP_EMOJI: Record<string, string> = {
  '그냥먹기': '🍬',
  '전자레인지': '📡',
  '에어프라이어': '🌬️',
  '끓이기': '🍲',
  '전기밥솥': '🍚',
}

export default function SnackCard({ snack }: { snack: Snack }) {
  return (
    <Link href={`/snack/${snack.id}`} className="block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="relative aspect-square bg-gray-100">
          {snack.image_url ? (
            <Image src={snack.image_url} alt={snack.name} fill className="object-cover" sizes="(max-width: 768px) 33vw, 200px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">🍱</div>
          )}
          {snack.tags.includes('주인장픽') ? (
            <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-medium z-10">
              냠킷 PICK
            </span>
          ) : null}
        </div>
        <div className="p-3 space-y-1.5">
          <p className="font-semibold text-sm leading-tight line-clamp-2">{snack.name}</p>
          {snack.short_desc && (
            <p className="text-xs text-gray-500 line-clamp-1">{snack.short_desc}</p>
          )}
          <p className="text-orange-500 font-bold text-sm">{snack.price_approx}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="hidden sm:inline text-xs text-gray-400">가격</span>
              <span className="text-base font-black" style={{ color: '#FBBF24', textShadow: '0 1px 3px rgba(251,191,36,0.5)' }}>
                {'★'.repeat(snack.value_score)}{'☆'.repeat(5 - snack.value_score)}
              </span>
            </div>
            <span className="text-sm">{PREP_EMOJI[snack.prep_type] ?? '🍴'}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
