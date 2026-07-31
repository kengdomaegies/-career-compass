import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { QUIZ_COOKIE, createQuizSessionValue, sessionTtlMs } from "@/lib/quizSession";

export async function GET(req, { params }) {
  const origin = req.nextUrl.origin;
  const invite = await prisma.invite.findUnique({ where: { id: params.token } });

  const invalid =
    !invite || invite.revokedAt || (invite.expiresAt && new Date(invite.expiresAt) <= new Date());
  if (invalid) {
    return NextResponse.redirect(new URL("/invite-invalid", origin));
  }

  const ttlMs = sessionTtlMs(invite.expiresAt);
  const response = NextResponse.redirect(new URL("/", origin));
  response.cookies.set(QUIZ_COOKIE, createQuizSessionValue(ttlMs), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(ttlMs / 1000),
  });

  await prisma.invite.update({
    where: { id: invite.id },
    data: { firstUsedAt: invite.firstUsedAt ?? new Date(), usedCount: { increment: 1 } },
  });

  return response;
}
