import { useState } from "react";
import { ReactFlow, ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";

import { nodes, edges } from "./graph/nodes";
import { decisions } from "./data/architecture";

export default function App() {
  const [selected, setSelected] = useState<string | null>(null);

  const decision = selected ? decisions[selected] : null;

  return (
    <ReactFlowProvider>
      <div style={{ height: "100vh", width: "100vw", position: "relative" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          onNodeClick={(_, node) => setSelected(node.id)}
        />

        {decision && (
          <aside
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 420,
              height: "100%",
              background: "#111",
              borderLeft: "1px solid #222",
              padding: "2rem",
              color: "#e6e7eb",
              overflowY: "auto"
            }}
          >
            <h2>{decision.title}</h2>

            <p style={{ marginTop: "1rem" }}>
              <strong>Decision:</strong> {decision.decision}
            </p>

            <p style={{ marginTop: "1rem", opacity: 0.8 }}>
              {decision.why}
            </p>
          </aside>
        )}
      </div>
    </ReactFlowProvider>
  );
}
