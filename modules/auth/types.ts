export type Role = 'admin' | 'manager' | 'staff' | 'viewer'

export type Account = {
  user_id: string
  email: string | null
  display_name: string | null
  role: Role
  ktx: string[]
  days: string[]
  enabled: boolean
  created_at?: string
  updated_at?: string
}
