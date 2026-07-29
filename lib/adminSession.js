import crypto from "crypto";

export const ADMIN_COOKIE = "admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set");
  }
  return secret;
}

function sign(payload) {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

// Stateless signed cookie: "<expiryMs>.<hmac(expiryMs)>" — no server-side
// session store needed, and it can't be forged without ADMIN_SESSION_SECRET.
export function createSessionValue() {
  const expiry = String(Date.now() + SESSION_TTL_MS);
  return `${expiry}.${sign(expiry)}`;
}

export function verifySessionValue(value) {
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

export function checkPasscode(input) {
  const expected = process.env.ADMIN_PASSCODE;
  if (!expected || typeof input !== "string" || input.length === 0) return false;
  const expectedBuf = Buffer.from(expected);
  const inputBuf = Buffer.from(input);
  if (expectedBuf.length !== inputBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, inputBuf);
}
