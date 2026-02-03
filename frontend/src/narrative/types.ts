export type NarrativeSource =
  | "timestamp"
  | "priorEvents"
  | "costs"
  | "assumptions"
  | "choice"
  | "rationale";

export type NarrativeSentence = {
  id: string;
  text: string;
  sources: NarrativeSource[];
};

export type TraceableNarrative = {
  sentences: NarrativeSentence[];
};

export type NarrativeBundle = {
  context: string;
  optimization: string;
  tradeoffs: string;
  assumptions: string;
  deferredCost: string;
};