/** Public Google Form “viewform” URL from Form → Send → Link */
export const googleFormUrl = (import.meta.env.VITE_GOOGLE_FORM_URL as string | undefined)?.trim()

export const googleFormConfigured = Boolean(googleFormUrl)

/** Embeddable iframe src */
export function googleFormEmbedUrl(base = googleFormUrl): string | null {
  if (!base) return null
  try {
    const u = new URL(base)
    // Accept either /viewform or already-embedded links
    if (!u.pathname.includes('/viewform')) {
      // If they pasted a /formResponse or short link, still try embedded param
    }
    u.searchParams.set('embedded', 'true')
    return u.toString()
  } catch {
    return null
  }
}
