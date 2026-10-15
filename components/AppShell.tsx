'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Building2, LayoutDashboard, Users, QrCode, UserCog, ClipboardList, RefreshCw, LogOut, Utensils, BadgeCheck, ArrowRightLeft, HardDrive } from 'lucide-react'
import { useAuth } from '@/modules/auth/AuthProvider'

const primary = [
  ['/', 'Tổng Quan', LayoutDashboard],
  ['/worker-management', 'Quản Lý Công Nhân', Users],
  ['/qr-portal', 'QR Portal', QrCode],
] as const
const later = [
  ['#', 'Báo Cáo Suất Ăn', Utensils],
  ['#', 'Tạm Trú · Tạm Vắng', BadgeCheck],
  ['#', 'Điều Chuyển · Nghỉ Việc', ArrowRightLeft],
] as const
const admin = [
  ['/user-management', 'Quản Lý Tài Khoản', UserCog],
  ['/audit-log', 'Nhật Ký Hệ Thống', ClipboardList],
] as const

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname(); const router = useRouter(); const { account, user, signOut } = useAuth()
  const active=(href:string)=>href==='/'?path===href:path.startsWith(href)
  const roleLabel = ({admin:'Quản trị viên',manager:'Quản lý',staff:'Nhân viên',viewer:'Chỉ xem'} as Record<string,string>)[account?.role||'viewer']
  const nav=(items:readonly (readonly [string,string,React.ComponentType<{size?:number}>])[])=>items.map(([href,label,Icon])=> href==='#'?<div className="navItem" key={label} title="Sẽ chuyển đổi ở giai đoạn sau"><Icon size={18}/><span>{label}</span><span className="badge">Sau</span></div>:<Link key={href} href={href} className={`navItem ${active(href)?'active':''}`}><Icon size={18}/><span>{label}</span></Link>)
  return <div className="app"><aside className="sidebar"><div className="brand"><div className="brandIcon"><Building2 size={20}/></div><div><strong>KÝ TÚC XÁ</strong><small>HÓC MÔN</small></div></div><nav className="nav"><div className="navLabel">CHỨC NĂNG CHÍNH</div>{nav(primary)}<div className="navLabel">CHUYỂN ĐỔI TIẾP</div>{nav(later)}{account?.role==='admin'&&<><div className="navLabel">QUẢN TRỊ HỆ THỐNG</div>{nav(admin)}</>}<div className="navLabel">TIỆN ÍCH</div><button className="navItem" onClick={()=>location.reload()}><RefreshCw size={17}/><span>Đồng bộ dữ liệu</span></button><div className="navItem"><HardDrive size={17}/><span>Supabase Online</span><span className="badge">LIVE</span></div></nav><div className="userFoot"><div className="userCard"><div className="avatar">{(account?.display_name||user?.email||'?').slice(0,1).toUpperCase()}</div><div style={{minWidth:0,flex:1}}><b>{account?.display_name||user?.email?.split('@')[0]}</b><small>{roleLabel}</small></div><button className="btn ghost" title="Đăng xuất" onClick={async()=>{await signOut();router.replace('/login')}}><LogOut size={15}/></button></div></div></aside><main className="main">{children}</main></div>
}
