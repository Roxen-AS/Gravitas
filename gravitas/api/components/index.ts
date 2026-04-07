import type { VercelRequest, VercelResponse } from '@vercel/node'
import { db, schema } from '../../lib/db.js'

export default async function handler(req: VercelRequest | any, res: VercelResponse | any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    if (req.method === 'GET') {
      const rows = await db.select().from(schema.components)
      const edgeRows = await db.select().from(schema.edges)
      return res.status(200).json({ components: rows, edges: edgeRows })
    }
    if (req.method === 'POST') {
      const { id, label, description, posX, posY } = req.body
      const [comp] = await db.insert(schema.components)
        .values({ id, label, description: description ?? '', posX: posX ?? 0, posY: posY ?? 0 })
        .onConflictDoUpdate({ target: schema.components.id, set: { label, description, posX, posY } })
        .returning()
      return res.status(200).json({ component: comp })
    }
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('API error:', err)
    return res.status(500).json({ error: String(err) })
  }
}
