import { supabase } from '@/lib/supabase/client'

export type ArchiveItem={
 id:string;worker_id:string|null;worker_name:string;worker_mnv:string|null;ktx:string|null;day:string|null;room:string|null;
 reason:string;move_date:string;note:string|null;worker_data:any;created_at:string;restored_at:string|null
}

export async function listArchive(q=''){
 let x=supabase.from('worker_archive').select('*').is('restored_at',null).order('move_date',{ascending:false}).limit(3000)
 if(q.trim()) x=x.or(`worker_name.ilike.%${q.trim()}%,worker_mnv.ilike.%${q.trim()}%,reason.ilike.%${q.trim()}%`)
 const {data,error}=await x;if(error)throw error;return (data||[]) as ArchiveItem[]
}
export async function archiveWorker(workerId:string,reason:string,moveDate:string,note:string){
 const {data,error}=await supabase.rpc('archive_worker',{p_worker_id:workerId,p_reason:reason,p_move_date:moveDate,p_note:note||null})
 if(error)throw error;return data
}
export async function restoreWorker(archiveId:string){
 const {data,error}=await supabase.rpc('restore_worker',{p_archive_id:archiveId})
 if(error)throw error;return data
}
