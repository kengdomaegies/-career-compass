import crypto from "crypto";

// A separate cookie/signing scope from the admin session — a quiz-taker
// unlocking the assessment should never end up with admin access, even
// though both reuse ADMIN_SESSION_SECRET as the signing key.
export const QUIZ_COOKIE = "quiz_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set");
  }
  return secret;
}

function sign(payload) {
  return crypto.createHmac("sha256", getSecret()).update(`quiz:${payload}`).digest("hex");
}

export function createQuizSessionValue() {
  const expiry = String(Date.now() + SESSION_TTL_MS);
  return `${expiry}.${sign(expiry)}`;
}

export function verifyQuizSessionValue(value) {
  if (!value || typeof value !== "string") return false;
  const [expiry, mac] = value.split(".");
  if (!expiry || !mac) return false;
  if (Date.now() > Number(expiry)) return false;

  let expectedBuf, actualBuf;
  try {
    expectedBuf = Buffer.from(sign(expiry), "hex");
    actualBuf = Buffer.from(mac, "hex");
  } catch {
    return false;
  }
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

export function checkQuizPasscode(input, expected) {
  if (!expected || typeof input !== "string" || input.length === 0) return false;
  const expectedBuf = Buffer.from(expected);
  const inputBuf = Buffer.from(input);
  if (expectedBuf.length !== inputBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, inputBuf);
}
