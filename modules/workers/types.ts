export type Worker = {
  id: string
  name: string
  mnv: string | null
  cccd: string | null
  phone: string | null
  gender: string | null
  dob: string | null
  unit: string | null
  battalion: string | null
  leader: string | null
  leader_phone: string | null
  ktx: string | null
  day: string | null
  room: string | null
  bed: string | null
  village: string | null
  ward: string | null
  province: string | null
  address: string | null
  residence_status: string | null
  temporary_residence: boolean
  check_in_date: string | null
  check_out_date: string | null
  stay_days: number | null
  created_at: string
  updated_at: string
}

export type WorkerFilters = {
  q: string
  ktx: string
  day: string
  room: string
  battalion: string
  leader: string
  profile: string
  residence: string
}
