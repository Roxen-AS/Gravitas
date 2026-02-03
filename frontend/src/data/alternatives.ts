import { DecisionEvent } from "./types";

export const decisionAlternatives: Record<string, DecisionEvent[]> = {
  api: [
    {
      id: "api-alt-1",
      timestamp: "2025-11-12",
      choice: "REST",
      rationale:
        "Reduced backend cognitive load and operational complexity at the cost of slower frontend iteration.",
      assumptions: ["API surface remains stable"],
      costs: {
        cognitive: 0.35,
        operational: 0.3,
        performance: 0.28,
        financial: 0.25,
        change: 0.55
      }
    }
  ],

  db: [
    {
      id: "db-alt-1",
      timestamp: "2025-11-05",
      choice: "NoSQL (Document)",
      rationale:
        "Prioritized horizontal scalability and flexible schemas over relational guarantees.",
      assumptions: ["Access patterns stabilize"],
      costs: {
        cognitive: 0.6,
        operational: 0.55,
        performance: 0.25,
        financial: 0.45,
        change: 0.6
      }
    }
  ]
};
