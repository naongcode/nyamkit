# 냠킷 프로젝트

냠냠이의 먹킷리스트 — 가성비 간식 큐레이션 플랫폼

## 기술 스택

- Next.js 16, React 19, TypeScript
- Tailwind CSS 4
- 데이터 저장: `data/snacks.json` (파일 기반)

## 핵심 원칙

- 모바일 반응형 항상 고려할 것
- 색상 테마: 주황(orange-500) 기반
- 심플하고 emoji-rich한 UI

---

## 페이지 구조

| 경로 | 역할 |
|------|------|
| `/` | 홈 — 주인장픽 3열 그리드 + 카테고리별 가로 스크롤 |
| `/snack/[id]` | 상세 페이지 |
| `/category/[slug]` | 카테고리별 목록 + 필터/정렬 |
| `/admin` | 어드민 (입력탭 / 목록탭) |

---

## 데이터 구조 (`types/snack.ts`)

```typescript
type PrepType = '그냥먹기' | '전자레인지' | '에어프라이어' | '끓이기' | '전기밥솥'
type Category = '냉동식품' | '과자' | '라면·즉석' | '음료' | '편의점' | '기타'
type Tag = '주인장픽' | '신상' | '혼밥' | '야식' | '든든함' | '간단함'

interface SnackLink {
  label: string                   // 예: "지현맘", "쿠팡"
  url: string
  type: 'recipe' | 'product'     // 조리법 참고 | 관련 상품
}

interface Snack {
  id: string
  name: string
  short_desc: string
  description?: string          // 자유 메모
  category: Category
  price_approx: string          // "약 3,980원" 형식
  volume: string                // "375g"
  value_score: number           // 1~5 (가격점수, 가성비 기반 자동계산)
  prep_type: PrepType
  tags: Tag[]
  prep?: { steps: string[], time_min: number }  // 그냥먹기면 없음
  links?: SnackLink[]           // 조리법 참고 / 관련상품 링크
  purchase_url: string
  image_url: string
  created_at: string
}
```

---

## 컴포넌트

| 컴포넌트 | 역할 |
|----------|------|
| `SnackCard` | 정사각형 카드 (홈 픽, 카테고리 그리드) |
| `SnackCardSmall` | 가로형 카드 |
| `ScrollRow` | 가로 스크롤 줄 — 모바일은 터치 스와이프, 데스크탑은 ‹ › 버튼 |
| `RandomButton` | 랜덤 간식 이동 — 모바일은 🎲만 표시 |
| `ShareButton` | 공유/링크 복사 |

---

## 어드민 (`/admin`)

- **입력탭 / 목록탭** 으로 분리
- 쿠팡 URL 자동완성 (이름·가격·이미지·구매링크 파싱)
- 가격 + 용량 입력 시 가격점수(value_score) 자동계산
- 입력 필드 배치: 가격 | 용량 | 가격점수 (3열)
- 링크 추가: 타입(🎬 조리법 / 🛍️ 관련상품) 선택 후 이름 + URL 입력
- 목록탭: 2열 그리드, 수정 클릭 시 입력탭으로 자동 이동

---

## 상세 페이지 (`/snack/[id]`)

- 이미지 + 정보: 모바일 세로 스택 / 데스크탑 가로 배치
- 별점(★) = 가격점수 (일반 평점 아님) — "가격점수 X.0 / 5" 로 표기
- SnackCard 별점 옆에도 "가격점수" 라벨 표시
- 링크 섹션: 조리법 참고(회색 버튼) / 관련 상품(주황 버튼) 분리 표시

---

## API

| 엔드포인트 | 메서드 | 역할 |
|------------|--------|------|
| `/api/snacks` | GET | 전체 목록 |
| `/api/snacks` | POST | 신규 등록 |
| `/api/snacks` | PUT | 수정 |
| `/api/snacks` | DELETE | 삭제 |
| `/api/parse-url` | POST | 쿠팡 URL 파싱 |
