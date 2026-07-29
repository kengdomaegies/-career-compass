// Shared constants and pure scoring functions — imported by both the
// client-side quiz (to compute scores from answers) and the server-side
// API route (to validate incoming scores before calling Claude).

export const AREAS = [
  { key: "Building", angle: 0, blurb: "Working with tools, materials, and the physical world." },
  { key: "Thinking", angle: 60, blurb: "Research, theory, and intellectual problem-solving." },
  { key: "Creating", angle: 120, blurb: "Art, design, language, and self-expression." },
  { key: "Helping", angle: 180, blurb: "Teaching, coaching, and supporting other people." },
  { key: "Persuading", angle: 240, blurb: "Leading, selling, and influencing outcomes." },
  { key: "Organizing", angle: 300, blurb: "Structure, precision, and managing information." },
];

// 4 questions per interest area, Likert 1-5
export const INTEREST_QUESTIONS = [
  { area: "Building", text: "I'd rather fix something with my hands than read about how it works." },
  { area: "Building", text: "I feel most productive when I can see a physical result at the end of the day." },
  { area: "Building", text: "I'm drawn to jobs that involve tools, machines, or the outdoors." },
  { area: "Building", text: "I enjoy working with plants, animals, or physical materials." },

  { area: "Thinking", text: "I like digging into a hard problem until I understand why it works." },
  { area: "Thinking", text: "I'm energized by research, data, or testing a hypothesis." },
  { area: "Thinking", text: "I'd rather analyze a system than manage the people running it." },
  { area: "Thinking", text: "I enjoy reading and learning for its own sake, not just to finish a task." },

  { area: "Creating", text: "I want my work to feel like an original expression of my own ideas." },
  { area: "Creating", text: "I'm happiest with few guidelines and room to improvise." },
  { area: "Creating", text: "Aesthetics — how something looks, sounds, or reads — matter a lot to me." },
  { area: "Creating", text: "I'd choose a messier, more creative process over a predictable one." },

  { area: "Helping", text: "I feel real satisfaction when I've made someone else's day easier." },
  { area: "Helping", text: "I naturally notice when someone nearby is struggling." },
  { area: "Helping", text: "I'd rather coach someone through a problem than solve it for them." },
  { area: "Helping", text: "Cooperative, people-first environments bring out my best work." },

  { area: "Persuading", text: "I like setting a direction and getting others to commit to it." },
  { area: "Persuading", text: "I enjoy pitching ideas, even when the outcome is uncertain." },
  { area: "Persuading", text: "I want visible influence over decisions that matter." },
  { area: "Persuading", text: "Competition and ambitious goals motivate me more than they stress me." },

  { area: "Organizing", text: "I feel calmer when a process is documented and repeatable." },
  { area: "Organizing", text: "I notice errors or inconsistencies that other people miss." },
  { area: "Organizing", text: "I'd rather perfect a system than invent a new one." },
  { area: "Organizing", text: "Clear structure helps me do my best work; ambiguity drains me." },
].map((q) => ({ ...q, type: "interest" }));

// Work-style dimensions: each is a spectrum between two poles.
// Score of 100 = fully poleA; 0 = fully poleB. All items are worded toward poleA.
export const STYLE_DIMENSIONS = [
  {
    key: "focus",
    poleA: "Analytical",
    poleB: "Intuitive",
    aDesc: "Works from evidence, data, and step-by-step reasoning.",
    bDesc: "Works from instinct, pattern-sense, and quick judgment calls.",
  },
  {
    key: "drive",
    poleA: "Achievement-driven",
    poleB: "Purpose-driven",
    aDesc: "Motivated by measurable wins, status, and recognition.",
    bDesc: "Motivated by meaning, values, and contribution over metrics.",
  },
  {
    key: "connection",
    poleA: "Collaborative",
    poleB: "Independent",
    aDesc: "Energized by working alongside others and sharing process.",
    bDesc: "Prefers to work things out solo and be judged on results.",
  },
  {
    key: "pace",
    poleA: "Structured",
    poleB: "Adaptable",
    aDesc: "Thrives with clear plans, routines, and consistency.",
    bDesc: "Thrives with flexibility and room to change course.",
  },
];

export const STYLE_QUESTIONS = [
  { dim: "focus", text: "I want to see the data and reasoning before I commit to a decision." },
  { dim: "focus", text: "I trust logical analysis more than gut feeling when solving problems." },
  { dim: "focus", text: "I prefer step-by-step methods over quick instinctive calls." },
  { dim: "focus", text: "I feel most confident in a decision once I've verified it with evidence." },

  { dim: "drive", text: "Hitting ambitious goals and being recognized for it matters a lot to me." },
  { dim: "drive", text: "I'm motivated by competition and measurable wins." },
  { dim: "drive", text: "Status and advancement are real motivators for me at work." },
  { dim: "drive", text: "I track my progress closely against clear success metrics." },

  { dim: "connection", text: "I do my best thinking out loud, in conversation with others." },
  { dim: "connection", text: "I'd rather share process and credit with a team than work solo." },
  { dim: "connection", text: "Regular check-ins and collaboration energize me." },
  { dim: "connection", text: "I actively seek other people's input before finalizing my own view." },

  { dim: "pace", text: "I like a clear plan and prefer to stick to it once it's set." },
  { dim: "pace", text: "Predictable routines help me perform at my best." },
  { dim: "pace", text: "I prefer to finish one thing before starting the next." },
  { dim: "pace", text: "Consistency matters more to me than flexibility." },
].map((q) => ({ ...q, type: "style" }));

export const ALL_QUESTIONS = [...INTEREST_QUESTIONS, ...STYLE_QUESTIONS];

export const LIKERT = [
  { v: 1, label: "Disagree" },
  { v: 2, label: "Slightly disagree" },
  { v: 3, label: "Neutral" },
  { v: 4, label: "Slightly agree" },
  { v: 5, label: "Agree" },
];

export function computeInterestScores(answers) {
  const scores = {};
  AREAS.forEach((a) => {
    const qs = INTEREST_QUESTIONS.map((q, i) => ({ ...q, i })).filter((q) => q.area === a.key);
    const total = qs.reduce((sum, q) => sum + (answers[q.i] || 3), 0);
    const max = qs.length * 5;
    const min = qs.length * 1;
    scores[a.key] = Math.round(((total - min) / (max - min)) * 100);
  });
  return scores;
}

export function computeStyleScores(answers) {
  const scores = {};
  const offset = INTEREST_QUESTIONS.length;
  STYLE_DIMENSIONS.forEach((d) => {
    const qs = STYLE_QUESTIONS.map((q, i) => ({ ...q, i: i + offset })).filter((q) => q.dim === d.key);
    const total = qs.reduce((sum, q) => sum + (answers[q.i] || 3), 0);
    const max = qs.length * 5;
    const min = qs.length * 1;
    scores[d.key] = Math.round(((total - min) / (max - min)) * 100);
  });
  return scores;
}

// Resultant "bearing": vector sum of each interest area's score in its compass direction.
export function computeBearing(scores) {
  let x = 0,
    y = 0;
  AREAS.forEach((a) => {
    const rad = (a.angle * Math.PI) / 180;
    const s = scores[a.key] / 100;
    x += s * Math.sin(rad);
    y += -s * Math.cos(rad);
  });
  const angle = (Math.atan2(x, -y) * 180) / Math.PI;
  const normalized = ((angle % 360) + 360) % 360;
  const magnitude = Math.sqrt(x * x + y * y) / AREAS.length;
  return { angle: normalized, magnitude };
}

export function polarPoint(cx, cy, r, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
}

// Used server-side to validate that scores posted to the API are well-formed
// before they're interpolated into the Claude prompt or written to the DB.
export function isValidScoreMap(obj, keys) {
  return (
    !!obj &&
    typeof obj === "object" &&
    Object.keys(obj).length === keys.length &&
    keys.every((k) => typeof obj[k] === "number" && Number.isFinite(obj[k]) && obj[k] >= 0 && obj[k] <= 100)
  );
}
