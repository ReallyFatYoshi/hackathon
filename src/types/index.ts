export type UserRole = 'client' | 'chef' | 'admin'

export type ApplicationStatus =
  | 'pending_review'
  | 'interview_scheduled'
  | 'interview_completed'
  | 'approved'
  | 'rejected'
  | 'no_show'

export type InterviewStatus = 'scheduled' | 'in_progress' | 'completed' | 'no_show' | 'cancelled'

export type EventStatus = 'open' | 'filled' | 'completed' | 'cancelled'

export type EventApplicationStatus = 'pending' | 'accepted' | 'rejected'

export type BookingStatus = 'confirmed' | 'completed' | 'disputed' | 'cancelled'

export type PaymentStatus = 'held' | 'released' | 'refunded'

export interface UserProfile {
  id: string
  role: UserRole
  full_name: string
  email: string
  phone?: string
  created_at: string
}

export type ApplicantType = 'individual' | 'company'

export interface ChefApplication {
  id: string
  user_id: string
  status: ApplicationStatus
  applicant_type: ApplicantType
  company_name?: string
  first_name: string
  last_name: string
  email: string
  phone: string
  years_experience: number
  cuisine_specialties: string[]
  event_specialties: string[]
  bio: string
  portfolio_images: string[]
  social_links?: Record<string, string>
  admin_notes?: string
  created_at: string
  updated_at: string
}

export interface Interview {
  id: string
  application_id: string
  scheduled_at: string
  daily_room_url: string
  daily_room_name: string
  status: InterviewStatus
  notes?: string
  created_at: string
  chef_applications?: ChefApplication
}

export interface Chef {
  id: string
  user_id: string
  application_id: string
  applicant_type: ApplicantType
  company_name?: string
  first_name: string
  last_name: string
  bio: string
  years_experience: number
  cuisine_specialties: string[]
  event_specialties: string[]
  portfolio_images: string[]
  social_links?: Record<string, string>
  total_events: number
  avg_rating: number
  is_visible: boolean
  created_at: string
}

export interface Event {
  id: string
  client_id: string
  title: string
  event_type: string
  date: string
  location: string
  guest_count: number
  budget_min: number
  budget_max: number
  description: string
  status: EventStatus
  created_at: string
  profiles?: UserProfile
}

export interface EventApplication {
  id: string
  event_id: string
  chef_id: string
  message: string
  status: EventApplicationStatus
  created_at: string
  chefs?: Chef
  events?: Event
}

export interface Booking {
  id: string
  event_id: string
  chef_id: string
  client_id: string
  amount: number
  commission_pct: number
  payment_status: PaymentStatus
  booking_status: BookingStatus
  stripe_payment_intent_id?: string
  chef_completed_at?: string
  client_confirmed_at?: string
  created_at: string
  events?: Event
  chefs?: Chef
  profiles?: UserProfile
}

export interface Review {
  id: string
  booking_id: string
  client_id: string
  chef_id: string
  rating: number
  comment: string
  created_at: string
}

export type MessageType = 'text' | 'system' | 'call_started' | 'call_ended'

export interface Message {
  id: string
  booking_id: string
  sender_id: string
  content: string
  type: MessageType
  created_at: string
}

export interface CallSignal {
  type: 'offer' | 'answer' | 'ice-candidate' | 'call-request' | 'call-accept' | 'call-reject' | 'call-end'
  sender_id: string
  payload: Record<string, unknown>
}

export interface NavItem {
  label: string
  href: string
}
