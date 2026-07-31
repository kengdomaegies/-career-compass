import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateNarrative } from "@/lib/anthropic";
import { notifyReportGenerated } from "@/lib/email";
import { AREAS, STYLE_DIMENSIONS, isValidScoreMap } from "@/lib/scoring";

const AREA_KEYS = AREAS.map((a) => a.key);
const DIM_KEYS = STYLE_DIMENSIONS.map((d) => d.key);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// This route can make up to 3 sequential Claude calls (with backoff) plus
// an email send, which can add up past Vercel's default function timeout
// on a slow generation. Give it more headroom.
export const maxDuration = 60;

export async function POST(req) {
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
