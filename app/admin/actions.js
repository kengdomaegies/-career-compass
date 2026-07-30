"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, createSessionValue, checkPasscode, verifySessionValue } from "@/lib/adminSession";
import { generateNarrative } from "@/lib/anthropic";
import { AREAS } from "@/lib/scoring";

export async function loginAction(passcode) {
  if (!process.env.ADMIN_PASSCODE || !process.env.ADMIN_SESSION_SECRET) {
    return {
      ok: false,
      error: "Admin login isn't fully configured on the server (missing ADMIN_PASSCODE or ADMIN_SESSION_SECRET).",
    };
  }
  if (!checkPasscode(passcode)) {
    return { ok: false, error: "That's not the right passcode." };
  }

  cookies().set(ADMIN_COOKIE, createSessionValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  revalidatePath("/admin");
  return { ok: true };
}

export async function logoutAction() {
  cookies().delete(ADMIN_COOKIE);
  revalidatePath("/admin");
}

export async function deleteReportAction(id) {
  await requireAdmin();
  await prisma.report.delete({ where: { id } });
  revalidatePath("/admin");
  return { ok: true };
}

export async function regenerateNarrativeAction(id) {
  await requireAdmin();

  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) return { ok: false, error: "Report not found" };

  const ranked = [...AREAS].sort((a, b) => report.interestScores[b.key] - report.interestScores[a.key]);

  try {
    const aiContent = await generateNarrative(report.clientName, report.interestScores, report.styleScores, ranked);
    await prisma.report.update({ where: { id }, data: { aiContent, error: null } });
    revalidatePath("/admin");
    revalidatePath(`/r/${id}`);
    return { ok: true };
  } catch (e) {
    const error = e?.message || "unknown error";
    await prisma.report.update({ where: { id }, data: { error } });
    revalidatePath("/admin");
    return { ok: false, error };
  }
}

async function requireAdmin() {
  const value = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifySessionValue(value)) {
    throw new Error("Not authenticated");
  }
}
