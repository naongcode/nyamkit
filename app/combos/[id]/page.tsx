import { HoneyCombo, Snack } from '@/types/snack'
import { supabase } from '@/lib/supabase'
import { createSupabaseServer } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import ComboDetailClient from './ComboDetailClient'

export const dynamic = 'force-dynamic'

async function getCombo(id: string): Promise<HoneyCombo | null> {
  const { data, error } = await supabase.from('honey_combos').select('*').eq('id', id).single()
  if (error || !data) return null
  return data
}

type SnackSummary = Pick<Snack, 'id' | 'name' | 'image_url' | 'price_approx' | 'purchase_url' | 'volume' | 'pkg_count'>

async function getSnacks(): Promise<SnackSummary[]> {
  const { data } = await supabase.from('snacks').select('id, name, image_url, price_approx, purchase_url, volume, pkg_count')
  return (data || []) as SnackSummary[]
}

export default async function ComboDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabaseServer = await createSupabaseServer()
  const { data: { user } } = await supabaseServer.auth.getUser()
  const [combo, snacks] = await Promise.all([getCombo(id), getSnacks()])
  if (!combo) notFound()

  return <ComboDetailClient combo={combo} snacks={snacks} userId={user?.id ?? null} />
}
