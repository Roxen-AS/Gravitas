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
    
    // Log request to debug
    console.log('[POST /api/narrative/refine] Request received:', {
      hasEvent: !!event,
      hasId: !!event?.id,
      hasComponent: !!event?.component,
      hasChoices: !!event?.choice
    })
    
    if (!event?.id) return res.status(400).json({ error: 'Full decision event required' })

    let base: any
    let rawText: string
    try {
      base = generateNarrative(event)
      rawText = base.sentences.map((s: any) => s.text).join(' ')
    } catch (genErr) {
      console.error('[POST /api/narrative/refine] Failed to generate narrative:', genErr)
      return res.status(500).json({ error: 'Failed to generate narrative', detail: String(genErr) })
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('[POST /api/narrative/refine] GEMINI_API_KEY not set')
      return res.status(500).json({ error: 'GEMINI_API_KEY environment variable not set' })
    }

    console.log('[POST /api/narrative/refine] Calling Gemini API...')
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

    console.log('[POST /api/narrative/refine] Gemini responded with status:', response.status)

    if (!response.ok) {
      let errText = ''
      try {
        errText = await response.text()
      } catch {
        errText = '(could not read error response)'
      }
      console.error('[POST /api/narrative/refine] API error response:', errText)
      return res.status(500).json({ error: 'Gemini API call failed', status: response.status, detail: errText })
    }

    let data: any
    try {
      data = await response.json()
    } catch (parseErr) {
      console.error('[POST /api/narrative/refine] Failed to parse JSON response:', parseErr)
      return res.status(500).json({ error: 'Failed to parse Gemini response', detail: String(parseErr) })
    }
    
    console.log('[POST /api/narrative/refine] Response structure:', JSON.stringify(data, null, 2).substring(0, 500))
    
    const refined = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!refined) {
      console.error('[POST /api/narrative/refine] Unexpected response structure:', JSON.stringify(data, null, 2))
      return res.status(500).json({ error: 'Unexpected Gemini response structure', response: data })
    }

    console.log('[POST /api/narrative/refine] Success, returning refined narrative')
    return res.status(200).json({ narrative: { ...base, refined } })
  } catch (err) {
    try {
      const errMsg = err instanceof Error ? err.message : String(err)
      const errStack = err instanceof Error ? err.stack : ''
      console.error('[POST /api/narrative/refine] Exception:', errMsg, errStack)
      return res.status(500).json({ error: 'Refinement failed', detail: errMsg })
    } catch (sendErr) {
      console.error('[POST /api/narrative/refine] Failed to send error response:', sendErr)
      res.status(500).end('Internal server error')
    }
  }
}