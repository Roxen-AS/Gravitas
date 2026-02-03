import OpenAI from "openai";
import { NarrativeBundle } from "../frontend/src/narrative/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function refineNarrative(
  bundle: NarrativeBundle
): Promise<string> {
  const prompt = `
You are refining an architectural decision explanation.

Rules:
- Do NOT introduce new facts
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

  const res = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2
  });

  return res.choices[0].message.content ?? "";
}
