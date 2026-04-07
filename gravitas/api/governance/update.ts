import type { VercelRequest, VercelResponse } from '@vercel/node'
import { db, schema } from '../../lib/db.js'
import { eq } from 'drizzle-orm'

export default async function handler(req: VercelRequest | any, res: VercelResponse | any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { decisionId, status, owner, reviewers, notes } = req.body
    if (!decisionId) return res.status(400).json({ error: 'decisionId required' })

    const [updated] = await db.update(schema.governance)
      .set({
        ...(status !== undefined && { status }),
        ...(owner !== undefined && { owner }),
        ...(reviewers !== undefined && { reviewers }),
        ...(notes !== undefined && { notes }),
        updatedAt: new Date(),
      })
      .where(eq(schema.governance.decisionId, decisionId))
      .returning()

    return res.status(200).json({ governance: updated })
  } catch (err) {
    console.error('[POST /api/governance/update]', err)
    return res.status(500).json({ error: String(err) })
  }
}
