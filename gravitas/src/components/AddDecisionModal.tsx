import { useState } from 'react'
import { addDecisionEvent } from '../hooks/useGravitas'

const COST_KEYS = ['cognitive', 'operational', 'performance', 'financial', 'change'] as const
const COST_COLORS: Record<string, string> = {
  cognitive: '#7f77dd', operational: '#1d9e75',
  performance: '#ef9f27', financial: '#d85a30', change: '#e24b4a',
}

interface Props {
  componentId: string
  componentLabel: string
  onClose: () => void
  onSaved: () => void
}

const DEFAULT_COSTS = { cognitive: 50, operational: 50, performance: 50, financial: 50, change: 50 }

export default function AddDecisionModal({ componentId, componentLabel, onClose, onSaved }: Props) {
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    choice: '',
    description: '',
    rationale: '',
    assumptions: '',
    alternatives: '',
    owner: '',
    costs: { ...DEFAULT_COSTS },
  })

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.choice || !form.rationale) return alert('Choice and rationale are required.')
    setSaving(true)
    try {
      await addDecisionEvent({
        component: componentId,
        choice: form.choice,
        description: form.description,
        rationale: form.rationale,
        assumptions: form.assumptions.split('\n').map(s => s.trim()).filter(Boolean),
        alternatives: form.alternatives
          .split('\n')
          .map(s => s.trim())
          .filter(Boolean)
          .map(s => ({ name: s, reason: 'Rejected — see rationale' })),
        costs: form.costs,
        owner: form.owner || 'unassigned',
      })
      onSaved()
      onClose()
    } catch {
      alert('Failed to save decision.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.65)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#131416', border: '1px solid #23242a',
        borderRadius: 8, width: 460, maxHeight: '80vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #23242a',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#e2e0d8' }}>Record decision</div>
            <div style={{ fontSize: 11, color: '#555450', marginTop: 2 }}>{componentLabel}</div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1, 2].map(s => (
              <div key={s} style={{
                width: 20, height: 3, borderRadius: 2,
                background: step >= s ? '#7f77dd' : '#2e2f36',
                transition: 'background 0.2s',
              }} />
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Decision / choice made *">
                <input
                  placeholder="e.g. REST over GraphQL"
                  value={form.choice}
                  onChange={e => set('choice', e.target.value)}
                  autoFocus
                />
              </Field>
              <Field label="Short description">
                <input
                  placeholder="One-line description"
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                />
              </Field>
              <Field label="Rationale *">
                <textarea
                  placeholder="Why was this choice made? What context drove it?"
                  value={form.rationale}
                  onChange={e => set('rationale', e.target.value)}
                  rows={4} style={{ resize: 'vertical' }}
                />
              </Field>
              <Field label="Assumptions (one per line)">
                <textarea
                  placeholder={"Traffic < 50K req/day\nTeam has REST expertise"}
                  value={form.assumptions}
                  onChange={e => set('assumptions', e.target.value)}
                  rows={3} style={{ resize: 'vertical' }}
                />
              </Field>
              <Field label="Alternatives rejected (one per line)">
                <textarea
                  placeholder={"GraphQL\nfederated services"}
                  value={form.alternatives}
                  onChange={e => set('alternatives', e.target.value)}
                  rows={2} style={{ resize: 'vertical' }}
                />
              </Field>
              <Field label="Owner / decision maker">
                <input
                  placeholder="Name or role"
                  value={form.owner}
                  onChange={e => set('owner', e.target.value)}
                />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{ fontSize: 11, color: '#666460', lineHeight: 1.6, marginBottom: 16 }}>
                Estimate cost dimensions for this decision. These are relative values (0–100) representing the burden each dimension imposes.
              </div>
              {COST_KEYS.map(k => (
                <div key={k} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: '#a8a59e', textTransform: 'capitalize' }}>{k}</span>
                    <span style={{ fontSize: 11, color: COST_COLORS[k], fontWeight: 500 }}>{form.costs[k]}</span>
                  </div>
                  <input
                    type="range" min={0} max={100} step={5}
                    value={form.costs[k]}
                    onChange={e => setForm(f => ({ ...f, costs: { ...f.costs, [k]: +e.target.value } }))}
                    style={{ width: '100%', accentColor: COST_COLORS[k] }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                    <span style={{ fontSize: 9, color: '#3a3b42' }}>low</span>
                    <span style={{ fontSize: 9, color: '#3a3b42' }}>high</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px', borderTop: '1px solid #23242a',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <button onClick={onClose} style={ghostBtn}>Cancel</button>
          <div style={{ display: 'flex', gap: 8 }}>
            {step === 2 && (
              <button onClick={() => setStep(1)} style={ghostBtn}>← Back</button>
            )}
            {step === 1 ? (
              <button onClick={() => setStep(2)} style={primaryBtn}>Next →</button>
            ) : (
              <button onClick={handleSave} disabled={saving} style={primaryBtn}>
                {saving ? 'Saving...' : 'Record decision'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: '#555450', marginBottom: 5, letterSpacing: '0.05em' }}>{label}</div>
      {children}
    </div>
  )
}

const primaryBtn: React.CSSProperties = {
  fontSize: 11, padding: '6px 14px',
  background: 'rgba(127,119,221,0.12)',
  border: '1px solid rgba(127,119,221,0.3)',
  color: '#a09ae8', borderRadius: 4, cursor: 'pointer',
}
const ghostBtn: React.CSSProperties = {
  fontSize: 11, padding: '6px 12px',
  background: 'transparent', border: '1px solid #2e2f36',
  color: '#666460', borderRadius: 4, cursor: 'pointer',
}
