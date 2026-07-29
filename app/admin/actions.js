"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, createSessionValue, checkPasscode, verifySessionValue } from "@/lib/adminSession";

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

async function requireAdmin() {
  const value = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifySessionValue(value)) {
    throw new Error("Not authenticated");
  }
}
