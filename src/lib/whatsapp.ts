/** Digits only, country code included — e.g. 15551234567 */
const DEFAULT_NUMBER = '18143912442' // +1 814-391-2442

const raw =
  (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined)?.replace(/\D/g, '') ||
  DEFAULT_NUMBER

export const whatsappNumber = raw
export const whatsappConfigured = raw.length >= 8

const defaultMessage =
  "Hi PSLens — I'd like to book a Studio 04 reel shoot."

export function whatsappLink(message = defaultMessage): string | null {
  if (!whatsappConfigured) return null
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
}
