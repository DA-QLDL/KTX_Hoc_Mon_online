import { supabase } from '@/lib/supabase/client'

export type MealSupplier = {
  supplier: string
  td8: number | null
  td111: number | null
  td113: number | null
  savory: string
  vegetarian: string
  weight_check: string
}

export type MealReport = {
  id?: string
  report_date: string
  session: 'sang'|'trua'|'chieu'
  ktx: string
  price: string
  suppliers: MealSupplier[]
  report_text: string
  created_at?: string
  updated_at?: string
}

export async function saveMealReport(report: MealReport){
  const payload={...report,updated_at:new Date().toISOString()}
  if(report.id){
    const {data,error}=await supabase.from('meal_reports').update(payload).eq('id',report.id).select().single()
    if(error) throw error
    return data as MealReport
  }
  delete (payload as {id?:string}).id
  const {data,error}=await supabase.from('meal_reports').insert(payload).select().single()
  if(error) throw error
  return data as MealReport
}

export async function listMealReports(limit=30){
  const {data,error}=await supabase.from('meal_reports').select('*').order('report_date',{ascending:false}).order('created_at',{ascending:false}).limit(limit)
  if(error) throw error
  return (data||[]) as MealReport[]
}

export async function deleteMealReport(id:string){
  const {error}=await supabase.from('meal_reports').delete().eq('id',id)
  if(error) throw error
}
