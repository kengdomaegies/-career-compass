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

// A custom admin passcode (set from the dashboard, stored in the DB so it
// can change without a redeploy) is hashed, unlike the quiz passcode —
// this one gates every client's PII, and unlike the quiz passcode it's
// never displayed back to the admin, so a one-way hash costs nothing.
export function hashPasscode(passcode) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(passcode, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPasscodeHash(input, stored) {
  if (!input || !stored) return false;
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  let hashBuf, inputBuf;
  try {
    hashBuf = Buffer.from(hash, "hex");
    inputBuf = Buffer.from(crypto.scryptSync(input, salt, 64).toString("hex"), "hex");
  } catch {
    return false;
  }
  if (hashBuf.length !== inputBuf.length) return false;
  return crypto.timingSafeEqual(hashBuf, inputBuf);
}
