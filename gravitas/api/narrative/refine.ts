import type { VercelRequest, VercelResponse } from '@vercel/node'
import OpenAI from 'openai'
import { generateNarrative } from '../../lib/narrative.js'
import type { DecisionEvent } from '../../lib/types'

export default async function handler(req: VercelRequest | any, res: VercelResponse | any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const event: DecisionEvent = req.body
    if (!event?.id) return res.status(400).json({ error: 'Full decision event required' })

    const base = generateNarrative(event)
    const rawText = base.sentences.map(s => s.text).join(' ')

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return res.status(500).json({ error: 'OpenAI API key is missing in environment variables' })
    }

    const openai = new OpenAI({ apiKey })
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 400,
      messages: [
        {
          role: 'system',
          content: `You are a technical writing assistant for an architecture decision record system.
Your ONLY job is to improve the clarity and flow of a decision narrative.
STRICT RULES:
- Do NOT introduce any new facts, costs, or claims not present in the input
- Do NOT add opinions ("good decision", "wise choice")
- Return ONLY the improved narrative as plain prose — no markdown, no headers
- Keep roughly the same length as input`,
        },
        {
          role: 'user',
          content: `Refine this decision narrative. Do not introduce new facts:\n\n${rawText}`,
        },
      ],
    })

    const refined = completion.choices[0]?.message?.content ?? rawText
    return res.status(200).json({ narrative: { ...base, refined } })
  } catch (err) {
    console.error('API error:', err)
    return res.status(500).json({ error: String(err) })
  }
}
