export type SlotStatus = 'open' | 'few_left' | 'full'
export type BookingStatus = 'confirmed' | 'cancelled'

export interface Studio {
  id: string
  code: string
  name: string
  shoot_type: string
}

export interface TimeSlot {
  id: string
  studio_id: string
  starts_at: string
  ends_at: string
  capacity: number
  booked_count: number
  status: SlotStatus
}

export interface Booking {
  id: string
  user_id: string
  slot_id: string
  status: BookingStatus
  studio_name: string
  studio_code: string
  shoot_type: string
  starts_at: string
  ends_at: string
  guest_email: string | null
  guest_name: string | null
  city: string | null
  region: string | null
  country: string | null
  created_at: string
}

export interface Profile {
  id: string
  display_name: string | null
  initial: string
}
