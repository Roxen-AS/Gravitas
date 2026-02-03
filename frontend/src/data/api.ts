import { DecisionEvent } from "./types";
import { NarrativeBundle } from "../narrative/types";

const BASE_URL = "http://localhost:4000";

/* ───────── READ ───────── */

export async function fetchHistory(
  forkId?: string
): Promise<Record<string, DecisionEvent[]>> {
  const url = forkId
    ? `${BASE_URL}/history?forkId=${forkId}`
    : `${BASE_URL}/history`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

/* ───────── WRITE ───────── */

export async function appendEvent(
  event: Omit<DecisionEvent, "id" | "timestamp">
): Promise<DecisionEvent> {
  const res = await fetch(`${BASE_URL}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event)
  });

  if (!res.ok) throw new Error("Failed to append event");
  return res.json();
}

/* ───────── PHASE 6.2 ───────── */

export async function refineNarrative(
  bundle: NarrativeBundle
): Promise<string> {
  const res = await fetch(`${BASE_URL}/narrative/refine`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bundle)
  });

  if (!res.ok) {
    throw new Error("Narrative refinement failed");
  }

  const data = await res.json();
  return data.refined;
}
