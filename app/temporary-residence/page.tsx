'use client'
import { useEffect,useMemo,useState } from 'react'
import { BadgeCheck,RefreshCw,CalendarOff,Undo2 } from 'lucide-react'
import { Protected } from '@/modules/auth/Protected'
import { AppShell } from '@/components/AppShell'
import { PageHeader } from '@/components/PageHeader'
import { supabase } from '@/lib/supabase/client'
import { createAbsence,listAbsences,markReturned,setTemporaryResidence,type Absence } from '@/modules/residence/api'
import { useAuth } from '@/modules/auth/AuthProvider'

export default function TemporaryResidence(){
 const {account}=useAuth();const canWrite=['admin','manager','staff'].includes(account?.role||'');
 const [tab,setTab]=useState<'residence'|'absence'>('residence'),[q,setQ]=useState(''),[workers,setWorkers]=useState<any[]>([]),[abs,setAbs]=useState<Absence[]>([]),[loading,setLoading]=useState(false)
 const load=async()=>{setLoading(true);try{const [{data:w,error:e},{ }]=await Promise.all([supabase.from('workers').select('id,name,mnv,cccd,phone,ktx,day,room,temporary_residence,residence_status').order('name').limit(5000),Promise.resolve({})]);if(e)throw e;setWorkers(w||[]);setAbs(await listAbsences())}finally{setLoading(false)}}
 useEffect(()=>{load()},[])
 const filtered=useMemo(()=>workers.filter(w=>!q||[w.name,w.mnv,w.cccd,w.room,w.ktx].some((x:any)=>String(x||'').toLowerCase().includes(q.toLowerCase()))),[workers,q])
 const register=async(w:any,v:boolean)=>{await setTemporaryResidence(w.id,v);await load()}
 const addAbs=async(w:any)=>{const from=prompt('Ngày bắt đầu tạm vắng (YYYY-MM-DD)',new Date().toISOString().slice(0,10));if(!from)return;const to=prompt('Ngày dự kiến trở lại (YYYY-MM-DD, có thể để trống)','')||'';const reason=prompt('Lý do tạm vắng','')||'';await createAbsence(w,from,to,reason);await load()}
 return <Protected><AppShell><div className="content"><PageHeader icon={BadgeCheck} title="TẠM TRÚ · TẠM VẮNG" subtitle="Theo dõi khai báo tạm trú và công nhân tạm vắng trên Supabase" actions={<button className="btn" onClick={load}><RefreshCw size={15}/> Đồng bộ</button>}/>
 <div className="toolbar" style={{marginBottom:14}}><button className={`btn ${tab==='residence'?'primary':''}`} onClick={()=>setTab('residence')}>Tạm trú</button><button className={`btn ${tab==='absence'?'primary':''}`} onClick={()=>setTab('absence')}>Tạm vắng</button></div>
 {tab==='residence'?<><div className="card"><div className="field"><label>Tìm công nhân</label><input className="input" value={q} onChange={e=>setQ(e.target.value)} placeholder="Tên, Mã NV, CCCD, phòng, KTX..."/></div></div><div className="card" style={{marginTop:14,padding:0}}><div className="tableWrap" style={{margin:0,border:0}}><table><thead><tr><th>Họ tên</th><th>Mã NV</th><th>KTX</th><th>Dãy</th><th>Phòng</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{filtered.map(w=><tr key={w.id}><td><b>{w.name}</b></td><td>{w.mnv||'—'}</td><td>{w.ktx||'—'}</td><td>{w.day||'—'}</td><td>{w.room||'—'}</td><td><span className={`tag ${w.temporary_residence?'green':'amber'}`}>{w.residence_status|| (w.temporary_residence?'Đã đăng ký tạm trú':'Chưa đăng ký')}</span></td><td>{canWrite&&<><button className="btn" onClick={()=>register(w,!w.temporary_residence)}>{w.temporary_residence?'Hủy ĐK':'Đã ĐK tạm trú'}</button><button className="btn" onClick={()=>addAbs(w)}><CalendarOff size={13}/> Tạm vắng</button></>}</td></tr>)}</tbody></table></div></div></>:<div className="card" style={{padding:0}}><div className="tableWrap" style={{margin:0,border:0}}><table><thead><tr><th>Họ tên</th><th>Mã NV</th><th>KTX</th><th>Từ ngày</th><th>Đến ngày</th><th>Lý do</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{abs.map(a=><tr key={a.id}><td><b>{a.worker_name}</b></td><td>{a.worker_mnv||'—'}</td><td>{a.ktx||'—'}</td><td>{a.from_date}</td><td>{a.to_date||'—'}</td><td>{a.reason||'—'}</td><td><span className={`tag ${a.status==='returned'?'green':'amber'}`}>{a.status==='returned'?'Đã trở lại':'Đang tạm vắng'}</span></td><td>{canWrite&&a.status==='active'&&<button className="btn green" onClick={async()=>{await markReturned(a);await load()}}><Undo2 size={13}/> Đã trở lại</button>}</td></tr>)}</tbody></table></div></div>}
 {loading&&<div className="screen-center"><div className="spinner"/></div>}</div></AppShell></Protected>
}
