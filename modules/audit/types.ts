export type AuditLog = {
  id: number
  created_at: string
  actor_id: string | null
  actor_email: string | null
  actor_role: string | null
  action: string
  entity_type: string
  entity_id: string | null
  summary: string | null
  old_data: unknown
  new_data: unknown
}
