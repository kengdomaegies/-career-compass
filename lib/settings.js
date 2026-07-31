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
