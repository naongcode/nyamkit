'use client'

import { useState, useEffect, useCallback } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'

export interface CartItem {
  id: string        // cart_items.id (uuid)
  snack_id: string
  name: string
  image_url: string
  price_approx: string
  purchase_url: string
  quantity: number
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseBrowser()

  // 유저 & 장바구니 초기 로드
  useEffect(() => {
    supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => {
      setUser(data.user)
      if (data.user) fetchCart(data.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e: AuthChangeEvent, session: Session | null) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) fetchCart(u.id)
      else { setItems([]); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchCart(userId: string) {
    setLoading(true)
    const { data } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    setItems(data ?? [])
    setLoading(false)
  }

  const addItem = useCallback(async (snack: Omit<CartItem, 'id' | 'quantity'>) => {
    if (!user) return false

    const existing = items.find(i => i.snack_id === snack.snack_id)
    if (existing) {
      // 이미 있으면 수량 +1
      await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + 1 })
        .eq('id', existing.id)
      setItems(prev => prev.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i))
    } else {
      const { data } = await supabase
        .from('cart_items')
        .insert({ user_id: user.id, ...snack, quantity: 1 })
        .select()
        .single()
      if (data) setItems(prev => [...prev, data])
    }
    return true
  }, [user, items])

  const removeItem = useCallback(async (id: string) => {
    await supabase.from('cart_items').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const updateQuantity = useCallback(async (id: string, quantity: number) => {
    if (quantity < 1) return
    await supabase.from('cart_items').update({ quantity }).eq('id', id)
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i))
  }, [])

  const clearCart = useCallback(async () => {
    if (!user) return
    await supabase.from('cart_items').delete().eq('user_id', user.id)
    setItems([])
  }, [user])

  const isInCart = useCallback((snackId: string) =>
    items.some(i => i.snack_id === snackId), [items])

  return { items, user, loading, addItem, removeItem, updateQuantity, clearCart, isInCart }
}
