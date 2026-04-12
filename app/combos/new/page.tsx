import { createSupabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Snack } from '@/types/snack'
import ComboForm from './ComboForm'

export const dynamic = 'force-dynamic'

type SnackSummary = Pick<Snack, 'id' | 'name' | 'image_url' | 'price_approx' | 'purchase_url'>

async function getSnacks(): Promise<SnackSummary[]> {
  const { data } = await supabase.from('snacks').select('id, name, image_url, price_approx, purchase_url').order('name')
  return (data || []) as SnackSummary[]
}

export default async function NewComboPage() {
  const supabaseServer = await createSupabaseServer()
  const { data: { user } } = await supabaseServer.auth.getUser()

  if (!user) redirect('/login?next=/combos/new')

  const snacks = await getSnacks()

  return <ComboForm user={user} snacks={snacks} />
}
