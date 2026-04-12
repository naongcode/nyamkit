'use client'

import { HoneyCombo, Snack } from '@/types/snack'
import ComboCard from './ComboCard'

interface Props {
  combos: HoneyCombo[]
  snacks: Snack[]
  userId: string | null
}

export default function CombosFeed({ combos, snacks, userId }: Props) {
  const snackMap = Object.fromEntries(snacks.map((s) => [s.id, s]))

  return (
    <div className="space-y-4">
      {combos.map((combo) => (
        <ComboCard key={combo.id} combo={combo} snackMap={snackMap} userId={userId} />
      ))}
    </div>
  )
}
