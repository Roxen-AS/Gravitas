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

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY environment variable not set' })
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ 
              text: `You are a technical writing assistant for an architecture decision record system called Gravitas.
Your ONLY job is to improve the clarity and flow of a decision narrative.
STRICT RULES:
- Do NOT introduce any new facts, costs, or claims not present in the input
- Do NOT add opinions like "good decision" or "wise choice"
- Return ONLY the improved narrative as plain prose — no markdown, no headers
- Keep roughly the same length as the input` 
            }]
          },
          contents: [{ 
            parts: [{ 
              text: `Refine this decision narrative. Do not introduce new facts:\n\n${rawText}` 
            }] 
          }],
          generationConfig: { maxOutputTokens: 400, temperature: 0.3 }
        }),
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      console.error('[POST /api/narrative/refine] API error:', response.status, errText)
      return res.status(500).json({ error: 'Gemini API call failed', status: response.status, detail: errText })
    }

    const data = await response.json()
    console.log('[POST /api/narrative/refine] Response structure:', JSON.stringify(data, null, 2).substring(0, 500))
    
    const refined = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!refined) {
      console.error('[POST /api/narrative/refine] Unexpected response structure:', JSON.stringify(data, null, 2))
      return res.status(500).json({ error: 'Unexpected Gemini response structure', response: data })
    }

    return res.status(200).json({ narrative: { ...base, refined } })
  } catch (err) {
    console.error('[POST /api/narrative/refine] Exception:', err instanceof Error ? err.message : String(err), err instanceof Error ? err.stack : '')
    return res.status(500).json({ error: 'Refinement failed', detail: err instanceof Error ? err.message : String(err) })
  }
}