import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import type { NodeProps } from 'reactflow'

const COST_COLORS: Record<string, string> = {
  cognitive:   '#7f77dd',
  operational: '#1d9e75',
  performance: '#ef9f27',
  financial:   '#d85a30',
  change:      '#e24b4a',
}

interface NodeData {
  label: string
  description: string
  costs?: Record<string, number>
  decisionCount?: number
  selected?: boolean
}

function ArchNode({ data, selected }: NodeProps<NodeData>) {
  const costs = data.costs ?? {}
  const topCosts = Object.entries(costs)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  return (
    <div style={{
      background: selected ? '#1e1f24' : '#1a1b1e',
      border: `1px solid ${selected ? '#7f77dd' : '#2e2f36'}`,
      borderRadius: 8,
      padding: '10px 14px',
      minWidth: 120,
      cursor: 'pointer',
      transition: 'all 0.15s',
      boxShadow: selected ? '0 0 0 1px rgba(127,119,221,0.25)' : 'none',
    }}>
      <Handle type="target" position={Position.Top} style={{ background: '#3a3b42', border: 'none', width: 6, height: 6 }} />

      <div style={{ fontSize: 12, fontWeight: 500, color: '#e2e0d8', marginBottom: 2 }}>
        {data.label}
      </div>
      {data.description && (
        <div style={{ fontSize: 10, color: '#666460', marginBottom: 6 }}>
          {data.description}
        </div>
      )}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {topCosts.map(([key, val]) => (
          <div
            key={key}
            title={`${key}: ${val}/100`}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: COST_COLORS[key] ?? '#666',
              opacity: 0.7 + (val / 333),
            }}
          />
        ))}
        {data.decisionCount != null && data.decisionCount > 0 && (
          <span style={{ fontSize: 9, color: '#555450', marginLeft: 2 }}>
            {data.decisionCount} decision{data.decisionCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} style={{ background: '#3a3b42', border: 'none', width: 6, height: 6 }} />
    </div>
  )
}

export default memo(ArchNode)
