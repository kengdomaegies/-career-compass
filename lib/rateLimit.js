import { prisma } from "./prisma";

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_PER_WINDOW = 5; // generous for a real client (one submission, maybe a retry or two)

export function getClientIp(req) {
  return (
    req.ip ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

// Checks and records in one pass. Also prunes hits older than the window for
// this IP, so the table stays small without a separate cleanup job.
export async function checkRateLimit(req) {
  const ip = getClientIp(req);
  const windowStart = new Date(Date.now() - WINDOW_MS);

  await prisma.rateLimitHit.deleteMany({ where: { ip, createdAt: { lt: windowStart } } });
  const count = await prisma.rateLimitHit.count({ where: { ip, createdAt: { gte: windowStart } } });

  if (count >= MAX_PER_WINDOW) {
    return { ok: false, ip };
  }

  await prisma.rateLimitHit.create({ data: { ip } });
  return { ok: true, ip };
}
