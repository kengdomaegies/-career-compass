// Warm-up questions shown on their own screen before the main assessment —
// quick context to ease clients into the process, not scored or fed into
// the interest/style calculations. Answers are saved on the report for the
// coach's own reference (visible via CSV export).
export const PROFILE_QUESTIONS = [
  {
    key: "gender",
    text: "Gender",
    options: ["Male", "Female", "Prefer not to say"],
  },
  {
    key: "ageGroup",
    text: "Age group",
    options: ["Under 18", "18–24", "25–34", "35–44", "45–54", "55+"],
  },
  {
    key: "lifeSituation",
    text: "Current life situation",
    options: [
      "Still in secondary school",
      "Just finished SPM or high school",
      "Studying at college or university",
      "Fresh graduate looking for first job",
      "Working (less than 5 years experience)",
      "Working (5+ years experience)",
      "Between jobs",
      "Considering a career change",
    ],
  },
  {
    key: "reason",
    text: "What brings you here today?",
    subtext: "Pick one",
    options: [
      "I don't know what career suits me",
      "I want to change careers",
      "I want to grow in my current career",
      "I'm choosing what to study",
      "I'm returning to work after a break",
    ],
  },
  {
    key: "clarity",
    text: "How clear are you about your career direction right now?",
    options: [
      "Very clear — I just need a plan",
      "Somewhat clear — deciding between options",
      "Unclear — I have no idea where to start",
    ],
  },
];
