import CostBars from './CostBars'
import type { DecisionEvent } from '@lib/types'

interface Props {
  events: DecisionEvent[]
  selected: DecisionEvent | null
  onSelect: (e: DecisionEvent) => void
}

export default function DecisionTab({ events, selected, onSelect }: Props) {
  const current = selected ?? events[0] ?? null

  if (!current) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center', color: '#555450', fontSize: 12 }}>
        No decisions recorded for this component yet.
      </div>
    )
  }

  return (
    <div style={{ padding: 16 }}>
      {events.length > 1 && (
        <>
          <div style={sectionLabel}>DECISION HISTORY</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
            {events.map(e => (
              <button
                key={e.id}
                onClick={() => onSelect(e)}
                style={{
                  background: current.id === e.id ? '#222428' : 'transparent',
                  border: `1px solid ${current.id === e.id ? '#3a3b42' : 'transparent'}`,
                  borderRadius: 5,
                  padding: '6px 10px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.12s',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 500, color: '#e2e0d8' }}>{e.choice}</div>
                <div style={{ fontSize: 10, color: '#555450', marginTop: 1 }}>
                  {new Date(e.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {e.forkId && <span style={{ color: '#1d9e75', marginLeft: 6 }}>fork</span>}
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      <div style={sectionLabel}>CURRENT CHOICE</div>
      <div style={card}>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#e2e0d8', marginBottom: 4 }}>
          {current.choice}
        </div>
        <div style={{ fontSize: 10, color: '#555450', marginBottom: 6 }}>
          {new Date(current.timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          {current.forkId && (
            <span style={{
              marginLeft: 8, fontSize: 10, padding: '1px 6px',
              background: 'rgba(29,158,117,.12)', color: '#3dcca0',
              border: '1px solid rgba(29,158,117,.2)', borderRadius: 3,
            }}>forked reality</span>
          )}
        </div>
        {current.description && (
          <div style={{ fontSize: 11, color: '#a8a59e', lineHeight: 1.5 }}>{current.description}</div>
        )}
      </div>

      <div style={{ ...sectionLabel, marginTop: 16 }}>COST DIMENSIONS</div>
      <CostBars costs={current.costs} />

      {current.alternatives?.length > 0 && (
        <>
          <div style={{ ...sectionLabel, marginTop: 16 }}>REJECTED ALTERNATIVES</div>
          {current.alternatives.map((alt, i) => (
            <div key={i} style={{ ...card, marginBottom: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: '#a8a59e' }}>{alt.name}</div>
              <div style={{ fontSize: 10, color: '#555450', marginTop: 3, lineHeight: 1.5 }}>{alt.reason}</div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

const sectionLabel: React.CSSProperties = {
  fontSize: 10, letterSpacing: '0.08em', color: '#555450', marginBottom: 8,
}

const card: React.CSSProperties = {
  background: '#1a1b1e', border: '1px solid #23242a', borderRadius: 6, padding: 10, marginBottom: 0,
}
