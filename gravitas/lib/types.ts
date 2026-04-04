export interface CostVector {
  cognitive: number    // 0-100
  operational: number
  performance: number
  financial: number
  change: number
}

export interface DecisionEvent {
  id: string
  component: string
  choice: string
  description: string
  rationale: string
  assumptions: string[]
  costs: CostVector
  alternatives: { name: string; reason: string }[]
  timestamp: string
  forkId?: string
  forkParentId?: string
}

export interface GovernanceRecord {
  id: string
  decisionId: string
  owner: string
  status: 'proposed' | 'approved' | 'rejected' | 'superseded'
  reviewers: string[]
  notes: string
  createdAt: string
  updatedAt: string
}

export interface NarrativeSentence {
  text: string
  sources: string[]
}

export interface Narrative {
  sentences: NarrativeSentence[]
  refined?: string
}

export interface ArchNode {
  id: string
  label: string
  description: string
  x: number
  y: number
}

export interface ArchEdge {
  id: string
  source: string
  target: string
  label?: string
}

export interface ForkComparison {
  original: DecisionEvent
  fork: DecisionEvent
  costDelta: CostVector
}
