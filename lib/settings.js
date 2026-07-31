import { prisma } from "./prisma";

export const QUIZ_PASSCODE_KEY = "quiz_passcode";

export async function getSetting(key) {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? null;
}

export async function setSetting(key, value) {
  await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
}

export async function deleteSetting(key) {
  await prisma.setting.deleteMany({ where: { key } });
}

// The quiz passcode setting is stored as JSON ({ passcode, expiresAt }) so it
// can carry an optional expiry alongside the passcode itself. Returns the
// config as-is (even if expired) — for display in the admin dashboard.
export async function getQuizPasscodeConfigRaw() {
  const raw = await getSetting(QUIZ_PASSCODE_KEY);
  if (!raw) return null;
  try {
    const config = JSON.parse(raw);
    return config?.passcode ? config : null;
  } catch {
    return null;
  }
}

// Same, but returns null if the passcode has expired — used when verifying
// an entered passcode, where an expired one must not work.
export async function getQuizPasscodeConfig() {
  const config = await getQuizPasscodeConfigRaw();
  if (!config) return null;
  if (config.expiresAt && new Date(config.expiresAt) <= new Date()) return null;
  return config;
}

export async function setQuizPasscodeConfig({ passcode, expiresAt }) {
  await setSetting(QUIZ_PASSCODE_KEY, JSON.stringify({ passcode, expiresAt: expiresAt || null }));
}

// The gate stays on once any access control has ever been configured, even
// if the current passcode has since expired or every invite has expired —
// otherwise an expired credential would silently reopen the assessment to
// the public, defeating the point of expiring access.
export async function isQuizGateEnabled() {
  const raw = await getSetting(QUIZ_PASSCODE_KEY);
  if (raw) return true;
  const inviteCount = await prisma.invite.count();
  return inviteCount > 0;
}
