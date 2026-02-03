import { useEffect, useState } from "react";
import { ReactFlow, ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";

import { nodes, edges } from "./graph/nodes";
import { decisionAlternatives } from "./data/alternatives";
import { fetchHistory, appendEvent } from "./data/api";
import { explainDecisionTraceable } from "./narrative/explainDecision";

import type {
  CostVector,
  DecisionEvent,
  DecisionFork
} from "./data/types";
import type {
  TraceableNarrative,
  NarrativeSentence
} from "./narrative/types";

/* ───────────────── Helpers ───────────────── */

function accumulateCosts(events: DecisionEvent[]): CostVector {
  return events.reduce(
    (acc, e) => ({
      cognitive: acc.cognitive + e.costs.cognitive,
      operational: acc.operational + e.costs.operational,
      performance: acc.performance + e.costs.performance,
      financial: acc.financial + e.costs.financial,
      change: acc.change + e.costs.change
    }),
    {
      cognitive: 0,
      operational: 0,
      performance: 0,
      financial: 0,
      change: 0
    }
  );
}

function createFork(
  baseEvents: DecisionEvent[],
  alternative: DecisionEvent,
  label: string
): DecisionFork {
  return {
    forkId: crypto.randomUUID(),
    label,
    events: [...baseEvents.slice(0, -1), alternative]
  };
}

/* ───────────────── App ───────────────── */

export default function App() {
  const [history, setHistory] =
    useState<Record<string, DecisionEvent[]>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [activeFork, setActiveFork] =
    useState<DecisionFork | null>(null);
  const [loading, setLoading] = useState(true);
  const [committing, setCommitting] = useState(false);

  async function loadHistory() {
    setLoading(true);
    const data = await fetchHistory();
    setHistory(data);
    setLoading(false);
  }

  useEffect(() => {
    loadHistory();
  }, []);

  const componentHistory = selected
    ? history[selected] ?? []
    : [];

  const currentDecision =
    componentHistory.length > 0
      ? componentHistory[componentHistory.length - 1]
      : null;

  const baselineCost =
    componentHistory.length > 0
      ? accumulateCosts(componentHistory)
      : null;

  const forkCost = activeFork
    ? accumulateCosts(activeFork.events)
    : null;

  const alternatives =
    selected && decisionAlternatives[selected]
      ? decisionAlternatives[selected]
      : [];

  /* ───────── Phase 6.3 Narrative ───────── */

  const traceableNarrative: TraceableNarrative | null =
    currentDecision
      ? explainDecisionTraceable(
          currentDecision,
          componentHistory.slice(0, -1)
        )
      : null;

  /* ───────── Commit Fork ───────── */

  async function commitForkDecision() {
    if (!selected || !activeFork) return;

    const event = activeFork.events[activeFork.events.length - 1];
    setCommitting(true);

    await appendEvent({
      component: selected,
      choice: event.choice,
      description: event.description,
      rationale: event.rationale,
      assumptions: event.assumptions,
      costs: event.costs,
      forkId: activeFork.forkId
    });

    setActiveFork(null);
    await loadHistory();
    setCommitting(false);
  }

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0c0d0f",
          color: "#6f7482"
        }}
      >
        Replaying architectural history…
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <div style={{ height: "100vh", width: "100vw", position: "relative" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          onNodeClick={(_, node) => {
            setSelected(node.id);
            setActiveFork(null);
          }}
        />

        {selected && currentDecision && (
          <aside
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 520,
              height: "100%",
              background: "#121418",
              borderLeft: "1px solid #23262d",
              padding: "2rem",
              color: "#e6e7eb",
              overflowY: "auto"
            }}
          >
            <h2>{selected}</h2>

            <p style={{ marginTop: "1rem" }}>
              <strong>Current decision:</strong>{" "}
              {currentDecision.choice}
            </p>

            <p style={{ marginTop: "0.75rem", opacity: 0.8 }}>
              {currentDecision.description}
            </p>

            {/* ───────── Forking ───────── */}

            {alternatives.length > 0 && (
              <>
                <h3 style={{ marginTop: "2.5rem" }}>
                  Fork reality
                </h3>

                {alternatives.map((alt) => (
                  <button
                    key={alt.id}
                    onClick={() =>
                      setActiveFork(
                        createFork(
                          componentHistory,
                          alt,
                          `Alternative: ${alt.choice}`
                        )
                      )
                    }
                    style={{
                      display: "block",
                      width: "100%",
                      marginTop: "1rem",
                      background: "transparent",
                      color: "#e6e7eb",
                      border: "1px solid #23262d",
                      padding: "0.75rem",
                      textAlign: "left",
                      cursor: "pointer"
                    }}
                  >
                    Fork with <strong>{alt.choice}</strong>
                  </button>
                ))}
              </>
            )}

            {activeFork && forkCost && (
              <button
                onClick={commitForkDecision}
                disabled={committing}
                style={{
                  marginTop: "2rem",
                  width: "100%",
                  background: "#5f6ad2",
                  border: "none",
                  color: "#fff",
                  padding: "0.75rem",
                  cursor: "pointer"
                }}
              >
                Commit forked decision
              </button>
            )}

            {/* ───────── Explanation (Traceable) ───────── */}

            {traceableNarrative && (
              <>
                <h3 style={{ marginTop: "3rem" }}>
                  Explanation
                </h3>

                {traceableNarrative.sentences.map(
                  (sentence: NarrativeSentence) => (
                    <p
                      key={sentence.id}
                      title={`Derived from: ${sentence.sources.join(
                        ", "
                      )}`}
                      style={{
                        marginTop: "1rem",
                        lineHeight: 1.6,
                        color: "#a1a6b3",
                        cursor: "help"
                      }}
                    >
                      {sentence.text}
                    </p>
                  )
                )}
              </>
            )}
          </aside>
        )}
      </div>
    </ReactFlowProvider>
  );
}
