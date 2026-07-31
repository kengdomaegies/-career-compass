"use server";

import { cookies } from "next/headers";
import { getSetting, QUIZ_PASSCODE_KEY } from "@/lib/settings";
import { QUIZ_COOKIE, createQuizSessionValue, checkQuizPasscode } from "@/lib/quizSession";

export async function verifyQuizPasscodeAction(passcode) {
  const expected = await getSetting(QUIZ_PASSCODE_KEY);
  if (!expected) {
    // No passcode configured — access is open, nothing to check.
    return { ok: true };
  }
  if (!checkQuizPasscode(passcode, expected)) {
    return { ok: false, error: "That's not the right passcode." };
  }

  cookies().set(QUIZ_COOKIE, createQuizSessionValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return { ok: true };
}
