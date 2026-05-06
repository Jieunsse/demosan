export type PartyStatus = 'open' | 'closed' | 'ordered'

export interface Profile {
  id: string
  email: string
  name: string
  avatar_url: string | null
  dorm_building: string | null
  created_at: string
}

export interface Party {
  id: string
  host_id: string
  restaurant_name: string
  order_url: string | null
  min_order_amount: number
  current_amount: number
  deadline: string
  pickup_location: string
  status: PartyStatus
  kakao_pay_link: string | null
  created_at: string
  host?: Profile
  party_members?: PartyMember[]
}

export interface PartyMember {
  id: string
  party_id: string
  user_id: string
  menu_note: string | null
  amount: number
  joined_at: string
  profile?: Profile
}
