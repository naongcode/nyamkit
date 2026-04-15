export type PrepType = '그냥먹기' | '전자레인지' | '에어프라이어' | '끓이기' | '전기밥솥'

export type Category = '냉동식품' | '과자' | '라면·면·즉석' | '음료' | '편의점' | '야채' | '소스·양념·재료' | '기타'

export type Tag = '주인장픽' | '신상' | '혼밥' | '야식' | '든든함' | '간단함'

export interface SnackPrep {
  steps: string[]
  time_min: number
}

export interface SnackLink {
  label: string                   // 예: "지현맘", "쿠팡"
  url: string
  type: 'recipe' | 'product'     // 조리법 참고 | 관련 상품
}

export interface Snack {
  id: string
  name: string
  short_desc: string
  description?: string          // 조리법/자유 메모
  category: Category
  price_approx: string
  volume: string
  value_score: number        // 1~5
  prep_type: PrepType
  tags: Tag[]
  prep?: SnackPrep           // 선택 - 그냥먹기면 없음
  links?: SnackLink[]
  purchase_url: string
  image_url: string
  created_at: string
  likes?: number
  voter_ids?: string[]
}

export type SnackSummary = Pick<Snack, 'id' | 'name' | 'image_url' | 'price_approx' | 'purchase_url'>

// 꿀조합
export interface ComboItem {
  type: 'existing' | 'custom'
  snack_id?: string   // type === 'existing'
  name?: string       // type === 'custom'
  price?: string      // type === 'custom'
  url?: string        // type === 'custom'
  note?: string
}

export interface HoneyCombo {
  id: string
  user_id: string
  nickname: string
  title: string
  description?: string
  image_url?: string
  items: ComboItem[]
  likes: number
  voter_ids: string[]
  created_at: string
}
