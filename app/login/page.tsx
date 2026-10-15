'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/modules/auth/AuthProvider'

function friendlyError(message:string){
  if(/invalid login credentials/i.test(message)) return 'Email hoặc mật khẩu không đúng.'
  if(/email rate limit exceeded/i.test(message)) return 'Supabase đang giới hạn gửi email. Với hệ thống nội bộ, nên tắt Confirm email hoặc cấu hình SMTP riêng.'
  if(/user already registered/i.test(message)) return 'Email này đã được đăng ký. Hãy chuyển sang Đăng nhập hoặc dùng Quên mật khẩu.'
  return message
}

export default function Login(){
  const router=useRouter(); const {user,account,recovery}=useAuth()
  const [mode,setMode]=useState<'in'|'up'|'recover'>(recovery?'recover':'in')
  const [name,setName]=useState(''); const [email,setEmail]=useState(''); const [pass,setPass]=useState(''); const [pass2,setPass2]=useState('')
  const [msg,setMsg]=useState(''); const [kind,setKind]=useState<'error'|'success'>('error'); const [busy,setBusy]=useState(false); const [show,setShow]=useState(false)
  useEffect(()=>{if(recovery)setMode('recover')},[recovery])
  useEffect(()=>{if(!user||recovery)return;if(account?.enabled)router.replace('/');else router.replace('/pending')},[user,account,recovery,router])
  const alertMsg=(text:string,k:'error'|'success'='error')=>{setKind(k);setMsg(text)}
  const login=async()=>{if(!email.trim()||!pass)return alertMsg('Vui lòng nhập email và mật khẩu.');setBusy(true);setMsg('');const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password:pass});setBusy(false);if(error)return alertMsg(friendlyError(error.message));router.replace('/')}
  const signup=async()=>{if(name.trim().length<2)return alertMsg('Vui lòng nhập họ tên.');if(!email.includes('@'))return alertMsg('Email không hợp lệ.');if(pass.length<8)return alertMsg('Mật khẩu cần ít nhất 8 ký tự.');if(pass!==pass2)return alertMsg('Hai mật khẩu chưa khớp.');setBusy(true);setMsg('');const {data,error}=await supabase.auth.signUp({email:email.trim(),password:pass,options:{data:{name:name.trim()},emailRedirectTo:location.origin+'/login'}});setBusy(false);if(error)return alertMsg(friendlyError(error.message));if(data.session){await supabase.from('access_requests').upsert({user_id:data.session.user.id,email:data.session.user.email,display_name:name.trim(),status:'pending',requested_at:new Date().toISOString()},{onConflict:'user_id'});router.replace('/pending');return}alertMsg('Đăng ký thành công. Hãy xác nhận email rồi quay lại đăng nhập.','success')}
  const forgot=async()=>{if(!email.trim())return alertMsg('Nhập email trước.');setBusy(true);const {error}=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:location.origin+'/login'});setBusy(false);alertMsg(error?friendlyError(error.message):'Đã gửi email đặt lại mật khẩu. Hãy kiểm tra hộp thư.',error?'error':'success')}
  const updatePassword=async()=>{if(pass.length<8)return alertMsg('Mật khẩu mới cần ít nhất 8 ký tự.');if(pass!==pass2)return alertMsg('Hai mật khẩu chưa khớp.');setBusy(true);const {error}=await supabase.auth.updateUser({password:pass});setBusy(false);if(error)return alertMsg(friendlyError(error.message));alertMsg('Đã cập nhật mật khẩu. Bạn có thể tiếp tục sử dụng hệ thống.','success');setMode('in');setPass('');setPass2('')}
  return <div className="authScreen"><div className="authBox"><div className="pageIcon" style={{margin:'auto'}}><KeyRound size={22}/></div><h1>{mode==='in'?'Đăng nhập KTX Hóc Môn':mode==='up'?'Đăng ký tài khoản KTX':'Đặt mật khẩu mới'}</h1><p>Supabase Auth · dữ liệu và quyền truy cập được quản lý online</p>{mode!=='recover'&&<div className="authTabs"><button className={mode==='in'?'on':''} onClick={()=>{setMode('in');setMsg('')}}>Đăng nhập</button><button className={mode==='up'?'on':''} onClick={()=>{setMode('up');setMsg('')}}>Đăng ký</button></div>}{msg&&<div className={kind}>{msg}</div>}<div style={{display:'grid',gap:9,marginTop:10}}>{mode==='up'&&<input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Họ và tên"/>}{mode!=='recover'&&<input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email"/>}<div style={{position:'relative'}}><input className="input" style={{width:'100%',paddingRight:42}} type={show?'text':'password'} value={pass} onChange={e=>setPass(e.target.value)} placeholder={mode==='recover'?'Mật khẩu mới':'Mật khẩu'}/><button type="button" onClick={()=>setShow(!show)} style={{position:'absolute',right:7,top:6,border:0,background:'transparent',padding:6,cursor:'pointer'}}>{show?<EyeOff size={17}/>:<Eye size={17}/>}</button></div>{(mode==='up'||mode==='recover')&&<input className="input" type="password" value={pass2} onChange={e=>setPass2(e.target.value)} placeholder="Nhập lại mật khẩu"/>}<button disabled={busy} className="btn green" onClick={mode==='in'?login:mode==='up'?signup:updatePassword}>{busy?'Đang xử lý...':mode==='in'?'Đăng nhập':mode==='up'?'Đăng ký tài khoản':'Cập nhật mật khẩu'}</button>{mode==='in'&&<button className="btn ghost" onClick={forgot}>Quên mật khẩu?</button>}</div></div></div>
}
