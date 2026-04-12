'use client'

import Link from 'next/link'
import { HoneyCombo } from '@/types/snack'

interface Props {
  combos: HoneyCombo[]
  userId: string | null
}

export default function CombosGrid({ combos, userId: _ }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {combos.map((combo) => (
        <Link
          key={combo.id}
          href={`/combos/${combo.id}`}
          className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm active:scale-95 transition-transform"
        >
          <div className="relative">
            {combo.image_url
              ? <img src={combo.image_url} alt={combo.title} className="w-full aspect-square object-cover" />
              : <div className="w-full aspect-square bg-orange-50 flex items-center justify-center text-2xl">🍯</div>
            }
            {combo.likes > 0 && (
              <span className="absolute bottom-1.5 right-1.5 bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                🍯 {combo.likes}
              </span>
            )}
          </div>
          <div className="px-2 py-2">
            <p className="text-xs font-bold line-clamp-1">{combo.title}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{combo.items.length}가지</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
