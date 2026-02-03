import { DecisionEvent, CostVector } from "../data/types";
import { TraceableNarrative } from "./types";

/* ───────────────── Helpers ───────────────── */

function topCostDrivers(
  costs: CostVector,
  n: number = 2
): string[] {
  return Object.entries(costs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key]) => key);
}

function lowestCostDriver(costs: CostVector): string {
  return Object.entries(costs)
    .sort((a, b) => a[1] - b[1])[0][0];
}

function humanize(costKey: string): string {
  switch (costKey) {
    case "cognitive":
      return "cognitive load";
    case "operational":
      return "operational complexity";
    case "performance":
      return "runtime performance";
    case "financial":
      return "financial spend";
    case "change":
      return "future change difficulty";
    default:
      return costKey;
  }
}

/* ───────────────── Phase 6.3 ─────────────────
   Traceable Deterministic Narrative
───────────────────────────────────────────── */

export function explainDecisionTraceable(
  decision: DecisionEvent,
  priorEvents: DecisionEvent[]
): TraceableNarrative {
  const isInitial = priorEvents.length === 0;

  const optimizedFor = lowestCostDriver(decision.costs);
  const acceptedCosts = topCostDrivers(decision.costs);

  return {
    sentences: [
      {
        id: "context",
        text: isInitial
          ? "At the time this decision was made, the system was in its initial formation stage."
          : `At the time this decision was made, the system had already undergone ${priorEvents.length} architectural decision(s).`,
        sources: ["timestamp", "priorEvents"]
      },
      {
        id: "optimization",
        text: `This decision primarily optimized for reduced ${humanize(
          optimizedFor
        )}.`,
        sources: ["costs"]
      },
      {
        id: "tradeoffs",
        text: `In doing so, it knowingly accepted higher ${acceptedCosts
          .map(humanize)
          .join(" and ")}.`,
        sources: ["costs"]
      },
      {
        id: "assumptions",
        text:
          decision.assumptions.length > 0
            ? `This decision relied on the assumption that ${decision.assumptions.join(
                " and "
              )}.`
            : "This decision was made without explicitly documented assumptions.",
        sources: ["assumptions"]
      },
      {
        id: "deferred",
        text:
          decision.costs.change > 0.5
            ? "The long-term cost of this choice is expected to surface during future refactoring or system evolution."
            : "The long-term cost of this choice is expected to remain manageable under current constraints.",
        sources: ["costs"]
      }
    ]
  };
}
