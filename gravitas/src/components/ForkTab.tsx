import { useState } from 'react'
import { addDecisionEvent } from '../hooks/useGravitas'
import type { DecisionEvent } from '@lib/types'
import CostBars from './CostBars'

const COST_KEYS = ['cognitive', 'operational', 'performance', 'financial', 'change'] as const
const COST_COLORS: Record<string, string> = {
  cognitive: '#7f77dd', operational: '#1d9e75',
  performance: '#ef9f27', financial: '#d85a30', change: '#e24b4a',
}

interface Props {
  event: DecisionEvent | null
  componentId: string
  onForkCreated: () => void
}

export default function ForkTab({ event, componentId, onForkCreated }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    choice: '',
    rationale: '',
    costs: { cognitive: 50, operational: 50, performance: 50, financial: 50, change: 50 },
  })

  if (!event) return <div style={empty}>Select a decision to fork from.</div>

  const delta = COST_KEYS.reduce((acc, k) => {
    acc[k] = form.costs[k] - event.costs[k]
    return acc
  }, {} as Record<string, number>)

  const handleFork = async () => {
    if (!form.choice || !form.rationale) return alert('Choice and rationale are required.')
    setSaving(true)
    try {
      await addDecisionEvent({
        component: componentId,
        choice: form.choice,
        description: `Forked from: ${event.choice}`,
        rationale: form.rationale,
        assumptions: [],
        costs: form.costs,
        alternatives: [{ name: event.choice, reason: 'Original path — this is a forked simulation' }],
        forkId: `fork-${Date.now()}`,
        forkParentId: event.id,
      })
      setShowForm(false)
      onForkCreated()
    } catch {
      alert('Failed to save fork.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={sectionLabel}>FORKING FROM</div>
      <div style={card}>
        <div style={{ fontSize: 11, fontWeight: 500, color: '#e2e0d8' }}>{event.choice}</div>
        <div style={{ fontSize: 10, color: '#555450', marginTop: 2 }}>
          {new Date(event.timestamp).toLocaleDateString()}
        </div>
      </div>

      <div style={{ fontSize: 11, color: '#666460', lineHeight: 1.6, margin: '12px 0' }}>
        Branch reality from this decision. Define an alternative path and compare how costs diverge. This is counterfactual — it does not affect the production state.
      </div>

      {!showForm ? (
        <button onClick={() => setShowForm(true)} style={actionBtn}>
          + Create fork
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={sectionLabel}>ALTERNATIVE CHOICE</div>
          <input
            placeholder="What would have been chosen instead?"
            value={form.choice}
            onChange={e => setForm(f => ({ ...f, choice: e.target.value }))}
          />
          <input
            placeholder="Rationale for this alternative..."
            value={form.rationale}
            onChange={e => setForm(f => ({ ...f, rationale: e.target.value }))}
          />

          <div style={{ ...sectionLabel, marginTop: 4 }}>ESTIMATED COSTS (drag sliders)</div>
          {COST_KEYS.map(k => (
            <div key={k} style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 11, color: '#a8a59e', textTransform: 'capitalize' }}>{k}</span>
                <span style={{ fontSize: 11, color: '#555450' }}>{form.costs[k]}</span>
              </div>
              <input
                type="range" min={0} max={100} step={5}
                value={form.costs[k]}
                onChange={e => setForm(f => ({ ...f, costs: { ...f.costs, [k]: +e.target.value } }))}
                style={{ width: '100%', accentColor: COST_COLORS[k] }}
              />
            </div>
          ))}

          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            <button onClick={handleFork} disabled={saving} style={actionBtn}>
              {saving ? 'Saving...' : 'Save fork'}
            </button>
            <button onClick={() => setShowForm(false)} style={cancelBtn}>Cancel</button>
          </div>
        </div>
      )}

      {!showForm && (
        <>
          <div style={{ ...sectionLabel, marginTop: 20 }}>COST COMPARISON</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={compareCol}>
              <div style={{ fontSize: 10, color: '#555450', marginBottom: 6, letterSpacing: '0.04em' }}>CURRENT</div>
              <div style={{ fontSize: 11, fontWeight: 500, color: '#e2e0d8', marginBottom: 8 }}>{event.choice}</div>
              <CostBars costs={event.costs} animate={false} />
            </div>
            <div style={compareCol}>
              <div style={{ fontSize: 10, color: '#1d9e75', marginBottom: 6, letterSpacing: '0.04em' }}>FORK (preview)</div>
              <div style={{ fontSize: 11, fontWeight: 500, color: '#e2e0d8', marginBottom: 8 }}>
                {form.choice || 'Define alternative above'}
              </div>
              <CostBars costs={form.costs} animate={false} />
            </div>
          </div>

          <div style={{ ...sectionLabel, marginTop: 16 }}>DELTA</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {COST_KEYS.map(k => {
              const d = delta[k]
              return (
                <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: '#a8a59e', textTransform: 'capitalize' }}>{k}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 500,
                    color: d > 0 ? '#e24b4a' : d < 0 ? '#1d9e75' : '#555450',
                  }}>
                    {d > 0 ? '+' : ''}{d}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

const sectionLabel: React.CSSProperties = {
  fontSize: 10, letterSpacing: '0.08em', color: '#555450', marginBottom: 8,
}
const card: React.CSSProperties = {
  background: '#1a1b1e', border: '1px solid #23242a', borderRadius: 6, padding: '8px 10px', marginBottom: 0,
}
const compareCol: React.CSSProperties = {
  background: '#1a1b1e', border: '1px solid #23242a', borderRadius: 5, padding: 10,
}
const actionBtn: React.CSSProperties = {
  fontSize: 11, padding: '6px 12px',
  background: 'rgba(127,119,221,0.08)',
  border: '1px solid rgba(127,119,221,0.25)',
  color: '#a09ae8', borderRadius: 4, cursor: 'pointer',
}
const cancelBtn: React.CSSProperties = {
  fontSize: 11, padding: '6px 12px',
  background: 'transparent', border: '1px solid #2e2f36',
  color: '#666460', borderRadius: 4, cursor: 'pointer',
}
const empty: React.CSSProperties = {
  padding: '32px 16px', textAlign: 'center', color: '#555450', fontSize: 12,
}
