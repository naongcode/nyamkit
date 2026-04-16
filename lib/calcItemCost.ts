/**
 * 꿀조합 재료 1개의 실사용 원가 계산
 *
 * use_amount 입력 규칙:
 *  - "20g" / "50ml" / "0.5kg" → volume 기반 (snack.volume에서 총량 파싱)
 *  - "1/20"                   → 분수 직접 입력 (pkg_count 불필요)
 *  - "1개" / "2"              → 개수 기반 (snack.pkg_count 필요)
 */
export function calcItemCost(
  price_approx: string | undefined,
  volume: string | undefined,
  pkg_count: number | undefined,
  use_amount: string | undefined,
): number | null {
  if (!use_amount?.trim() || !price_approx) return null
  const price = Number(price_approx.replace(/[^0-9]/g, ''))
  if (!price) return null

  const ua = use_amount.trim()

  // "1/20" 형식 → 직접 분수
  const fracMatch = ua.match(/^(\d+\.?\d*)\/(\d+\.?\d*)$/)
  if (fracMatch) {
    const num = parseFloat(fracMatch[1])
    const den = parseFloat(fracMatch[2])
    if (den > 0) return Math.round(price * (num / den))
  }

  // "20g" / "50ml" / "0.5kg" / "1l" 형식 → 무게·용량 기반
  const weightMatch = ua.match(/^(\d+\.?\d*)\s*(g|ml|kg|l|cc)$/i)
  if (weightMatch && volume) {
    const useNum = parseFloat(weightMatch[1])
    const useUnit = weightMatch[2].toLowerCase()
    const useNorm = useUnit === 'kg' ? useNum * 1000 : useUnit === 'l' ? useNum * 1000 : useNum

    const volMatch = volume.match(/(\d+\.?\d*)\s*(g|ml|kg|l|cc)/i)
    if (volMatch) {
      const volNum = parseFloat(volMatch[1])
      const volUnit = volMatch[2].toLowerCase()
      const volNorm = volUnit === 'kg' ? volNum * 1000 : volUnit === 'l' ? volNum * 1000 : volNum
      if (volNorm > 0) return Math.round(price * (useNorm / volNorm))
    }
  }

  // "1개" / "2개" / 순수 숫자 → 개수 기반
  const countMatch = ua.match(/^(\d+\.?\d*)\s*개?$/)
  if (countMatch && pkg_count && pkg_count > 0) {
    const useNum = parseFloat(countMatch[1])
    return Math.round(price * (useNum / pkg_count))
  }

  return null
}

/** 입력 placeholder 힌트 */
export function getUseAmountPlaceholder(
  volume: string | undefined,
  pkg_count: number | undefined,
): string {
  if (volume) {
    const m = volume.match(/\d+\.?\d*\s*(g|ml|kg|l|cc)/i)
    if (m) return `예: 20${m[1].toLowerCase()}`
  }
  if (pkg_count) return `예: 1개 (총 ${pkg_count}개)`
  return '예: 20g, 1/20, 1개'
}
