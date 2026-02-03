import Database from "better-sqlite3";

export const db = new Database("gravitas.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS decision_events (
    id TEXT PRIMARY KEY,
    component TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    choice TEXT NOT NULL,
    rationale TEXT NOT NULL,
    assumptions TEXT NOT NULL,
    costs TEXT NOT NULL,
    fork_id TEXT
  );
`);
