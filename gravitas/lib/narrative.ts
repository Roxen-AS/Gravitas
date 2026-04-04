import type { DecisionEvent, Narrative, NarrativeSentence } from './types'

export function generateNarrative(event: DecisionEvent): Narrative {
  const sentences: NarrativeSentence[] = []

  // Sentence 1: what was chosen and why (rationale)
  sentences.push({
    text: `${event.component} adopted "${event.choice}" — ${event.rationale}.`,
    sources: ['choice', 'rationale', `timestamp:${event.timestamp}`],
  })

  // Sentence 2: dominant costs
  const costs = event.costs
  const sorted = Object.entries(costs).sort(([, a], [, b]) => b - a)
  const top = sorted.slice(0, 2).map(([k]) => k)
  const topStr = top.join(' and ')
  sentences.push({
    text: `The highest incurred costs are ${topStr} — reflecting the trade-offs inherent to this choice.`,
    sources: [`costs.${top[0]}:${costs[top[0] as keyof typeof costs]}`, `costs.${top[1]}:${costs[top[1] as keyof typeof costs]}`],
  })

  // Sentence 3: assumptions
  if (event.assumptions.length > 0) {
    sentences.push({
      text: `This decision rested on ${event.assumptions.length} recorded assumption${event.assumptions.length > 1 ? 's' : ''}: ${event.assumptions.slice(0, 2).join('; ')}.`,
      sources: event.assumptions.map((_, i) => `assumptions[${i}]`),
    })
  }

  // Sentence 4: alternatives
  if (event.alternatives.length > 0) {
    const altNames = event.alternatives.map(a => a.name).join(', ')
    sentences.push({
      text: `Alternatives considered but rejected: ${altNames}. Each was excluded based on explicit trade-off reasoning.`,
      sources: event.alternatives.map((_, i) => `alternatives[${i}].reason`),
    })
  }

  // Sentence 5: fork context
  if (event.forkId) {
    sentences.push({
      text: `This is a forked reality from decision ${event.forkParentId ?? 'origin'} — a counterfactual path, not the production state.`,
      sources: [`forkId:${event.forkId}`, `forkParentId:${event.forkParentId}`],
    })
  }

  return { sentences }
}

export function computeCostDelta(
  original: DecisionEvent,
  fork: DecisionEvent
): Record<string, number> {
  const delta: Record<string, number> = {}
  const keys = ['cognitive', 'operational', 'performance', 'financial', 'change'] as const
  for (const k of keys) {
    delta[k] = fork.costs[k] - original.costs[k]
  }
  return delta
}
