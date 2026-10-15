import './globals.css'
import { AuthProvider } from '@/modules/auth/AuthProvider'
import { AuthGate } from '@/modules/auth/AuthGate'

export const metadata={title:'KTX Hóc Môn Online',description:'Hệ thống quản lý KTX công nhân trên Supabase'}

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="vi"><body><AuthProvider><AuthGate>{children}</AuthGate></AuthProvider></body></html>
}
