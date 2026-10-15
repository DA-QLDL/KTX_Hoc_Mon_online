'use client'
import { QrCode } from 'lucide-react'
import { Protected } from '@/modules/auth/Protected'
import { AppShell } from '@/components/AppShell'
import { PageHeader } from '@/components/PageHeader'
export default function QR(){return <Protected><AppShell><div className="content"><PageHeader icon={QrCode} title="QR PORTAL" subtitle="Module sẽ được chuyển từ v26 ở giai đoạn tiếp theo"/><div className="card placeholder"><QrCode size={40}/><h2>Giữ nguyên hệ thống QR hiện tại trong thời gian chuyển đổi</h2><p>Điểm danh Online và Đăng ký vào/ra đang hoạt động bằng Supabase. Giai đoạn sau sẽ đưa toàn bộ QR Portal vào project Next.js này mà không làm gián đoạn link GitHub Pages đang sử dụng.</p></div></div></AppShell></Protected>}
