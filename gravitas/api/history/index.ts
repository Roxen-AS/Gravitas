import type { VercelRequest, VercelResponse } from '@vercel/node'
import { db, schema } from '../../lib/db'
import { eq, desc } from 'drizzle-orm'

export default async function handler(req: VercelRequest | any, res: VercelResponse | any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { component } = req.query
    const rows = component
      ? await db.select().from(schema.events)
          .where(eq(schema.events.component, component as string))
          .orderBy(desc(schema.events.timestamp))
      : await db.select().from(schema.events).orderBy(desc(schema.events.timestamp))

    return res.status(200).json({ events: rows })
  } catch (err) {
    console.error('[GET /api/history]', err)
    return res.status(500).json({ error: String(err) })
  }
}
