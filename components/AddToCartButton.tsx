'use client'

import { useCart } from '@/lib/useCart'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
  snack_id: string
  name: string
  image_url: string
  price_approx: string
  purchase_url: string
}

export default function AddToCartButton(props: Props) {
  const { user, addItem, isInCart } = useCart()
  const [added, setAdded] = useState(false)
  const router = useRouter()
  const inCart = isInCart(props.snack_id)

  async function handleAdd() {
    if (!user) {
      router.push('/login')
      return
    }
    await addItem(props)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <button
      onClick={handleAdd}
      className={`flex-1 py-3.5 rounded-full font-semibold text-sm transition-all ${
        added
          ? 'bg-green-500 text-white'
          : inCart
          ? 'bg-orange-100 text-orange-500 border border-orange-300'
          : 'bg-white text-orange-500 border border-orange-300 hover:bg-orange-50'
      }`}
    >
      {added ? '✓ 담겼어요!' : inCart ? '🛒 찜됨' : '🛒 찜하기'}
    </button>
  )
}
