import Anthropic from "@anthropic-ai/sdk";
import { STYLE_DIMENSIONS } from "./scoring";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Runs server-side only — the API key never reaches the browser.
export async function generateNarrative(clientName, interestScores, styleScores, top2) {
  const styleSummary = STYLE_DIMENSIONS.map(
    (d) => `${d.poleA} vs ${d.poleB}: ${styleScores[d.key]}/100 toward ${d.poleA}`
  ).join("; ");

  const prompt = `You are helping a career coach generate a short, warm, specific narrative section for a client's career report. Do not be generic or filler-heavy.

Client name: ${clientName || "the client"}
Interest scores (0-100, six areas): ${JSON.stringify(interestScores)}
Top two interest areas: ${top2[0].key} and ${top2[1].key}
Work style scores: ${styleSummary}

Respond with ONLY a JSON object (no markdown fences, no preamble) with this exact shape:
{
  "typeName": "a short 2-4 word evocative label for this profile, e.g. 'The Persuasive Builder'",
  "typeSummary": "2-3 sentences describing what motivates this person at work, grounded in the top two interest areas",
  "topAreaNarrative": "2-3 sentences on what the top interest area (${top2[0].key}) looks like in practice for this person",
  "workStyleNarrative": "2-3 sentences describing how this person's work-style leanings (from the four spectrums) show up day to day, and what kind of team or environment fits them best",
  "strengths": ["3 short, specific strength statements, each one sentence, drawing on both interests and work style"],
  "challenges": ["2-3 short, specific watch-out statements, each one sentence, framed constructively"],
  "careerSuggestions": [
    {"title": "job title", "why": "one sentence on why it fits this profile"},
    {"title": "job title", "why": "one sentence on why it fits this profile"},
    {"title": "job title", "why": "one sentence on why it fits this profile"},
    {"title": "job title", "why": "one sentence on why it fits this profile"},
    {"title": "job title", "why": "one sentence on why it fits this profile"}
  ]
}

Provide exactly 5 career suggestions, varied enough to give real choice (not five near-duplicates of the same job).`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  const cleaned = text.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    if (message.stop_reason === "max_tokens") {
      throw new Error("response was cut off before it finished (hit max_tokens) — try again");
    }
    throw e;
  }
}
