import type { Config } from '@netlify/functions'
import { lookupGeo } from './_shared/geo'
import { corsPreflight, json } from './_shared/supabase'

export default async (req: Request) => {
  if (req.method === 'OPTIONS') return corsPreflight()
  if (req.method !== 'GET') return json({ error: 'Method not allowed' }, 405)

  try {
    const geo = await lookupGeo(req)
    return json(geo)
  } catch (err) {
    return json(
      { error: err instanceof Error ? err.message : 'Server error' },
      500,
    )
  }
}

export const config: Config = {
  path: '/api/geo',
}
