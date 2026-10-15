'use client'
import { useState } from 'react'
import { KeyRound, RefreshCw, LogOut, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/modules/auth/AuthProvider'

export default function Pending(){
  const r=useRouter(); const {user,account,refreshAccount,requestAccess,signOut}=useAuth(); const [msg,setMsg]=useState(''); const [busy,setBusy]=useState(false)
  const check=async()=>{setBusy(true);const next=await refreshAccount();setBusy(false);if(next?.enabled)r.replace('/');else setMsg('Tài khoản vẫn đang chờ Quản trị duyệt.')}
  const resend=async()=>{setBusy(true);const x=await requestAccess();setBusy(false);setMsg(x.error?'Không gửi được yêu cầu: '+x.error:'Đã gửi lại yêu cầu cấp quyền tới Quản trị.')}
  return <div className="authScreen"><div className="authBox"><div className="pageIcon" style={{margin:'auto'}}><KeyRound size={22}/></div><h1>{account&&!account.enabled?'Tài khoản đang bị khóa':'Tài khoản đang chờ duyệt'}</h1><p>{user?.email} đã đăng nhập nhưng chưa được cấp quyền sử dụng hệ thống.</p>{msg&&<div className="success">{msg}</div>}<div style={{display:'grid',gap:8,marginTop:12}}><button disabled={busy} className="btn primary" onClick={resend}><Send size={15}/> Gửi lại yêu cầu</button><button disabled={busy} className="btn ghost" onClick={check}><RefreshCw size={15}/> Kiểm tra lại quyền</button><button className="btn red" onClick={async()=>{await signOut();r.replace('/login')}}><LogOut size={15}/> Đăng xuất</button></div></div></div>
}
