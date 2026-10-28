/** Public Google Form “viewform” URL from Form → Send → Link */
const DEFAULT_FORM =
  'https://docs.google.com/forms/d/e/1FAIpQLSckmY8Dh33rsvzMX1QpYfbBvj0uxywYyyRnjnq9Jlk21Nl3OA/viewform'

export const googleFormUrl =
  (import.meta.env.VITE_GOOGLE_FORM_URL as string | undefined)?.trim() || DEFAULT_FORM

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
