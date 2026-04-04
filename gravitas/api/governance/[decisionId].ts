import type { VercelRequest, VercelResponse } from '@vercel/node'
import { db, schema } from '../../lib/db'
import { eq } from 'drizzle-orm'

export default async function handler(req: VercelRequest | any, res: VercelResponse | any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const decisionId = (req.query.decisionId ?? req.params?.decisionId) as string
  if (!decisionId) return res.status(400).json({ error: 'decisionId required' })

  try {
    const rows = await db.select().from(schema.governance)
      .where(eq(schema.governance.decisionId, decisionId))
    return res.status(200).json({ governance: rows[0] ?? null })
  } catch (err) {
    console.error('[GET /api/governance]', err)
    return res.status(500).json({ error: String(err) })
  }
}
