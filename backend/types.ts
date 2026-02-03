export type CostVector = {
  cognitive: number;
  operational: number;
  performance: number;
  financial: number;
  change: number;
};

export type DecisionEvent = {
  id: string;
  component: string;
  timestamp: string;
  choice: string;
  rationale: string;
  assumptions: string[];
  costs: CostVector;
  forkId?: string; // null = baseline reality
};
