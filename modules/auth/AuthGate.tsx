'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from './AuthProvider'

const PUBLIC_ROUTES = ['/login']

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { loading, user, account } = useAuth()
  const path = usePathname()
  const router = useRouter()
  const isPublic = PUBLIC_ROUTES.some(p => path === p || path.startsWith(p + '/'))
  const isPending = path === '/pending'

  useEffect(() => {
    if (loading) return
    if (!user) {
      if (!isPublic) router.replace('/login')
      return
    }
    if (!account?.enabled) {
      if (!isPending && !isPublic) router.replace('/pending')
      return
    }
    if ((isPublic || isPending) && account.enabled) router.replace('/')
  }, [loading, user, account, isPublic, isPending, router])

  if (loading) return <div className="screen-center"><div className="spinner"/><p>Đang xác thực tài khoản...</p></div>
  if (!user && !isPublic) return <div className="screen-center"><div className="spinner"/><p>Đang chuyển tới đăng nhập...</p></div>
  if (user && !account?.enabled && !isPending && !isPublic) return <div className="screen-center"><div className="spinner"/><p>Đang kiểm tra quyền sử dụng...</p></div>
  return <>{children}</>
}
