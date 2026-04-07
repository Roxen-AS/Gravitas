import { useState, useEffect } from 'react'
import Graph from './components/Graph'
import RightPanel from './components/RightPanel'
import AddDecisionModal from './components/AddDecisionModal'
import { useGravitas, useComponentHistory } from './hooks/useGravitas'
import type { DecisionEvent } from '@lib/types'

type View = 'graph' | 'log' | 'costs' | 'governance'

export default function App() {
  const [view] = useState<View>('graph')
  const [selectedNode, setSelectedNode] = useState<{ id: string; label: string } | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const { components, edgeData, loading, fetchGraph } = useGravitas()

  // Get events for cost display
  const [allEvents, setAllEvents] = useState<Record<string, DecisionEvent[]>>({})
  useEffect(() => {
    if (components.length === 0) return
    Promise.all(
      components.map(c =>
        fetch(`/api/history?component=${encodeURIComponent(c.id)}`)
          .then(r => r.json())
          .then(d => ({ id: c.id, events: d.events ?? [] }))
          .catch(() => ({ id: c.id, events: [] }))
      )
    ).then(results => {
      const map: Record<string, DecisionEvent[]> = {}
      results.forEach(r => { map[r.id] = r.events })
      setAllEvents(map)
    })
  }, [components])

  const handleNodeClick = (id: string, label: string) => {
    setSelectedNode({ id, label })
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Left sidebar */}
      <div style={{
        width: 200, background: '#131416', borderRight: '1px solid #23242a',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid #23242a' }}>
          <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: '0.02em', color: '#e2e0d8' }}>
            Gravitas
          </div>
          <div style={{ fontSize: 10, color: '#3a3b42', marginTop: 2, letterSpacing: '0.06em' }}>
            COST OF COMPLEXITY
          </div>
        </div>

        {/* Nav */}
        <div style={{ padding: '10px 0' }}>
          <NavLabel>SYSTEM</NavLabel>
          {[
            { icon: '◈', label: 'Architecture graph', active: true },
            { icon: '◎', label: 'Decision log',       active: false },
            { icon: '▦', label: 'Cost overview',      active: false },
            { icon: '◐', label: 'Governance',         active: false },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', cursor: 'pointer',
              color: item.active ? '#e2e0d8' : '#555450',
              background: item.active ? '#1e1f24' : 'transparent',
              borderRight: item.active ? '2px solid #7f77dd' : '2px solid transparent',
              fontSize: 11, transition: 'all 0.12s',
            }}>
              <span style={{ fontSize: 10, opacity: 0.7 }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>

        <div style={{ padding: '10px 0', borderTop: '1px solid #23242a' }}>
          <NavLabel>COMPONENTS</NavLabel>
          {(components.length > 0 ? components : DEMO_COMPONENTS).map(c => (
            <div
              key={c.id}
              onClick={() => handleNodeClick(c.id, c.label)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 14px', cursor: 'pointer',
                color: selectedNode?.id === c.id ? '#e2e0d8' : '#666460',
                background: selectedNode?.id === c.id ? '#1e1f24' : 'transparent',
                fontSize: 11, transition: 'all 0.12s',
              }}
            >
              <div style={{
                width: 5, height: 5, borderRadius: '50%',
                background: selectedNode?.id === c.id ? '#7f77dd' : '#2e2f36',
                flexShrink: 0,
              }} />
              {c.label}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 'auto', padding: '10px 14px', borderTop: '1px solid #23242a' }}>
          <div style={{ fontSize: 10, color: '#3a3b42' }}>
            {components.length > 0
              ? `${components.length} components`
              : 'demo mode'
            }
          </div>
        </div>
      </div>

      {/* Main canvas area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{
          height: 42, background: '#131416', borderBottom: '1px solid #23242a',
          display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10, flexShrink: 0,
        }}>
          <span style={{ fontSize: 12, color: '#555450' }}>
            Architecture —{' '}
            <span style={{ color: '#a8a59e' }}>Production</span>
          </span>
          <span style={{
            fontSize: 10, padding: '2px 7px', borderRadius: 3,
            background: 'rgba(127,119,221,.1)', color: '#a09ae8',
            border: '1px solid rgba(127,119,221,.2)',
          }}>
            Event-sourced
          </span>
          {selectedNode && (
            <span style={{
              fontSize: 10, padding: '2px 7px', borderRadius: 3,
              background: 'rgba(29,158,117,.1)', color: '#3dcca0',
              border: '1px solid rgba(29,158,117,.2)',
            }}>
              {selectedNode.label}
            </span>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            {loading && (
              <span style={{ fontSize: 10, color: '#3a3b42' }}>Loading...</span>
            )}
            <button
              onClick={() => selectedNode ? setShowAddModal(true) : undefined}
              style={{
                fontSize: 11, padding: '5px 10px',
                background: 'transparent',
                border: '1px solid #2e2f36',
                color: selectedNode ? '#a8a59e' : '#3a3b42',
                borderRadius: 4, cursor: selectedNode ? 'pointer' : 'default',
                transition: 'all 0.15s',
              }}
            >
              + Add decision
            </button>
          </div>
        </div>

        {/* Graph */}
        <div style={{ flex: 1, position: 'relative' }}>
          <Graph
            components={components}
            edgeData={edgeData}
            eventsByComponent={allEvents}
            selectedId={selectedNode?.id ?? null}
            onNodeClick={handleNodeClick}
          />
        </div>
      </div>

      {/* Right panel */}
      <RightPanel
        selectedNode={selectedNode}
        onAddDecision={() => setShowAddModal(true)}
      />

      {/* Modal */}
      {showAddModal && selectedNode && (
        <AddDecisionModal
          componentId={selectedNode.id}
          componentLabel={selectedNode.label}
          onClose={() => setShowAddModal(false)}
          onSaved={() => {
            fetchGraph()
            setShowAddModal(false)
          }}
        />
      )}
    </div>
  )
}

function NavLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10, letterSpacing: '0.08em', color: '#3a3b42',
      padding: '4px 14px 6px', marginBottom: 2,
    }}>
      {children}
    </div>
  )
}

const DEMO_COMPONENTS = [
  { id: 'api-gateway',  label: 'API Gateway'  },
  { id: 'auth-service', label: 'Auth Service' },
  { id: 'database',     label: 'Database'     },
  { id: 'job-queue',    label: 'Job Queue'    },
  { id: 'cache',        label: 'Cache Layer'  },
]
