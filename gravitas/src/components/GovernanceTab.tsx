import { useState } from 'react'
import { useGovernance } from '../hooks/useGravitas'
import type { DecisionEvent } from '@lib/types'

const STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  proposed:   { bg: 'rgba(239,159,39,.12)',  color: '#f4b945', border: 'rgba(239,159,39,.2)' },
  approved:   { bg: 'rgba(29,158,117,.12)',  color: '#3dcca0', border: 'rgba(29,158,117,.2)' },
  rejected:   { bg: 'rgba(226,75,74,.12)',   color: '#f07070', border: 'rgba(226,75,74,.2)' },
  superseded: { bg: 'rgba(85,84,80,.15)',    color: '#666460', border: '#2e2f36' },
}

interface Props {
  event: DecisionEvent | null
}

export default function GovernanceTab({ event }: Props) {
  const { gov, update } = useGovernance(event?.id ?? null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ owner: '', notes: '', status: '' })
  const [saving, setSaving] = useState(false)

  if (!event) return <div style={empty}>Select a decision to view governance.</div>
  if (!gov) return <div style={empty}>Loading governance record...</div>

  const sc = STATUS_COLORS[gov.status] ?? STATUS_COLORS.proposed

  const startEdit = () => {
    setForm({ owner: gov.owner, notes: gov.notes, status: gov.status })
    setEditing(true)
  }

  const saveEdit = async () => {
    setSaving(true)
    await update({ owner: form.owner, notes: form.notes, status: form.status as any })
    setSaving(false)
    setEditing(false)
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={sectionLabel}>GOVERNANCE RECORD</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {[
          { label: 'Decision ID', val: <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#555450' }}>{event.id.slice(0, 16)}…</span> },
          { label: 'Owner', val: gov.owner },
          {
            label: 'Status', val: (
              <span style={{
                fontSize: 10, padding: '2px 7px', borderRadius: 3,
                background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
              }}>
                {gov.status}
              </span>
            )
          },
          { label: 'Reviewers', val: gov.reviewers.length ? gov.reviewers.join(', ') : '—' },
          { label: 'Created', val: new Date(gov.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
          { label: 'Updated', val: new Date(gov.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
        ].map(({ label, val }) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', padding: '7px 0',
            borderBottom: '1px solid #23242a',
          }}>
            <span style={{ fontSize: 11, color: '#666460' }}>{label}</span>
            <span style={{ fontSize: 11, color: '#e2e0d8' }}>{val}</span>
          </div>
        ))}

        {gov.notes && (
          <div style={{ padding: '8px 0', borderBottom: '1px solid #23242a' }}>
            <div style={{ fontSize: 10, color: '#555450', marginBottom: 4 }}>Notes</div>
            <div style={{ fontSize: 11, color: '#a8a59e', lineHeight: 1.55 }}>{gov.notes}</div>
          </div>
        )}
      </div>

      {!editing ? (
        <button onClick={startEdit} style={{ ...actionBtn, marginTop: 12 }}>
          Edit governance record
        </button>
      ) : (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={sectionLabel}>EDIT RECORD</div>
          <div>
            <div style={{ fontSize: 10, color: '#555450', marginBottom: 4 }}>Owner</div>
            <input value={form.owner} onChange={e => setForm(f => ({ ...f, owner: e.target.value }))} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#555450', marginBottom: 4 }}>Status</div>
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              style={{ width: '100%', background: '#1a1b1e', border: '1px solid #2e2f36', color: '#e2e0d8', borderRadius: 4, padding: '6px 8px', fontSize: 12 }}
            >
              {['proposed', 'approved', 'rejected', 'superseded'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#555450', marginBottom: 4 }}>Notes</div>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={saveEdit} disabled={saving} style={actionBtn}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            <button onClick={() => setEditing(false)} style={cancelBtn}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ ...sectionLabel, marginTop: 20 }}>DECISION TIMELINE</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#7f77dd', marginTop: 3, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#e2e0d8' }}>{event.choice}</div>
            <div style={{ fontSize: 10, color: '#555450', marginTop: 2 }}>
              {new Date(event.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {gov.status}
            </div>
          </div>
        </div>
        {event.forkParentId && (
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1d9e75', marginTop: 3, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 500, color: '#e2e0d8' }}>Forked from parent decision</div>
              <div style={{ fontSize: 10, color: '#555450', marginTop: 2, fontFamily: 'monospace' }}>
                {event.forkParentId.slice(0, 20)}…
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const sectionLabel: React.CSSProperties = {
  fontSize: 10, letterSpacing: '0.08em', color: '#555450', marginBottom: 8,
}
const actionBtn: React.CSSProperties = {
  fontSize: 11, padding: '6px 12px',
  background: 'transparent', border: '1px solid #2e2f36',
  color: '#a8a59e', borderRadius: 4, cursor: 'pointer',
}
const cancelBtn: React.CSSProperties = {
  fontSize: 11, padding: '6px 12px',
  background: 'transparent', border: '1px solid #2e2f36',
  color: '#666460', borderRadius: 4, cursor: 'pointer',
}
const empty: React.CSSProperties = {
  padding: '32px 16px', textAlign: 'center', color: '#555450', fontSize: 12,
}
