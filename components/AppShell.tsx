'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Building2, LayoutDashboard, Users, QrCode, UserCog, ClipboardList, RefreshCw, LogOut, Utensils, BadgeCheck, ArrowRightLeft, HardDrive, Copy, MapPin, Layers3, FileImage, FolderArchive, DatabaseBackup, CircleUserRound } from 'lucide-react'
import { useAuth } from '@/modules/auth/AuthProvider'

const primary = [
  ['/', 'Tổng Quan', LayoutDashboard],
  ['/worker-management', 'Quản Lý Công Nhân', Users],
  ['/meal-report', 'Báo Cáo Suất Ăn', Utensils],
  ['/temporary-residence', 'Tạm Trú · Tạm Vắng', BadgeCheck],
  ['/qr-portal', 'Mã QR · Điểm danh', QrCode],
  ['/archive', 'Điều Chuyển · Nghỉ Việc', ArrowRightLeft],
] as const
const utilities = [
  ['/duplicate-check', 'Lọc trùng', Copy],
  ['/address-tools?mode=split', 'Tách địa chỉ', MapPin],
  ['/address-tools?mode=merge', 'Gộp địa chỉ', Layers3],
  ['/legacy/v26.html?page=t5', 'PDF → ảnh', FileImage],
  ['/legacy/v26.html?page=t7', 'Lưu trữ tài liệu', FolderArchive],
] as const
const admin = [
  ['/user-management', 'Quản Lý Tài Khoản', UserCog],
  ['/audit-log', 'Nhật Ký Hệ Thống', ClipboardList],
  ['/legacy/v26.html?page=backup', 'Sao lưu · Khôi phục', DatabaseBackup],
] as const

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname(); const router = useRouter(); const { account, user, signOut } = useAuth()
  const active=(href:string)=>href==='/'?path===href:path.startsWith(href)
  const roleLabel = ({admin:'Quản trị viên',manager:'Quản lý',staff:'Nhân viên',viewer:'Chỉ xem'} as Record<string,string>)[account?.role||'viewer']
  const nav=(items:readonly (readonly [string,string,React.ComponentType<{size?:number}>])[])=>items.map(([href,label,Icon])=>href.includes('.html')?<a key={href} href={href} className="navItem"><Icon size={18}/><span>{label}</span><span className="badge">LEGACY</span></a>:<Link key={href} href={href} className={`navItem ${active(href)?'active':''}`}><Icon size={18}/><span>{label}</span></Link>)
  return <div className="app"><aside className="sidebar"><div className="brand"><div className="brandIcon"><Building2 size={20}/></div><div><strong>KÝ TÚC XÁ</strong><small>HÓC MÔN</small></div></div><nav className="nav"><div className="navLabel">CHỨC NĂNG CHÍNH</div>{nav(primary)}<div className="navLabel">TIỆN ÍCH</div>{nav(utilities)}{account?.role==='admin'&&<><div className="navLabel">QUẢN TRỊ HỆ THỐNG</div>{nav(admin)}</>}<div className="navLabel">TÀI KHOẢN</div><Link href="/account" className={`navItem ${active('/account')?'active':''}`}><CircleUserRound size={18}/><span>Tài khoản của tôi</span></Link><div className="navLabel">HỆ THỐNG</div><button className="navItem" onClick={()=>location.reload()}><RefreshCw size={17}/><span>Đồng bộ dữ liệu</span></button><div className="navItem"><HardDrive size={17}/><span>Supabase Online</span><span className="badge">LIVE</span></div></nav><div className="userFoot"><div className="userCard"><Link href="/account" style={{display:'flex',gap:10,alignItems:'center',minWidth:0,flex:1,textDecoration:'none',color:'inherit'}}><div className="avatar">{(account?.display_name||user?.email||'?').slice(0,1).toUpperCase()}</div><div style={{minWidth:0,flex:1}}><b>{account?.display_name||user?.email?.split('@')[0]}</b><small>{roleLabel}</small></div></Link><button className="btn ghost" title="Đăng xuất" onClick={async()=>{await signOut();router.replace('/login')}}><LogOut size={15}/></button></div></div></aside><main className="main">{children}</main></div>
}
