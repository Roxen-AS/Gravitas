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
