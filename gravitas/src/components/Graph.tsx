import { useCallback, useEffect, useMemo, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  type Connection,
  type Node,
  type Edge,
} from 'reactflow'
import ArchNode from './ArchNode'
import type { DecisionEvent } from '@lib/types'

const nodeTypes = { archNode: ArchNode }

interface Props {
  components: any[]
  edgeData: any[]
  eventsByComponent: Record<string, DecisionEvent[]>
  selectedId: string | null
  onNodeClick: (id: string, label: string) => void
}

export default function Graph({ components, edgeData, eventsByComponent, selectedId, onNodeClick }: Props) {
  const initialNodes: Node[] = useMemo(() => components.map(c => {
    const events = eventsByComponent[c.id] ?? []
    const latestEvent = events[0]
    const costs = latestEvent?.costs
    return {
      id: c.id,
      type: 'archNode',
      position: { x: c.posX, y: c.posY },
      data: {
        label: c.label,
        description: c.description,
        costs,
        decisionCount: events.length,
        selected: c.id === selectedId,
      },
      selected: c.id === selectedId,
    }
  }), [components, eventsByComponent, selectedId])

  const initialEdges: Edge[] = useMemo(() => edgeData.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    style: { stroke: '#2e2f36', strokeWidth: 1.5, strokeDasharray: '4 4' },
    labelStyle: { fontSize: 10, fill: '#555450' },
  })), [edgeData])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  useEffect(() => { setNodes(initialNodes) }, [initialNodes])
  useEffect(() => { setEdges(initialEdges) }, [initialEdges])

  const onConnect = useCallback(
    (params: Connection) => setEdges(eds => addEdge({ ...params, style: { stroke: '#2e2f36', strokeWidth: 1.5, strokeDasharray: '4 4' } }, eds)),
    [setEdges]
  )

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    onNodeClick(node.id, node.data.label)
  }, [onNodeClick])

  // Fallback: show demo nodes if no components from DB yet
  const displayNodes = nodes.length > 0 ? nodes : DEMO_NODES
  const displayEdges = edges.length > 0 ? edges : DEMO_EDGES

  return (
    <ReactFlow
      nodes={displayNodes}
      edges={displayEdges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={handleNodeClick}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.3 }}
      minZoom={0.3}
      maxZoom={2}
      defaultEdgeOptions={{ style: { stroke: '#2e2f36', strokeWidth: 1.5 } }}
    >
      <Background variant={BackgroundVariant.Dots} gap={32} size={1} color="#1e1f24" />
      <Controls />
      <MiniMap
        nodeColor={() => '#2e2f36'}
        maskColor="rgba(12,13,15,0.7)"
      />
    </ReactFlow>
  )
}

// Demo nodes shown when DB has no components yet
const DEMO_NODES: Node[] = [
  { id: 'api-gateway',   type: 'archNode', position: { x: 300, y: 80  }, data: { label: 'API Gateway',   description: 'REST entry point',    costs: { cognitive: 30, operational: 25, performance: 40, financial: 35, change: 55 }, decisionCount: 1 } },
  { id: 'auth-service',  type: 'archNode', position: { x: 80,  y: 240 }, data: { label: 'Auth Service',  description: 'JWT auth layer',      costs: { cognitive: 45, operational: 35, performance: 20, financial: 20, change: 65 }, decisionCount: 1 } },
  { id: 'database',      type: 'archNode', position: { x: 300, y: 380 }, data: { label: 'Database',      description: 'Primary data store',  costs: { cognitive: 25, operational: 40, performance: 50, financial: 45, change: 50 }, decisionCount: 1 } },
  { id: 'job-queue',     type: 'archNode', position: { x: 520, y: 240 }, data: { label: 'Job Queue',     description: 'Async processing',    costs: { cognitive: 40, operational: 55, performance: 30, financial: 35, change: 45 }, decisionCount: 0 } },
  { id: 'cache',         type: 'archNode', position: { x: 520, y: 400 }, data: { label: 'Cache Layer',   description: 'Redis cache',         costs: { cognitive: 20, operational: 30, performance: 15, financial: 25, change: 30 }, decisionCount: 0 } },
]
const DEMO_EDGES: Edge[] = [
  { id: 'e1', source: 'api-gateway',  target: 'auth-service', style: { stroke: '#2e2f36', strokeWidth: 1.5, strokeDasharray: '4 4' } },
  { id: 'e2', source: 'api-gateway',  target: 'database',     style: { stroke: '#2e2f36', strokeWidth: 1.5, strokeDasharray: '4 4' } },
  { id: 'e3', source: 'api-gateway',  target: 'job-queue',    style: { stroke: '#2e2f36', strokeWidth: 1.5, strokeDasharray: '4 4' } },
  { id: 'e4', source: 'database',     target: 'cache',        style: { stroke: '#2e2f36', strokeWidth: 1.5, strokeDasharray: '4 4' } },
  { id: 'e5', source: 'job-queue',    target: 'cache',        style: { stroke: '#2e2f36', strokeWidth: 1.5, strokeDasharray: '4 4' } },
]
