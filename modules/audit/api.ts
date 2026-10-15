import { supabase } from '@/lib/supabase/client'
import type { AuditLog } from './types'

export async function listAudit(q = '', limit = 300) {
  let req = supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(limit)
  if (q.trim()) req = req.or(`actor_email.ilike.%${q.trim()}%,action.ilike.%${q.trim()}%,summary.ilike.%${q.trim()}%`)
  const { data, error } = await req
  if (error) throw error
  return (data || []) as AuditLog[]
}
