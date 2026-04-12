import { createSupabaseServer } from '@/lib/supabase-server'
import { supabase } from '@/lib/supabase'
import { redirect, notFound } from 'next/navigation'
import { HoneyCombo, Snack } from '@/types/snack'
import ComboEditForm from './ComboEditForm'

export const dynamic = 'force-dynamic'

async function getCombo(id: string): Promise<HoneyCombo | null> {
  const { data } = await supabase.from('honey_combos').select('*').eq('id', id).single()
  return data || null
}

type SnackSummary = Pick<Snack, 'id' | 'name' | 'image_url' | 'price_approx' | 'purchase_url'>

async function getSnacks(): Promise<SnackSummary[]> {
  const { data } = await supabase.from('snacks').select('id, name, image_url, price_approx, purchase_url').order('name')
  return (data || []) as SnackSummary[]
}

export default async function EditComboPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabaseServer = await createSupabaseServer()
  const { data: { user } } = await supabaseServer.auth.getUser()

  if (!user) redirect(`/login?next=/combos/${id}/edit`)

  const [combo, snacks] = await Promise.all([getCombo(id), getSnacks()])
  if (!combo) notFound()
  if (combo.user_id !== user.id) redirect(`/combos/${id}`)

  return <ComboEditForm combo={combo} snacks={snacks} />
}
