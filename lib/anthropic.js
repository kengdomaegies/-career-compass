import Anthropic from "@anthropic-ai/sdk";
import { STYLE_DIMENSIONS } from "./scoring";

// .trim() guards against a stray trailing newline/whitespace in the env var
// (e.g. from a copy-paste into Vercel's dashboard) — that alone is enough to
// make the key an invalid HTTP header value and fail every single request.
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY?.trim() });

// Runs server-side only — the API key never reaches the browser.
export async function generateNarrative(clientName, interestScores, styleScores, top2) {
  const styleSummary = STYLE_DIMENSIONS.map(
    (d) => `${d.poleA} vs ${d.poleB}: ${styleScores[d.key]}/100 toward ${d.poleA}`
  ).join("; ");

  const today = new Date().toLocaleDateString("en-MY", { year: "numeric", month: "long", day: "numeric" });

  const prompt = `You are helping a career coach at a Malaysia-based coaching practice generate a short, warm, specific narrative section for a client's career report. Do not be generic or filler-heavy.

Today's date is ${today}. Keep any references to industry trends or growth areas plausible for around this time — don't anchor to a specific older year, and don't claim access to real-time job market data or statistics you can't actually verify.

Client name: ${clientName || "the client"}
Interest scores (0-100, six areas): ${JSON.stringify(interestScores)}
Top two interest areas: ${top2[0].key} and ${top2[1].key}
Work style scores: ${styleSummary}

Ground the career suggestions in the Malaysian job market, but keep job titles broadly recognizable — the kind a career counselor in Malaysia would commonly reference — rather than hyper-specific niches or company names. Consider the full breadth of the local job market: skilled trades and vocational/blue-collar work (e.g. electrician, automotive technician, welder, machine operator, chef, logistics or driving roles, construction supervisor) are just as valid as office and professional roles, and should come up naturally when a client's profile fits — especially a strong Building interest score — not be skipped in favor of white-collar defaults. Where it's natural, note a realistic Malaysian entry pathway, picking whichever actually fits the role: an SPM/STPM/diploma/degree route, a TVET pathway (e.g. ILP, GIATMARA, a Kolej Vokasional, or an apprenticeship), or a relevant professional certification.

Respond with ONLY a JSON object (no markdown fences, no preamble) with this exact shape:
{
  "typeName": "a short 2-4 word evocative label for this profile, e.g. 'The Persuasive Builder'",
  "typeSummary": "2-3 sentences describing what motivates this person at work, grounded in the top two interest areas",
  "topAreaNarrative": "2-3 sentences on what the top interest area (${top2[0].key}) looks like in practice for this person",
  "workStyleNarrative": "2-3 sentences describing how this person's work-style leanings (from the four spectrums) show up day to day, and what kind of team or environment fits them best",
  "strengths": ["3 short, specific strength statements, each one sentence, drawing on both interests and work style"],
  "challenges": ["2-3 short, specific watch-out statements, each one sentence, framed constructively"],
  "careerSuggestions": [
    {"title": "job title", "why": "one sentence on why it fits this profile, grounded in the Malaysian job market"},
    {"title": "job title", "why": "one sentence on why it fits this profile, grounded in the Malaysian job market"},
    {"title": "job title", "why": "one sentence on why it fits this profile, grounded in the Malaysian job market"},
    {"title": "job title", "why": "one sentence on why it fits this profile, grounded in the Malaysian job market"},
    {"title": "job title", "why": "one sentence on why it fits this profile, grounded in the Malaysian job market"}
  ]
}

Provide exactly 5 career suggestions, varied enough to give real choice (not five near-duplicates of the same job).`;

  // Empty/truncated responses and connection errors are usually transient —
  // a couple of retries clears most of them without surfacing an error to
  // the client. A short delay before retrying gives a connection blip a
  // moment to pass, rather than immediately repeating into the same one.
  const attempts = 3;
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return await callClaude(prompt);
    } catch (e) {
      lastError = e;
      if (i < attempts - 1) await sleep(500 * (i + 1));
    }
  }
  throw lastError;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callClaude(prompt) {
  let message;
  try {
    message = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });
  } catch (e) {
    // "Connection error." alone isn't diagnostic — the SDK usually chains
    // the real underlying cause (e.g. a fetch/DNS/timeout error code).
    // Surface it so the stored error is actually actionable next time.
    const cause = e?.cause?.code || e?.cause?.message || e?.code;
    const detail = cause ? ` (${cause})` : "";
    throw new Error(`${e?.message || "unknown connection error"}${detail}`);
  }

  const text = message.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  const cleaned = text.replace(/```json|```/g, "").trim();
  const stopReason = message.stop_reason || "unknown";

  if (!cleaned) {
    throw new Error(`Claude returned an empty response (stop_reason: ${stopReason})`);
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    if (stopReason === "max_tokens") {
      throw new Error("response was cut off before it finished (hit max_tokens)");
    }
    throw new Error(`couldn't parse Claude's response as JSON (stop_reason: ${stopReason})`);
  }
}
