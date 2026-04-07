import { useState } from 'react'
import { generateNarrative } from '@lib/narrative'
import { refineNarrative } from '../hooks/useGravitas'
import type { DecisionEvent, Narrative } from '@lib/types'

interface Props {
  event: DecisionEvent | null
}

export default function WhyTab({ event }: Props) {
  const [narrative, setNarrative] = useState<Narrative | null>(null)
  const [refining, setRefining] = useState(false)
  const [hoveredSource, setHoveredSource] = useState<string[] | null>(null)

  if (!event) {
    return <div style={empty}>Select a decision to view its rationale.</div>
  }

  const base = narrative ?? generateNarrative(event)

  const handleRefine = async () => {
    setRefining(true)
    try {
      const refined = await refineNarrative(event)
      setNarrative(refined)
    } catch (err: any) {
      alert(`Refinement failed: ${err.message}`)
    } finally {
      setRefining(false)
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={sectionLabel}>DECISION NARRATIVE</div>

      <div style={{
        background: '#1a1b1e',
        borderLeft: '2px solid #7f77dd',
        padding: '10px 12px',
        borderRadius: '0 4px 4px 0',
        marginBottom: 10,
      }}>
        {base.refined ? (
          <p style={{ fontSize: 11, color: '#a8a59e', lineHeight: 1.7 }}>{base.refined}</p>
        ) : (
          base.sentences.map((s, i) => (
            <p
              key={i}
              onMouseEnter={() => setHoveredSource(s.sources)}
              onMouseLeave={() => setHoveredSource(null)}
              style={{
                fontSize: 11,
                color: '#a8a59e',
                lineHeight: 1.7,
                marginBottom: i < base.sentences.length - 1 ? 6 : 0,
                cursor: 'default',
                transition: 'color 0.1s',
              }}
            >
              {s.text}
            </p>
          ))
        )}
      </div>

      {hoveredSource && (
        <div style={{
          background: '#222428', border: '1px solid #2e2f36', borderRadius: 4,
          padding: '6px 10px', marginBottom: 8, fontSize: 10, color: '#555450',
        }}>
          <span style={{ color: '#3a3b42', marginRight: 6 }}>sources:</span>
          {hoveredSource.join(' · ')}
        </div>
      )}

      <button
        onClick={handleRefine}
        disabled={refining}
        style={{
          fontSize: 11, padding: '5px 10px',
          background: 'transparent',
          border: '1px solid #2e2f36',
          color: refining ? '#555450' : '#a8a59e',
          borderRadius: 4, cursor: refining ? 'not-allowed' : 'pointer',
          marginBottom: 16, transition: 'all 0.15s',
        }}
      >
        {refining ? 'Refining with AI...' : narrative?.refined ? '↺ Re-refine narrative' : '✦ Refine narrative with AI'}
      </button>

      <div style={sectionLabel}>RATIONALE</div>
      <div style={{ fontSize: 11, color: '#a8a59e', lineHeight: 1.6, marginBottom: 16 }}>
        {event.rationale}
      </div>

      <div style={sectionLabel}>ASSUMPTIONS AT TIME OF DECISION</div>
      <ul style={{ listStyle: 'none', marginBottom: 16 }}>
        {event.assumptions.map((a, i) => (
          <li key={i} style={{
            fontSize: 11, color: '#a8a59e',
            padding: '5px 0',
            borderBottom: '1px solid #23242a',
            display: 'flex', gap: 8, alignItems: 'flex-start',
          }}>
            <span style={{ color: '#3a3b42', flexShrink: 0, marginTop: 1 }}>—</span>
            {a}
          </li>
        ))}
      </ul>

      {event.alternatives?.length > 0 && (
        <>
          <div style={sectionLabel}>ALTERNATIVES REJECTED</div>
          {event.alternatives.map((alt, i) => (
            <div key={i} style={{
              background: '#1a1b1e', border: '1px solid #23242a',
              borderRadius: 6, padding: '8px 10px', marginBottom: 6,
            }}>
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
const empty: React.CSSProperties = {
  padding: '32px 16px', textAlign: 'center', color: '#555450', fontSize: 12,
}
