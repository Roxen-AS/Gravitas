import { DecisionHistory } from "./types";

export const architectureHistory: Record<string, DecisionHistory> = {
  api: {
    component: "API Layer",
    events: [
      {
        id: "api-1",
        timestamp: "2025-11-12",
        choice: "GraphQL",
        rationale:
          "Optimized for frontend iteration speed under tight delivery pressure, accepting higher backend complexity.",
        assumptions: ["Traffic below 10k requests/day"],
        costs: {
          cognitive: 0.72,
          operational: 0.64,
          performance: 0.32,
          financial: 0.38,
          change: 0.52
        }
      }
    ]
  },

  auth: {
    component: "Authentication",
    events: [
      {
        id: "auth-1",
        timestamp: "2025-11-10",
        choice: "Managed Identity Provider",
        rationale:
          "Security risk was prioritized over flexibility due to limited in-house authentication expertise.",
        assumptions: ["Vendor SLA stability"],
        costs: {
          cognitive: 0.28,
          operational: 0.22,
          performance: 0.18,
          financial: 0.62,
          change: 0.71
        }
      }
    ]
  },

  db: {
    component: "Database",
    events: [
      {
        id: "db-1",
        timestamp: "2025-11-05",
        choice: "PostgreSQL",
        rationale:
          "Operational predictability and relational guarantees outweighed horizontal scalability.",
        assumptions: ["Data remains relational"],
        costs: {
          cognitive: 0.21,
          operational: 0.31,
          performance: 0.34,
          financial: 0.24,
          change: 0.41
        }
      }
    ]
  }
};
