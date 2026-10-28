import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'
import { requireEnv } from './env'

export function getServiceClient(): SupabaseClient {
  const url = requireEnv('VITE_SUPABASE_URL')
  const key = requireEnv('SUPABASE_SERVICE_ROLE_KEY')
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function getUserFromRequest(req: Request): Promise<User | null> {
  const header = req.headers.get('authorization') || req.headers.get('Authorization')
  if (!header?.startsWith('Bearer ')) return null
  const token = header.slice(7)
  const client = getServiceClient()
  const { data, error } = await client.auth.getUser(token)
  if (error || !data.user) return null
  return data.user
}

export function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    },
  })
}

export function corsPreflight() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    },
  })
}
