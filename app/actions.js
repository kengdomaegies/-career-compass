"use server";

import { cookies } from "next/headers";
import { getQuizPasscodeConfig } from "@/lib/settings";
import { QUIZ_COOKIE, createQuizSessionValue, checkQuizPasscode, sessionTtlMs } from "@/lib/quizSession";

export async function verifyQuizPasscodeAction(passcode) {
  const config = await getQuizPasscodeConfig();
  if (!config) {
    return {
      ok: false,
      error: "There's no active passcode right now — ask your coach for a fresh one, or use your invite link.",
    };
  }
  if (!checkQuizPasscode(passcode, config.passcode)) {
    return { ok: false, error: "That's not the right passcode." };
  }

  const ttlMs = sessionTtlMs(config.expiresAt);
  cookies().set(QUIZ_COOKIE, createQuizSessionValue(ttlMs), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(ttlMs / 1000),
  });
  return { ok: true };
}
