import { optionalEnv } from './env'

export interface GeoInfo {
  ip: string
  city?: string
  region?: string
  country?: string
}

export function clientIp(req: Request): string {
  return (
    req.headers.get('x-nf-client-connection-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('cf-connecting-ip') ||
    '0.0.0.0'
  )
}

export async function lookupGeo(req: Request): Promise<GeoInfo> {
  const ip = clientIp(req)
  const apiKey = optionalEnv('IPGEOLOCATION_API_KEY')
  if (!apiKey || ip === '0.0.0.0' || ip === '127.0.0.1' || ip.startsWith('::')) {
    return { ip }
  }

  try {
    const url = new URL('https://api.ipgeolocation.io/v3/ipgeo')
    url.searchParams.set('apiKey', apiKey)
    url.searchParams.set('ip', ip)
    const res = await fetch(url)
    if (!res.ok) return { ip }
    const data = (await res.json()) as {
      location?: {
        city?: string
        state_prov?: string
        country_name?: string
      }
    }
    return {
      ip,
      city: data.location?.city,
      region: data.location?.state_prov,
      country: data.location?.country_name,
    }
  } catch {
    return { ip }
  }
}
