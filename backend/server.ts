import express from "express";
import cors from "cors";
import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import OpenAI from "openai";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */

type CostVector = {
  cognitive: number;
  operational: number;
  performance: number;
  financial: number;
  change: number;
};

type DecisionEvent = {
  id: string;
  component: string;
  timestamp: string;
  choice: string;
  description: string;
  rationale: string;
  assumptions: string[];
  costs: CostVector;
  forkId?: string | null;
};

type NarrativeBundle = {
  context: string;
  optimization: string;
  tradeoffs: string;
  assumptions: string;
  deferredCost: string;
};

/* ─────────────────────────────────────────────
   DB Setup
───────────────────────────────────────────── */

const db = new Database("gravitas.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS decision_events (
    id TEXT PRIMARY KEY,
    component TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    choice TEXT NOT NULL,
    description TEXT NOT NULL,
    rationale TEXT NOT NULL,
    assumptions TEXT NOT NULL,
    costs TEXT NOT NULL,
    fork_id TEXT
  );
`);

/* ─────────────────────────────────────────────
   Server Setup
───────────────────────────────────────────── */

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */

function rowToEvent(row: any): DecisionEvent {
  return {
    id: row.id,
    component: row.component,
    timestamp: row.timestamp,
    choice: row.choice,
    description: row.description,
    rationale: row.rationale,
    assumptions: JSON.parse(row.assumptions),
    costs: JSON.parse(row.costs),
    forkId: row.fork_id ?? null
  };
}

/* ─────────────────────────────────────────────
   Routes — Events
───────────────────────────────────────────── */

app.post("/events", (req, res) => {
  const event: DecisionEvent = {
    id: req.body.id ?? uuidv4(),
    component: req.body.component,
    timestamp: req.body.timestamp ?? new Date().toISOString(),
    choice: req.body.choice,
    description: req.body.description,
    rationale: req.body.rationale,
    assumptions: req.body.assumptions ?? [],
    costs: req.body.costs,
    forkId: req.body.forkId ?? null
  };

  if (!event.component || !event.choice || !event.description || !event.costs) {
    return res.status(400).json({ error: "Invalid DecisionEvent" });
  }

  db.prepare(`
    INSERT INTO decision_events
    (id, component, timestamp, choice, description, rationale, assumptions, costs, fork_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    event.id,
    event.component,
    event.timestamp,
    event.choice,
    event.description,
    event.rationale,
    JSON.stringify(event.assumptions),
    JSON.stringify(event.costs),
    event.forkId
  );

  res.status(201).json(event);
});

app.get("/history", (req, res) => {
  const forkId = req.query.forkId as string | undefined;

  const rows = forkId
    ? db.prepare(`
        SELECT * FROM decision_events
        WHERE fork_id IS NULL OR fork_id = ?
        ORDER BY timestamp ASC
      `).all(forkId)
    : db.prepare(`
        SELECT * FROM decision_events
        WHERE fork_id IS NULL
        ORDER BY timestamp ASC
      `).all();

  const history: Record<string, DecisionEvent[]> = {};

  rows.forEach((row: any) => {
    const event = rowToEvent(row);
    if (!history[event.component]) history[event.component] = [];
    history[event.component].push(event);
  });

  res.json(history);
});

/* ─────────────────────────────────────────────
   Phase 6.2 — Narrative Refinement
───────────────────────────────────────────── */

app.post("/narrative/refine", async (req, res) => {
  const bundle: NarrativeBundle = req.body;

  try {
    const prompt = `
You are refining an architectural decision explanation.

Rules:
- Do NOT add new facts
- Do NOT add opinions
- Do NOT change meaning
- Only improve clarity and flow

Facts:
Context: ${bundle.context}
Optimization: ${bundle.optimization}
Tradeoffs: ${bundle.tradeoffs}
Assumptions: ${bundle.assumptions}
Deferred Cost: ${bundle.deferredCost}

Rewrite this as a clear, professional explanation.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }]
    });

    res.json({
      refined: completion.choices[0].message.content
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Narrative refinement failed"
    });
  }
});

/* ─────────────────────────────────────────────
   Health
───────────────────────────────────────────── */

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "gravitas-backend" });
});

/* ─────────────────────────────────────────────
   Start
───────────────────────────────────────────── */

app.listen(4000, () => {
  console.log("🧠 Gravitas backend running on http://localhost:4000");
});
