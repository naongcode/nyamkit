# 냠킷 구현 순서

> **전략**: 로컬에서 어드민 완성 → 데이터 수동 입력 → 프론트 완성 → 웹 배포

---

## Phase 1 - 로컬 어드민 (데이터 입력 시스템)

> 목표: 쿠팡 URL 입력 → 자동파싱 → JSON 저장

### Step 1. 프로젝트 세팅
- [ ] `npx create-next-app@latest nyamkit` (TypeScript + Tailwind)
- [ ] Next.js 최신 버전 확인
- [ ] `/data/snacks.json` 초기 파일 생성 (`[]`)
- [ ] `.env.local` 생성 → 쿠팡 파트너스 키 입력
- [ ] `.gitignore`에 `.env.local` 추가

### Step 2. 타입 정의
- [ ] `/types/snack.ts` - Snack 인터페이스 정의

### Step 3. JSON 저장 API
- [ ] `/app/api/snacks/route.ts`
  - `GET` - 전체 목록 반환
  - `POST` - 새 간식 추가 (ID 자동생성, created_at 자동)
  - `DELETE` - ID로 삭제

### Step 4. 쿠팡 파트너스 API 연동
- [ ] `/app/api/parse-url/route.ts`
  - URL에서 상품 ID 추출
  - 쿠팡 파트너스 API 호출 (HMAC 서명)
  - 상품명 / 가격 / 이미지 반환

### Step 5. 어드민 UI
- [ ] `/app/admin/page.tsx`
  - 쿠팡 URL 입력 + "불러오기" 버튼
  - 자동완성 폼 (이름, 가격, 용량, 이미지 미리보기)
  - 수동 입력 필드 (short_desc, prep_type, prep steps, value_score, 태그, 카테고리)
  - 저장 → POST API
  - 등록된 간식 목록 (수정/삭제)

---

## Phase 2 - 데이터 입력 기간

> 어드민으로 간식 데이터 수동 입력 (하루 3~5개 목표)

---

## Phase 3 - 사용자 화면

> 목표: JSON 데이터 기반 프론트 완성 후 배포

### Step 6. 공통 컴포넌트
- [ ] `SnackCard` - 이미지, 이름, 가격, prep_type 아이콘, value_score
- [ ] `PrepBadge` - 준비 방식 뱃지 (그냥먹기 / 전자레인지 / 에어프라이어 등)

### Step 7. 메인 페이지
- [ ] `/app/page.tsx`
  - 주인장 픽 TOP (value_score 5점)
  - 카테고리별 미리보기
  - 랜덤 추천 버튼

### Step 8. 상세 페이지
- [ ] `/app/snack/[id]/page.tsx`
  - 이미지, 이름, 가격, 용량, short_desc
  - 준비 방법 (steps 있으면 표시, 없으면 생략)
  - 쿠팡 구매 링크 버튼
  - 카카오톡 공유 / 링크 복사 버튼

### Step 9. 카테고리 페이지
- [ ] `/app/category/[slug]/page.tsx`
  - 카테고리별 목록
  - prep_type 필터
  - 가성비순 / 최신순 정렬

### Step 10. 배포
- [ ] Vercel 배포
- [ ] 환경변수 Vercel에 등록

---

## 파일 구조

```
nyamkit/
├── app/
│   ├── page.tsx                     # 메인
│   ├── admin/
│   │   └── page.tsx                 # 어드민 입력 UI
│   ├── snack/[id]/
│   │   └── page.tsx                 # 상세 페이지
│   ├── category/[slug]/
│   │   └── page.tsx                 # 카테고리 페이지
│   └── api/
│       ├── parse-url/
│       │   └── route.ts             # 쿠팡 URL 파싱
│       └── snacks/
│           └── route.ts             # JSON CRUD
├── components/
│   ├── SnackCard.tsx
│   └── PrepBadge.tsx
├── types/
│   └── snack.ts                     # 타입 정의
├── data/
│   └── snacks.json                  # 데이터 저장소
├── .env.local                       # 쿠팡 파트너스 키 (gitignore)
└── .gitignore
```
