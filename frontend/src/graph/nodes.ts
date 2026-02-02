import { Node, Edge } from "reactflow";

export const nodes: Node[] = [
  {
    id: "api",
    position: { x: 280, y: 120 },
    data: { label: "API Layer" }
  },
  {
    id: "auth",
    position: { x: 120, y: 340 },
    data: { label: "Authentication" }
  },
  {
    id: "db",
    position: { x: 460, y: 340 },
    data: { label: "Database" }
  }
];

export const edges: Edge[] = [
  { id: "e-api-auth", source: "api", target: "auth" },
  { id: "e-api-db", source: "api", target: "db" }
];
