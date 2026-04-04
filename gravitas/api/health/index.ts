import type { VercelRequest, VercelResponse } from '@vercel/node'
import { db } from '../../lib/db'
import { sql } from 'drizzle-orm'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await db.execute(sql`SELECT 1`)
    return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
  } catch {
    return res.status(500).json({ status: 'error', message: 'DB unreachable' })
  }
}
