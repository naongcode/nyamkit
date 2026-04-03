import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { Snack } from '@/types/snack'

const DATA_PATH = path.join(process.cwd(), 'data', 'snacks.json')

async function readSnacks(): Promise<Snack[]> {
  const raw = await fs.readFile(DATA_PATH, 'utf-8')
  return JSON.parse(raw)
}

async function writeSnacks(snacks: Snack[]) {
  await fs.writeFile(DATA_PATH, JSON.stringify(snacks, null, 2), 'utf-8')
}

export async function GET() {
  const snacks = await readSnacks()
  return NextResponse.json(snacks)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const snacks = await readSnacks()

  const newSnack: Snack = {
    ...body,
    id: `snack_${Date.now()}`,
    created_at: new Date().toISOString().split('T')[0],
  }

  snacks.unshift(newSnack)
  await writeSnacks(snacks)

  return NextResponse.json(newSnack, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const snacks = await readSnacks()
  const idx = snacks.findIndex((s) => s.id === body.id)
  if (idx === -1) return NextResponse.json({ error: 'not found' }, { status: 404 })
  snacks[idx] = { ...snacks[idx], ...body }
  await writeSnacks(snacks)
  return NextResponse.json(snacks[idx])
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const snacks = await readSnacks()
  const filtered = snacks.filter((s) => s.id !== id)
  await writeSnacks(filtered)
  return NextResponse.json({ ok: true })
}
