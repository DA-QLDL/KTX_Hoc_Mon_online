import { supabase } from '@/lib/supabase/client'

export type Absence = {
  id: string
  worker_id: string
  worker_name: string | null
  worker_mnv: string | null
  ktx: string | null
  day: string | null
  room: string | null
  from_date: string
  to_date: string | null
  reason: string | null
  status: 'active'|'returned'
  created_at: string
  returned_at: string | null
}

export async function setTemporaryResidence(workerId:string, registered:boolean, status?:string){
  const {error}=await supabase.from('workers').update({
    temporary_residence: registered,
    residence_status: status || (registered?'Đã đăng ký tạm trú':'Chưa đăng ký tạm trú'),
    updated_at:new Date().toISOString()
  }).eq('id',workerId)
  if(error) throw error
}

export async function listAbsences(status:string=''){
  let q=supabase.from('worker_absences').select('*').order('created_at',{ascending:false}).limit(1000)
  if(status) q=q.eq('status',status)
  const {data,error}=await q
  if(error) throw error
  return (data||[]) as Absence[]
}

export async function createAbsence(worker:any, fromDate:string, toDate:string, reason:string){
  const {data,error}=await supabase.from('worker_absences').insert({
    worker_id:worker.id,worker_name:worker.name,worker_mnv:worker.mnv||null,
    ktx:worker.ktx||null,day:worker.day||null,room:worker.room||null,
    from_date:fromDate,to_date:toDate||null,reason:reason||null,status:'active'
  }).select().single()
  if(error) throw error
  await supabase.from('workers').update({residence_status:'Tạm vắng',updated_at:new Date().toISOString()}).eq('id',worker.id)
  return data
}

export async function markReturned(absence:Absence){
  const {error}=await supabase.from('worker_absences').update({status:'returned',returned_at:new Date().toISOString()}).eq('id',absence.id)
  if(error) throw error
  await supabase.from('workers').update({residence_status:'Đang lưu trú',updated_at:new Date().toISOString()}).eq('id',absence.worker_id)
}
