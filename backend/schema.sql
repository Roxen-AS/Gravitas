CREATE TABLE IF NOT EXISTS decision_events (
  id TEXT PRIMARY KEY,
  component TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  choice TEXT NOT NULL,
  rationale TEXT NOT NULL,
  assumptions TEXT NOT NULL, -- JSON
  costs TEXT NOT NULL,       -- JSON
  fork_id TEXT              -- NULL = baseline
);
