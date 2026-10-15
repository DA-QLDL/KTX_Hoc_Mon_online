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
  refreshAccount: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [account, setAccount] = useState<Account | null>(null)

  const loadAccount = useCallback(async (userId?: string) => {
    const id = userId || session?.user.id
    if (!id) { setAccount(null); return }
    const { data, error } = await supabase
      .from('app_accounts')
      .select('user_id,email,display_name,role,ktx,days,enabled,created_at,updated_at')
      .eq('user_id', id)
      .maybeSingle()
    if (error) console.error('loadAccount', error)
    setAccount((data as Account | null) || null)
  }, [session?.user.id])

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      setSession(data.session)
      if (data.session) await loadAccount(data.session.user.id)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      setLoading(true)
      Promise.resolve(next ? loadAccount(next.user.id) : setAccount(null)).finally(() => setLoading(false))
    })
    return () => { active = false; listener.subscription.unsubscribe() }
  }, [loadAccount])

  const value = useMemo<AuthContextValue>(() => ({
    loading, session, user: session?.user || null, account,
    refreshAccount: async () => loadAccount(),
    signOut: async () => { await supabase.auth.signOut() }
  }), [loading, session, account, loadAccount])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth phải nằm trong AuthProvider')
  return value
}
