export type CostVector = {
  cognitive: number;
  operational: number;
  performance: number;
  financial: number;
  change: number;
};

export type DecisionEvent = {
  id: string;
  component?: string; 
  timestamp: string;
  choice: string;
  description: string; 
  rationale: string;
  assumptions: string[];
  costs: CostVector;
  forkId?: string | null;
};

export type DecisionHistory = {
  component: string;
  events: DecisionEvent[];
};

export type DecisionFork = {
  forkId: string;
  label: string;
  events: DecisionEvent[];
};
