import type { VercelRequest, VercelResponse } from '@vercel/node'
import { db, schema } from '../../lib/db.js'

export default async function handler(req: VercelRequest | any, res: VercelResponse | any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const body = req.body
    const { component, choice, description, rationale, assumptions, costs, alternatives, forkId, forkParentId, owner, reviewers } = body

    if (!component || !choice || !rationale || !costs) {
      return res.status(400).json({ error: 'Missing required fields: component, choice, rationale, costs' })
    }

    const [event] = await db.insert(schema.events).values({
      component,
      choice,
      description: description ?? '',
      rationale,
      assumptions: assumptions ?? [],
      costs,
      alternatives: alternatives ?? [],
      forkId: forkId ?? null,
      forkParentId: forkParentId ?? null,
    }).returning()

    await db.insert(schema.governance).values({
      decisionId: event.id,
      owner: owner ?? 'unassigned',
      status: 'proposed',
      reviewers: reviewers ?? [],
      notes: '',
    })

    return res.status(201).json({ event })
  } catch (err) {
    console.error('API error:', err)
    return res.status(500).json({ error: String(err) })
  }
}
