import { Client } from 'pg'
import { readFileSync } from 'fs'
import { join } from 'path'

const sql = readFileSync(
  join(__dirname, '../supabase/migrations/20260403000000_init.sql'),
  'utf-8'
)

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  console.log('Connected. Running migration...')
  await client.query(sql)
  console.log('Migration complete.')
  await client.end()
}

run().catch((e) => { console.error(e); process.exit(1) })
