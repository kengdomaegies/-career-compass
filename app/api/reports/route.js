import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateNarrative } from "@/lib/anthropic";
import { notifyReportGenerated } from "@/lib/email";
import { AREAS, STYLE_DIMENSIONS, isValidScoreMap } from "@/lib/scoring";
import { isQuizGateEnabled } from "@/lib/settings";
import { QUIZ_COOKIE, verifyQuizSessionValue } from "@/lib/quizSession";
import { checkRateLimit } from "@/lib/rateLimit";

const AREA_KEYS = AREAS.map((a) => a.key);
const DIM_KEYS = STYLE_DIMENSIONS.map((d) => d.key);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// This route can make up to 3 sequential Claude calls (with backoff) plus
// an email send, which can add up past Vercel's default function timeout
// on a slow generation. Give it more headroom.
export const maxDuration = 60;

export async function POST(req) {
  // The gate screen only protects the page — without this check, anyone who
  // finds this endpoint could POST directly and generate reports (burning
  // Claude/email costs) without ever having a valid passcode or invite.
  if (await isQuizGateEnabled()) {
    const sessionValue = req.cookies.get(QUIZ_COOKIE)?.value;
    if (!verifyQuizSessionValue(sessionValue)) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }
  }

  const rateLimit = await checkRateLimit(req);
  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: "Too many requests — please wait a bit and try again." },
      { status: 429 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { clientName, clientEmail, interestScores, styleScores } = body || {};

  if (!isValidScoreMap(interestScores, AREA_KEYS) || !isValidScoreMap(styleScores, DIM_KEYS)) {
    return NextResponse.json({ error: "Invalid or missing scores" }, { status: 400 });
  }

  const safeClientName = typeof clientName === "string" ? clientName.trim().slice(0, 100) : "";
  const safeClientEmail =
    typeof clientEmail === "string" && EMAIL_RE.test(clientEmail.trim()) ? clientEmail.trim().slice(0, 200) : "";
  const ranked = [...AREAS].sort((a, b) => interestScores[b.key] - interestScores[a.key]);

  let aiContent = null;
  let error = null;
  try {
    aiContent = await generateNarrative(safeClientName, interestScores, styleScores, ranked);
  } catch (e) {
    error = e?.message || "unknown error";
  }

  const report = await prisma.report.create({
    data: {
      clientName: safeClientName || null,
      clientEmail: safeClientEmail || null,
      interestScores,
      styleScores,
      aiContent,
      error,
    },
  });

  const reportUrl = new URL(`/r/${report.id}`, req.nextUrl.origin).toString();
  const emailLog = await notifyReportGenerated({ clientName: safeClientName, reportUrl });
  await prisma.report.update({ where: { id: report.id }, data: { emailLog } });

  return NextResponse.json({ id: report.id });
}
