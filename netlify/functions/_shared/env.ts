export function requireEnv(name: string): string {
  const value = process.env[name] || (Netlify?.env?.get?.(name) ?? '')
  if (!value) throw new Error(`Missing environment variable: ${name}`)
  return value
}

export function optionalEnv(name: string): string | undefined {
  return process.env[name] || Netlify?.env?.get?.(name) || undefined
}

declare const Netlify: { env?: { get?: (key: string) => string | undefined } } | undefined
