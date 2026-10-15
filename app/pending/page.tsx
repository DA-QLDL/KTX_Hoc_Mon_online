'use client'
import { KeyRound, RefreshCw, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/modules/auth/AuthProvider'
export default function Pending(){const r=useRouter();const {user,account,refreshAccount,signOut}=useAuth();return <div className="authScreen"><div className="authBox"><div className="pageIcon" style={{margin:'auto'}}><KeyRound size={22}/></div><h1>Tài khoản đang chờ duyệt</h1><p>{user?.email} đã đăng nhập nhưng chưa được cấp quyền sử dụng.</p><div className="toolbar" style={{justifyContent:'center'}}><button className="btn primary" onClick={async()=>{await refreshAccount();if(account?.enabled)r.replace('/')}}><RefreshCw size={15}/> Kiểm tra lại</button><button className="btn red" onClick={async()=>{await signOut();r.replace('/login')}}><LogOut size={15}/> Đăng xuất</button></div></div></div>}
