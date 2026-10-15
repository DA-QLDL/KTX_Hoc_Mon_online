'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import type { Account } from './types'

type AuthContextValue = {
  loading: boolean
  session: Session | null
  user: User | null
  account: Account | null
  recovery: boolean
  refreshAccount: () => Promise<Account | null>
  requestAccess: () => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [account, setAccount] = useState<Account | null>(null)
  const [recovery, setRecovery] = useState(false)

  const loadAccount = useCallback(async (userId?: string): Promise<Account | null> => {
    const id = userId
    if (!id) { setAccount(null); return null }
    const { data, error } = await supabase
      .from('app_accounts')
      .select('user_id,email,display_name,role,ktx,days,enabled,created_at,updated_at')
      .eq('user_id', id)
      .maybeSingle()
    if (error) console.error('loadAccount', error)
    const next = (data as Account | null) || null
    setAccount(next)
    return next
  }, [])

  const requestAccess = useCallback(async () => {
    const current = session?.user
    if (!current) return { error: 'Chưa đăng nhập.' }
    const displayName = String(current.user_metadata?.name || current.email?.split('@')[0] || 'Người dùng')
    const { error } = await supabase.from('access_requests').upsert({
      user_id: current.id,
      email: current.email,
      display_name: displayName,
      status: 'pending',
      requested_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    return { error: error?.message || null }
  }, [session?.user])

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      const next = data.session
      setSession(next)
      if (next) await loadAccount(next.user.id)
      else setAccount(null)
      if (active) setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === 'PASSWORD_RECOVERY') setRecovery(true)
      if (event === 'SIGNED_OUT') setRecovery(false)
      setSession(next)
      setLoading(true)
      Promise.resolve(next ? loadAccount(next.user.id) : setAccount(null)).finally(() => setLoading(false))
    })
    return () => { active = false; listener.subscription.unsubscribe() }
  }, [loadAccount])

  const value = useMemo<AuthContextValue>(() => ({
    loading,
    session,
    user: session?.user || null,
    account,
    recovery,
    refreshAccount: async () => session?.user ? loadAccount(session.user.id) : null,
    requestAccess,
    signOut: async () => { setRecovery(false); await supabase.auth.signOut() },
  }), [loading, session, account, recovery, loadAccount, requestAccess])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth phải nằm trong AuthProvider')
  return value
}
