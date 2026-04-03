export interface PostItem {
  name: string
  price_approx?: string
  purchase_url?: string
  image_url?: string
}

export interface CommunityComment {
  id: string
  nickname: string
  password: string
  text: string
  created_at: string
}

export interface CommunityPost {
  id: string
  nickname: string
  password: string
  snack_name: string
  short_desc: string
  price_approx?: string
  purchase_url?: string
  image_url?: string
  items?: PostItem[]
  recommendations: number
  voter_ids: string[]
  comments: CommunityComment[]
  created_at: string
}

// API 응답용 (비밀번호·voter_ids 제외)
export interface PublicComment {
  id: string
  nickname: string
  text: string
  created_at: string
}

export interface PublicPost {
  id: string
  nickname: string
  snack_name: string
  short_desc: string
  price_approx?: string
  purchase_url?: string
  image_url?: string
  items?: PostItem[]
  recommendations: number
  comments: PublicComment[]
  created_at: string
}
