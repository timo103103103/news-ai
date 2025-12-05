import { createClient } from '@supabase/supabase-js'

type ResultRecord = {
  id: string
  type: string
  payload: any
  result: any
  created_at: string
}

const inMemory: ResultRecord[] = []

function supabaseClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (url && key) return createClient(url, key)
  return null
}

export async function saveResult(
  id: string,
  type: string,
  payload: any,
  result: any,
) {
  const created_at = new Date().toISOString()
  const sb = supabaseClient()
  if (!sb) {
    inMemory.push({ id, type, payload, result, created_at })
    return
  }
  // Upsert into Supabase tables if configured
  const { error: aErr } = await sb
    .from('analyses')
    .upsert({ id, type, status: 'succeeded', created_at })
  const { error: rErr } = await sb
    .from('analysis_results')
    .upsert({ analysis_id: id, result_json: result, summary_text: result?.data?.content || '' })
  if (aErr || rErr) {
    inMemory.push({ id, type, payload, result, created_at })
  }
}

export async function getResult(id: string): Promise<ResultRecord | null> {
  const sb = supabaseClient()
  if (!sb) {
    return inMemory.find((r) => r.id === id) || null
  }
  const { data, error } = await sb
    .from('analyses')
    .select('id,type,created_at')
    .eq('id', id)
    .single()
  if (error) {
    return inMemory.find((r) => r.id === id) || null
  }
  if (!data) return null
  const { data: res, error: rErr } = await sb
    .from('analysis_results')
    .select('result_json')
    .eq('analysis_id', id)
    .single()
  if (rErr) {
    return inMemory.find((r) => r.id === id) || null
  }
  return { id, type: (data as any).type, payload: {}, result: res?.result_json, created_at: (data as any).created_at }
}

export async function listResults(limit = 20): Promise<ResultRecord[]> {
  const sb = supabaseClient()
  if (!sb) return inMemory.slice(-limit).reverse()
  const { data, error } = await sb
    .from('analyses')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) return inMemory.slice(-limit).reverse()
  return (data || []).map((row: any) => ({ id: row.id, type: row.type, payload: {}, result: {}, created_at: row.created_at }))
}