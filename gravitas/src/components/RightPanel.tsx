import { useState } from 'react'
import { useComponentHistory } from '../hooks/useGravitas'
import DecisionTab from './DecisionTab'
import WhyTab from './WhyTab'
import ForkTab from './ForkTab'
import GovernanceTab from './GovernanceTab'
import type { DecisionEvent } from '@lib/types'

const TABS = [
  { id: 'decision', label: 'Decision' },
  { id: 'why',      label: 'Why' },
  { id: 'fork',     label: 'Fork reality' },
  { id: 'gov',      label: 'Governance' },
] as const

type TabId = typeof TABS[number]['id']

interface Props {
  selectedNode: { id: string; label: string } | null
  onAddDecision: () => void
}

export default function RightPanel({ selectedNode, onAddDecision }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('decision')
  const [selectedEvent, setSelectedEvent] = useState<DecisionEvent | null>(null)
  const { events, loading } = useComponentHistory(selectedNode?.id ?? null)

  const currentEvent = selectedEvent ?? events[0] ?? null

  if (!selectedNode) {
    return (
      <div style={panelStyle}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '100%', gap: 12, padding: 24,
        }}>
          <div style={{ fontSize: 28, opacity: 0.15 }}>◎</div>
          <div style={{ fontSize: 12, color: '#555450', textAlign: 'center', lineHeight: 1.7 }}>
            Select a component<br />to inspect its decisions
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={panelStyle}>
      {/* Header */}
      <div style={{
        padding: '14px 16px', borderBottom: '1px solid #23242a', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#e2e0d8' }}>{selectedNode.label}</div>
            <div style={{ fontSize: 10, color: '#555450', marginTop: 2 }}>
              {loading ? 'Loading...' : `${events.length} decision${events.length !== 1 ? 's' : ''} recorded`}
            </div>
          </div>
          <button onClick={onAddDecision} style={{
            fontSize: 10, padding: '4px 8px',
            background: 'transparent', border: '1px solid #2e2f36',
            color: '#666460', borderRadius: 4, cursor: 'pointer',
            transition: 'all 0.15s', flexShrink: 0,
          }}>
            + Add
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', borderBottom: '1px solid #23242a', flexShrink: 0,
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              flex: 1,
              padding: '8px 4px',
              fontSize: 11,
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${activeTab === t.id ? '#7f77dd' : 'transparent'}`,
              color: activeTab === t.id ? '#a09ae8' : '#555450',
              cursor: 'pointer',
              transition: 'all 0.15s',
              letterSpacing: '0.02em',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'decision' && (
          <DecisionTab
            events={events}
            selected={selectedEvent}
            onSelect={setSelectedEvent}
          />
        )}
        {activeTab === 'why' && <WhyTab event={currentEvent} />}
        {activeTab === 'fork' && (
          <ForkTab
            event={currentEvent}
            componentId={selectedNode.id}
            onForkCreated={() => {}}
          />
        )}
        {activeTab === 'gov' && <GovernanceTab event={currentEvent} />}
      </div>
    </div>
  )
}

const panelStyle: React.CSSProperties = {
  width: 300,
  borderLeft: '1px solid #23242a',
  background: '#131416',
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  overflow: 'hidden',
}
