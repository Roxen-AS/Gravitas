import type { VercelRequest, VercelResponse } from '@vercel/node'
import { generateNarrative } from '../../lib/narrative'
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

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: `You are a technical writing assistant for an architecture decision record system called Gravitas.
Your ONLY job is to improve the clarity and flow of a decision narrative.
STRICT RULES:
- Do NOT introduce any new facts, costs, or claims not present in the input
- Do NOT add opinions like "good decision" or "wise choice"
- Return ONLY the improved narrative as plain prose — no markdown, no headers
- Keep roughly the same length as the input` }]
          },
          contents: [{ parts: [{ text: `Refine this decision narrative. Do not introduce new facts:\n\n${rawText}` }] }],
          generationConfig: { maxOutputTokens: 400, temperature: 0.3 }
        }),
      }
    )

    if (!response.ok) {
      const err = await response.text()
      return res.status(500).json({ error: 'Gemini API call failed', detail: err })
    }

    const data = await response.json()
    const refined = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? rawText
    return res.status(200).json({ narrative: { ...base, refined } })
  } catch (err) {
    console.error('[POST /api/narrative/refine]', err)
    return res.status(500).json({ error: String(err) })
  }
}