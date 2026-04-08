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

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not set in environment variables' })
    }

    const base = generateNarrative(event)
    const rawText = base.sentences.map(s => s.text).join(' ')

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`

    const payload = JSON.stringify({
      contents: [{
        parts: [{
          text: `You are a technical writing assistant for an architecture decision record system called Gravitas.
Your ONLY job is to improve the clarity and flow of the following decision narrative.
RULES: Do NOT introduce new facts. Do NOT add opinions. Return ONLY plain prose, same length.

Narrative to refine:
${rawText}`
        }]
      }],
      generationConfig: {
        maxOutputTokens: 400,
        temperature: 0.3,
      }
    })

    // Retry up to 3 times with exponential backoff on 429
    let geminiRes: Response | null = null
    let responseText = ''

    for (let attempt = 1; attempt <= 3; attempt++) {
      geminiRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      })
      responseText = await geminiRes.text()

      if (geminiRes.status !== 429) break

      console.warn(`[Gemini] 429 rate limit — attempt ${attempt}/3, waiting ${attempt * 2}s`)
      await new Promise(r => setTimeout(r, attempt * 2000))
    }

    if (!geminiRes || !geminiRes.ok) {
      console.error('[Gemini error]', geminiRes?.status, responseText)
      return res.status(500).json({
        error: `Gemini API returned ${geminiRes?.status}`,
        detail: responseText,
      })
    }

    const data = JSON.parse(responseText)
    const refined = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? rawText

    return res.status(200).json({ narrative: { ...base, refined } })
  } catch (err) {
    console.error('[POST /api/narrative/refine]', err)
    return res.status(500).json({ error: String(err) })
  }
}