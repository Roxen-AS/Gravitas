import { useEffect, useRef, useState } from 'react'

const COST_META = [
  { key: 'cognitive',   label: 'Cognitive',   color: '#7f77dd' },
  { key: 'operational', label: 'Operational',  color: '#1d9e75' },
  { key: 'performance', label: 'Performance',  color: '#ef9f27' },
  { key: 'financial',   label: 'Financial',    color: '#d85a30' },
  { key: 'change',      label: 'Change cost',  color: '#e24b4a' },
]

interface Props {
  costs: Record<string, number>
  animate?: boolean
}

export default function CostBars({ costs, animate = true }: Props) {
  const [visible, setVisible] = useState(!animate)
  const mounted = useRef(false)

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      if (animate) {
        const t = setTimeout(() => setVisible(true), 60)
        return () => clearTimeout(t)
      }
    }
    // re-animate on costs change
    if (animate) {
      setVisible(false)
      const t = setTimeout(() => setVisible(true), 60)
      return () => clearTimeout(t)
    }
  }, [costs, animate])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {COST_META.map(({ key, label, color }) => {
        const val = costs[key] ?? 0
        return (
          <div key={key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: '#a8a59e' }}>{label}</span>
              <span style={{ fontSize: 11, color: '#666460' }}>{val}/100</span>
            </div>
            <div style={{ height: 4, background: '#222428', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: visible ? `${val}%` : '0%',
                background: color,
                borderRadius: 2,
                transition: 'width 0.55s cubic-bezier(0.4,0,0.2,1)',
              }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
