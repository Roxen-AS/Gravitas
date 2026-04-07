import type { VercelRequest, VercelResponse } from '@vercel/node'
import { db } from '../../lib/db.js'
import { sql } from 'drizzle-orm'

export default async function handler(req: VercelRequest | any, res: VercelResponse | any) {
  try {
    await db.execute(sql`SELECT 1`)
    return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
  } catch (err) {
    return res.status(500).json({ status: 'error', message: String(err) })
  }
}
