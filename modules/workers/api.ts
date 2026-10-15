import { supabase } from '@/lib/supabase/client'
import type { Worker, WorkerFilters } from './types'

export async function listWorkers(filters: WorkerFilters, page = 1, pageSize = 50) {
  let q = supabase.from('workers').select('*', { count: 'exact' })
  const term = filters.q.trim().replace(/[%(),]/g, ' ')
  if (term) q = q.or(`name.ilike.%${term}%,mnv.ilike.%${term}%,cccd.ilike.%${term}%,phone.ilike.%${term}%,leader.ilike.%${term}%,room.ilike.%${term}%`)
  if (filters.ktx) q = q.eq('ktx', filters.ktx)
  if (filters.day) q = q.eq('day', filters.day)
  if (filters.room) q = q.eq('room', filters.room)
  if (filters.battalion) q = q.eq('battalion', filters.battalion)
  if (filters.leader) q = q.ilike('leader', `%${filters.leader}%`)
  if (filters.profile === 'missing_cccd_sdt') q = q.or('cccd.is.null,cccd.eq.,phone.is.null,phone.eq.')
  if (filters.profile === 'no_room') q = q.or('room.is.null,room.eq.')
  if (filters.residence === 'registered') q = q.eq('temporary_residence', true)
  if (filters.residence === 'unregistered') q = q.eq('temporary_residence', false)
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const { data, error, count } = await q.order('name').range(from, to)
  if (error) throw error
  return { rows: (data || []) as Worker[], count: count || 0 }
}

export async function workerOptions() {
  const { data, error } = await supabase.from('workers').select('ktx,day,room,battalion,leader').limit(10000)
  if (error) throw error
  const rows = data || []
  const uniq = (k: keyof (typeof rows)[number]) => Array.from(new Set(rows.map(r => String(r[k] || '').trim()).filter(Boolean))).sort((a,b)=>a.localeCompare(b,'vi',{numeric:true}))
  return { ktx: uniq('ktx'), day: uniq('day'), room: uniq('room'), battalion: uniq('battalion'), leader: uniq('leader') }
}

export async function saveWorker(worker: Partial<Worker> & { name: string }) {
  const payload = { ...worker, updated_at: new Date().toISOString() }
  if (worker.id) {
    const { data, error } = await supabase.from('workers').update(payload).eq('id', worker.id).select().single()
    if (error) throw error
    return data as Worker
  }
  delete (payload as {id?: string}).id
  const { data, error } = await supabase.from('workers').insert(payload).select().single()
  if (error) throw error
  return data as Worker
}

export async function deleteWorker(id: string) {
  const { error } = await supabase.from('workers').delete().eq('id', id)
  if (error) throw error
}

export async function importWorkers(rows: Array<Record<string, any>>, batchSize = 200) {
  let inserted = 0
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize).map(r => ({ ...r, updated_at: new Date().toISOString() }))
    const { error } = await supabase.from('workers').insert(batch)
    if (error) throw new Error(`Lỗi tại lô ${Math.floor(i / batchSize) + 1}: ${error.message}`)
    inserted += batch.length
  }
  return inserted
}
