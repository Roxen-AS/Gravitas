import { useState, useEffect, useCallback } from 'react'
import type { DecisionEvent, GovernanceRecord, Narrative } from '@lib/types'

const BASE = '/api'

export function useGravitas() {
  const [components, setComponents] = useState<any[]>([])
  const [edgeData, setEdgeData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchGraph = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/components`)
      const data = await res.json()
      setComponents(data.components ?? [])
      setEdgeData(data.edges ?? [])
    } catch (e) {
      console.error('Failed to fetch graph', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchGraph() }, [fetchGraph])

  const addComponent = useCallback(async (payload: {
    id: string; label: string; description: string; posX: number; posY: number
  }) => {
    await fetch(`${BASE}/components`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    await fetchGraph()
  }, [fetchGraph])

  return { components, edgeData, loading, fetchGraph, addComponent }
}

export function useComponentHistory(componentId: string | null) {
  const [events, setEvents] = useState<DecisionEvent[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!componentId) { setEvents([]); return }
    setLoading(true)
    fetch(`/api/history?component=${encodeURIComponent(componentId)}`)
      .then(r => r.json())
      .then(d => setEvents(d.events ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [componentId])

  return { events, loading }
}

export function useGovernance(decisionId: string | null) {
  const [gov, setGov] = useState<GovernanceRecord | null>(null)

  useEffect(() => {
    if (!decisionId) { setGov(null); return }
    fetch(`/api/governance/${decisionId}`)
      .then(r => r.json())
      .then(d => setGov(d.governance))
      .catch(console.error)
  }, [decisionId])

  const update = useCallback(async (patch: Partial<GovernanceRecord>) => {
    if (!decisionId) return
    const res = await fetch('/api/governance/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decisionId, ...patch }),
    })
    const d = await res.json()
    setGov(d.governance)
  }, [decisionId])

  return { gov, update }
}

export async function addDecisionEvent(payload: Omit<DecisionEvent, 'id' | 'timestamp'> & { owner?: string; reviewers?: string[] }) {
  const res = await fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to add decision')
  return res.json()
}

export async function refineNarrative(event: DecisionEvent): Promise<Narrative> {
  const res = await fetch('/api/narrative/refine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  })
  if (!res.ok) throw new Error('Refinement failed')
  const d = await res.json()
  return d.narrative
}
