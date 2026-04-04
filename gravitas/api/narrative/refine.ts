import type { VercelRequest, VercelResponse } from '@vercel/node'
import OpenAI from 'openai'
import { generateNarrative } from '../../lib/narrative'
import type { DecisionEvent } from '../../lib/types'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 400,
      messages: [
        {
          role: 'system',
          content: `You are a technical writing assistant for an architecture decision record system called Gravitas.
Your ONLY job is to improve the clarity and flow of the provided decision narrative.

STRICT RULES:
- Do NOT introduce any new facts, costs, percentages, or claims not present in the input
- Do NOT change the meaning of any sentence
- Do NOT add opinions or subjective judgements ("good decision", "wise choice")
- Do NOT use language like "this was the right call" or "clearly the best option"
- Return ONLY the improved narrative as plain prose — no markdown, no headers
- Keep roughly the same length as input`
        },
        {
          role: 'user',
          content: `Refine this decision narrative. Do not introduce new facts:\n\n${rawText}`
        }
      ]
    })

    const refined = completion.choices[0]?.message?.content ?? rawText
    return res.status(200).json({ narrative: { ...base, refined } })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Narrative refinement failed' })
  }
}
