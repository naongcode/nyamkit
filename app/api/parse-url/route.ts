import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const ACCESS_KEY = process.env.COUPANG_ACCESS_KEY!
const SECRET_KEY = process.env.COUPANG_SECRET_KEY!
const DOMAIN = 'https://api-gateway.coupang.com'

function extractProductId(url: string): string | null {
  const match = url.match(/\/products\/(\d+)/)
  return match ? match[1] : null
}

function generateHmacSignature(method: string, url: string, datetime: string): string {
  const message = datetime + method + url
  return crypto.createHmac('sha256', SECRET_KEY).update(message).digest('hex')
}

export async function POST(req: NextRequest) {
  const { url } = await req.json()

  const productId = extractProductId(url)
  if (!productId) {
    return NextResponse.json({ error: '쿠팡 상품 URL이 아닙니다.' }, { status: 400 })
  }

  const path = `/v2/providers/affiliate_open_api/apis/openapi/v1/products/${productId}`
  const datetime = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '').slice(0, 15) + 'Z'
  const signature = generateHmacSignature('GET', path, datetime)

  const authorization = `CEA algorithm=HmacSHA256, access-key=${ACCESS_KEY}, signed-date=${datetime}, signature=${signature}`

  const res = await fetch(`${DOMAIN}${path}`, {
    headers: { Authorization: authorization },
  })

  if (!res.ok) {
    return NextResponse.json({ error: '상품 정보를 가져올 수 없습니다.' }, { status: res.status })
  }

  const data = await res.json()
  const item = data?.data

  if (!item) {
    return NextResponse.json({ error: '상품 데이터가 없습니다.' }, { status: 404 })
  }

  return NextResponse.json({
    name: item.productName ?? '',
    price_approx: item.salePrice ? `약 ${Math.round(item.salePrice / 1000)}천원대` : '',
    image_url: item.productImage ?? '',
    purchase_url: item.productUrl ?? url,
  })
}
