'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from './AuthProvider'

export function Protected({ children }: { children: React.ReactNode }) {
  const { loading, user, account } = useAuth()
  const router = useRouter()
  const path = usePathname()

  useEffect(() => {
    if (loading) return
    if (!user) router.replace('/login')
    else if ((!account || !account.enabled) && path !== '/pending') router.replace('/pending')
  }, [loading, user, account, path, router])

  if (loading || !user || !account?.enabled) {
    return <div className="screen-center"><div className="spinner"/><p>Đang xác thực tài khoản...</p></div>
  }
  return <>{children}</>
}
