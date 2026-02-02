export type CostVector = {
  cognitive: number;
  operational: number;
  performance: number;
  financial: number;
  change: number;
};

export type Decision = {
  title: string;
  decision: string;
  why: string;
  assumptions: string[];
  costs: CostVector;
};

export const decisions: Record<string, Decision> = {
  api: {
    title: "API Layer",
    decision: "GraphQL",
    why:
      "This choice optimized for frontend iteration speed under tight delivery pressure, accepting higher backend complexity in exchange for velocity.",
    assumptions: ["Traffic remains below 10k requests/day"],
    costs: {
      cognitive: 0.72,
      operational: 0.64,
      performance: 0.32,
      financial: 0.38,
      change: 0.52
    }
  },
  auth: {
    title: "Authentication",
    decision: "Managed Identity Provider",
    why:
      "Security risk was prioritized over long-term flexibility due to limited in-house authentication expertise.",
    assumptions: ["Vendor SLA remains stable"],
    costs: {
      cognitive: 0.28,
      operational: 0.22,
      performance: 0.18,
      financial: 0.62,
      change: 0.71
    }
  },
  db: {
    title: "Database",
    decision: "PostgreSQL",
    why:
      "Operational predictability and relational guarantees were favored over horizontal scalability.",
    assumptions: ["Data model remains relational"],
    costs: {
      cognitive: 0.21,
      operational: 0.31,
      performance: 0.34,
      financial: 0.24,
      change: 0.41
    }
  }
};
