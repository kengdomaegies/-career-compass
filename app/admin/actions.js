"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  ADMIN_COOKIE,
  createSessionValue,
  checkPasscode,
  verifySessionValue,
  hashPasscode,
  verifyPasscodeHash,
} from "@/lib/adminSession";
import { generateNarrative } from "@/lib/anthropic";
import { notifyReportGenerated } from "@/lib/email";
import { AREAS } from "@/lib/scoring";
import { deleteSetting, setSetting, getSetting, setQuizPasscodeConfig, QUIZ_PASSCODE_KEY, ADMIN_PASSCODE_HASH_KEY } from "@/lib/settings";

function expiresAtFromDays(days) {
  const n = Number(days);
  if (!n || n <= 0) return null;
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000).toISOString();
}

function currentOrigin() {
  const host = headers().get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

export async function loginAction(passcode) {
  if (!process.env.ADMIN_SESSION_SECRET) {
    return { ok: false, error: "Admin login isn't fully configured on the server (missing ADMIN_SESSION_SECRET)." };
  }

  // A custom passcode set from the dashboard (stored hashed in the DB)
  // takes over entirely once set — otherwise fall back to the
  // ADMIN_PASSCODE environment variable, so login keeps working
  // out of the box and can never get permanently locked out.
  const storedHash = await getSetting(ADMIN_PASSCODE_HASH_KEY);
  const passcodeOk = storedHash ? verifyPasscodeHash(passcode, storedHash) : checkPasscode(passcode);

  if (!storedHash && !process.env.ADMIN_PASSCODE) {
    return { ok: false, error: "Admin login isn't configured on the server (missing ADMIN_PASSCODE)." };
  }
  if (!passcodeOk) {
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
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Your admin session expired — reload the page and log in again." };
  }
  await prisma.report.delete({ where: { id } });
  revalidatePath("/admin");
  return { ok: true };
}

export async function regenerateNarrativeAction(id) {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Your admin session expired — reload the page and log in again." };
  }

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
    const reportUrl = `${currentOrigin()}/r/${id}`;
    const alertLog = await notifyReportGenerated({ clientName: report.clientName, reportUrl, error });
    const existingLog = Array.isArray(report.emailLog) ? report.emailLog : [];
    await prisma.report.update({ where: { id }, data: { error, emailLog: [...existingLog, ...alertLog] } });
    revalidatePath("/admin");
    return { ok: false, error };
  }
}

export async function setQuizPasscodeAction(passcode, expiresInDays) {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Your admin session expired — reload the page and log in again." };
  }

  const trimmed = typeof passcode === "string" ? passcode.trim() : "";
  const expiresAt = expiresAtFromDays(expiresInDays);
  if (trimmed) {
    await setQuizPasscodeConfig({ passcode: trimmed, expiresAt });
  } else {
    await deleteSetting(QUIZ_PASSCODE_KEY);
  }
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true, passcode: trimmed || null, expiresAt: trimmed ? expiresAt : null };
}

export async function createInviteAction({ label, clientEmail, expiresInDays }) {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Your admin session expired — reload the page and log in again." };
  }

  const invite = await prisma.invite.create({
    data: {
      label: typeof label === "string" && label.trim() ? label.trim().slice(0, 100) : null,
      clientEmail: typeof clientEmail === "string" && clientEmail.trim() ? clientEmail.trim().slice(0, 200) : null,
      expiresAt: expiresAtFromDays(expiresInDays),
    },
  });
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true, invite };
}

export async function revokeInviteAction(id) {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Your admin session expired — reload the page and log in again." };
  }
  await prisma.invite.update({ where: { id }, data: { revokedAt: new Date() } });
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteInviteAction(id) {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Your admin session expired — reload the page and log in again." };
  }
  await prisma.invite.delete({ where: { id } });
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true };
}

export async function changeAdminPasscodeAction(newPasscode, confirmPasscode) {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Your admin session expired — reload the page and log in again." };
  }

  const a = typeof newPasscode === "string" ? newPasscode.trim() : "";
  const b = typeof confirmPasscode === "string" ? confirmPasscode.trim() : "";
  if (a.length < 6) {
    return { ok: false, error: "Passcode must be at least 6 characters." };
  }
  if (a !== b) {
    return { ok: false, error: "Passcodes don't match." };
  }

  await setSetting(ADMIN_PASSCODE_HASH_KEY, hashPasscode(a));
  return { ok: true };
}

export async function resetAdminPasscodeAction() {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Your admin session expired — reload the page and log in again." };
  }
  await deleteSetting(ADMIN_PASSCODE_HASH_KEY);
  return { ok: true };
}

async function requireAdmin() {
  const value = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifySessionValue(value)) {
    throw new Error("Not authenticated");
  }
}
