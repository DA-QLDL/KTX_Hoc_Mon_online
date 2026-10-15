'use client'
import { useEffect, useMemo, useState } from 'react'
import { ClipboardCopy, Download, Save, Utensils, ExternalLink, Trash2 } from 'lucide-react'
import { Protected } from '@/modules/auth/Protected'
import { AppShell } from '@/components/AppShell'
import { PageHeader } from '@/components/PageHeader'
import { deleteMealReport, listMealReports, saveMealReport, type MealReport, type MealSupplier } from '@/modules/meal/api'
import { useAuth } from '@/modules/auth/AuthProvider'

const suppliers=['Vina Story','Tám Phương','Thiên Hồng Phúc','Lim Dương','Hương Ngọc Phát','Nguyên Sài Gòn','Minh Long Food']
const blank=(supplier:string):MealSupplier=>({supplier,td8:null,td111:null,td113:null,savory:'',vegetarian:'',weight_check:''})
const today=()=>new Date().toISOString().slice(0,10)
const sessionLabel={sang:'sáng',trua:'trưa',chieu:'chiều'} as const
function total(s:MealSupplier){return [s.td8,s.td111,s.td113].filter(v=>v!==null&&v!==undefined).reduce((a,b)=>a+Number(b),0)}
function makeText(date:string,session:'sang'|'trua'|'chieu',ktx:string,price:string,rows:MealSupplier[]){
  const active=rows.filter(s=>total(s)>0||s.savory||s.vegetarian||s.weight_check)
  const grand=active.reduce((n,s)=>n+total(s),0)
  const d=date.split('-').reverse().join('/')
  const out=[`Báo cáo Anh/Chị: Lán trại Hóc Môn ${ktx} phục vụ suất ăn ${sessionLabel[session]} ngày ${d}`,`• Tổng cộng: ${grand} suất`,`• Đơn giá: ${price}`]
  active.forEach((s,i)=>{out.push('',`${i+1}. NCC: ${s.supplier}`,`• Tổng suất ăn: ${total(s)} suất`,`- TĐ 8: ${s.td8??''} suất`,`- TĐ 11.1: ${s.td111??''} suất`,`- TĐ 11.3: ${s.td113??''} suất`,`• Suất ăn mặn: ${s.savory||''}`,`• Suất ăn chay: ${s.vegetarian||''}`,`Cân định lượng: ${s.weight_check||''}`)})
  return out.join('\n')
}
function downloadWord(text:string,date:string,session:string){
  const html=`<html><head><meta charset="utf-8"></head><body><pre style="font-family:Arial;white-space:pre-wrap;font-size:13pt">${text.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</pre></body></html>`
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff',html],{type:'application/msword'}));a.download=`bao-cao-suat-an-${session}-${date}.doc`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)
}
export default function MealReportPage(){
  const {account}=useAuth();const canWrite=account?.role!=='viewer'
  const [date,setDate]=useState(today());const [session,setSession]=useState<'sang'|'trua'|'chieu'>('trua');const [ktx,setKtx]=useState('KTX 1');const [price,setPrice]=useState('');
  const [rows,setRows]=useState<MealSupplier[]>(suppliers.map(blank));const [history,setHistory]=useState<MealReport[]>([]);const [currentId,setCurrentId]=useState<string|undefined>();const [msg,setMsg]=useState('')
  const text=useMemo(()=>makeText(date,session,ktx,price,rows),[date,session,ktx,price,rows])
  const load=()=>listMealReports().then(setHistory).catch(e=>setMsg(e.message));useEffect(()=>{load()},[])
  const patch=(i:number,k:keyof MealSupplier,v:any)=>setRows(r=>r.map((x,n)=>n===i?{...x,[k]:v}:x))
  const save=async()=>{try{const r=await saveMealReport({id:currentId,report_date:date,session,ktx,price,suppliers:rows,report_text:text});setCurrentId(r.id);setMsg('Đã lưu báo cáo lên Supabase.');load()}catch(e:any){setMsg('Không lưu được: '+e.message)}}
  const restore=(r:MealReport)=>{setCurrentId(r.id);setDate(r.report_date);setSession(r.session);setKtx(r.ktx);setPrice(r.price||'');setRows((r.suppliers||suppliers.map(blank)) as MealSupplier[]);window.scrollTo({top:0,behavior:'smooth'})}
  return <Protected><AppShell><div className="content"><PageHeader icon={Utensils} title="BÁO CÁO SUẤT ĂN" subtitle="Tạo báo cáo theo buổi · lưu tập trung trên Supabase" actions={<><a className="btn" href="/legacy/v26.html?page=meal" target="_blank"><ExternalLink size={14}/> Công cụ thực đơn Excel cũ</a><button className="btn" onClick={()=>downloadWord(text,date,session)}><Download size={14}/> Tải Word</button><button className="btn green" onClick={async()=>{await navigator.clipboard.writeText(text);setMsg('Đã sao chép nội dung báo cáo.')}}><ClipboardCopy size={14}/> Sao chép</button>{canWrite&&<button className="btn primary" onClick={save}><Save size={14}/> Lưu báo cáo</button>}</>}/>
  {msg&&<div className="card" style={{marginBottom:14,padding:12}}>{msg}</div>}
  <div className="card"><div className="filters" style={{gridTemplateColumns:'repeat(4,minmax(160px,1fr))'}}><div className="field"><label>Ngày</label><input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)}/></div><div className="field"><label>Buổi</label><select className="select" value={session} onChange={e=>setSession(e.target.value as any)}><option value="sang">Sáng</option><option value="trua">Trưa</option><option value="chieu">Chiều</option></select></div><div className="field"><label>KTX</label><select className="select" value={ktx} onChange={e=>setKtx(e.target.value)}><option>KTX 1</option><option>KTX 2</option></select></div><div className="field"><label>Đơn giá</label><input className="input" value={price} onChange={e=>setPrice(e.target.value)} placeholder="VD: 40.000đ"/></div></div></div>
  <div className="grid2" style={{marginTop:14}}>{rows.map((s,i)=><div className="card" key={s.supplier}><div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'center'}}><h3 style={{margin:'0 0 10px'}}>{i+1}. {s.supplier}</h3><span className="tag green">Tổng {total(s)} suất</span></div><div className="filters" style={{gridTemplateColumns:'repeat(3,1fr)'}}>{([['td8','TĐ 8'],['td111','TĐ 11.1'],['td113','TĐ 11.3']] as const).map(([k,l])=><div className="field" key={k}><label>{l}</label><input className="input" type="number" min="0" value={s[k]??''} onChange={e=>patch(i,k,e.target.value===''?null:Math.max(0,Math.round(+e.target.value)))}/></div>)}</div><div className="field" style={{marginTop:10}}><label>Suất ăn mặn</label><textarea className="textarea" rows={2} value={s.savory} onChange={e=>patch(i,'savory',e.target.value)}/></div><div className="field" style={{marginTop:8}}><label>Suất ăn chay</label><textarea className="textarea" rows={2} value={s.vegetarian} onChange={e=>patch(i,'vegetarian',e.target.value)}/></div><div className="field" style={{marginTop:8}}><label>Cân định lượng</label><select className="select" value={s.weight_check} onChange={e=>patch(i,'weight_check',e.target.value)}><option value="">(để trống)</option><option>Đạt</option><option>Không đạt</option></select></div></div>)}</div>
  <div className="card" style={{marginTop:14}}><h3>Nội dung báo cáo</h3><pre className="reportPreview">{text}</pre></div>
  <div className="card" style={{marginTop:14}}><h3>Lịch sử báo cáo đã lưu</h3>{history.length?<div className="tableWrap"><table><thead><tr><th>Ngày</th><th>Buổi</th><th>KTX</th><th>Tổng suất</th><th>Thao tác</th></tr></thead><tbody>{history.map(r=><tr key={r.id}><td>{r.report_date}</td><td>{sessionLabel[r.session]}</td><td>{r.ktx}</td><td>{(r.suppliers||[]).reduce((n,s)=>n+total(s),0)}</td><td><button className="btn" onClick={()=>restore(r)}>Mở</button>{canWrite&&<button className="btn red" onClick={async()=>{if(confirm('Xóa báo cáo đã lưu?')){await deleteMealReport(r.id!);load()}}}><Trash2 size={13}/></button>}</td></tr>)}</tbody></table></div>:<div className="empty">Chưa có báo cáo lưu trên Supabase.</div>}</div>
  </div></AppShell></Protected>
}
