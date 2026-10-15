import { supabase } from '@/lib/supabase/client'

export type ResidencyRequest={
 id:string;request_type:'in'|'out';worker_code:string|null;name:string;cccd:string|null;phone:string|null;dob:string|null;gender:string|null;
 unit:string|null;td:string|null;leader:string|null;address:string|null;ktx:string|null;day:string|null;room:string|null;reason:string|null;note:string|null;
 status:'pending'|'approved'|'rejected';created_at:string
}

export async function listRequests(){
 const {data,error}=await supabase.from('residency_requests').select('*').eq('status','pending').order('created_at',{ascending:false}).limit(2000)
 if(error)throw error;return (data||[]) as ResidencyRequest[]
}
export async function requestStatus(id:string,status:'approved'|'rejected'){
 const {error}=await supabase.from('residency_requests').update({status}).eq('id',id);if(error)throw error
}
export async function approveRequest(r:ResidencyRequest){
 if(r.request_type==='in'){
  const {error}=await supabase.from('workers').insert({
   name:r.name,mnv:r.worker_code||null,cccd:r.cccd||null,phone:r.phone||null,dob:r.dob||null,gender:r.gender||null,
   unit:r.unit||null,battalion:r.td||null,leader:r.leader||null,address:r.address||null,ktx:r.ktx||null,day:r.day||null,room:r.room||null,
   temporary_residence:false,residence_status:'Chờ đăng ký tạm trú',check_in_date:new Date().toISOString().slice(0,10)
  });if(error)throw error
 }else{
  const code=(r.worker_code||r.cccd||'').trim();
  const {data:w,error:e}=await supabase.from('workers').select('id').or(`mnv.eq.${code},cccd.eq.${code}`).limit(1).maybeSingle();
  if(e)throw e;if(!w)throw new Error('Không tìm thấy công nhân theo Mã NV/CCCD để chuyển ra KTX.')
  const {error}=await supabase.rpc('archive_worker',{p_worker_id:w.id,p_reason:r.reason||'Chuyển ra ngoài ở',p_move_date:new Date().toISOString().slice(0,10),p_note:r.note||'Đăng ký ra KTX Online'});if(error)throw error
 }
 await requestStatus(r.id,'approved')
}
