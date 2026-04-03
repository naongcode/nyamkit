import Link from 'next/link'
import { Snack } from '@/types/snack'

const PREP_EMOJI: Record<string, string> = {
  '그냥먹기': '🍬',
  '전자레인지': '📡',
  '에어프라이어': '🌬️',
  '끓이기': '🍲',
  '전기밥솥': '🍚',
}

export default function SnackCardSmall({ snack }: { snack: Snack }) {
  return (
    <Link href={`/snack/${snack.id}`} className="block">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex gap-4 p-3 items-center">
        <div className="w-20 h-20 rounded-xl bg-gray-100 shrink-0 overflow-hidden">
          {snack.image_url ? (
            <img src={snack.image_url} alt={snack.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">🍱</div>
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <p className="font-semibold text-base leading-tight line-clamp-2">{snack.name}</p>
          {snack.short_desc && (
            <p className="text-sm text-gray-400 line-clamp-1">{snack.short_desc}</p>
          )}
          <div className="flex items-center justify-between pt-1">
            <span className="text-orange-500 font-bold text-sm">{snack.price_approx}</span>
            <div className="flex items-center gap-1">
              <span className="text-sm">{PREP_EMOJI[snack.prep_type] ?? '🍴'}</span>
              <span className="text-base font-black tracking-tight" style={{ color: '#FBBF24', textShadow: '0 1px 3px rgba(251,191,36,0.5)' }}>
                {'★'.repeat(snack.value_score)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
