import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = process.env.RESEND_FROM || "Career Compass <onboarding@resend.dev>";
const OWNER_EMAIL = process.env.OWNER_EMAIL || "alvinkeng@gmail.com";

function buildEmail({ clientName, reportUrl, purpose }) {
  const name = clientName || "a client";
  const intro =
    purpose === "owner"
      ? `A new Career Compass report was just generated for ${name}.`
      : `Here${clientName ? `'s ${clientName}'s` : "'s a"} Career Compass report.`;

  const text = `${intro}\n\nView it here: ${reportUrl}\n\nThis link is private — anyone with it can view the report, so only share it with people who should see it.`;

  const html = `
    <p>${intro}</p>
    <p><a href="${reportUrl}">${reportUrl}</a></p>
    <p style="color:#6B7280;font-size:13px;">This link is private — anyone with it can view the report, so only share it with people who should see it.</p>
  `;

  return {
    subject: `Career Compass Report — ${name}`,
    text,
    html,
  };
}

// Sends one email and returns a log entry describing the attempt — never throws,
// so a failed send never blocks report creation or the caller's response.
async function sendOne({ to, clientName, reportUrl, purpose }) {
  const entry = { to, purpose, sentAt: new Date().toISOString() };

  if (!resend) {
    return { ...entry, ok: false, error: "RESEND_API_KEY not configured" };
  }
  if (!to) {
    return { ...entry, ok: false, error: "no recipient" };
  }

  try {
    const { subject, text, html } = buildEmail({ clientName, reportUrl, purpose });
    const { error } = await resend.emails.send({ from: FROM, to, subject, text, html });
    if (error) return { ...entry, ok: false, error: error.message || String(error) };
    return { ...entry, ok: true };
  } catch (e) {
    return { ...entry, ok: false, error: e?.message || "unknown error" };
  }
}

// Called right after a report is created: notifies the owner, and the client
// if they gave an email address. Best-effort — returns log entries to persist.
export async function notifyReportGenerated({ clientName, clientEmail, reportUrl }) {
  const sends = [sendOne({ to: OWNER_EMAIL, clientName, reportUrl, purpose: "owner" })];
  if (clientEmail) {
    sends.push(sendOne({ to: clientEmail, clientName, reportUrl, purpose: "client" }));
  }
  return Promise.all(sends);
}

// Called from the "send this report" box — sends to any single address on demand.
export async function sendReportToEmail({ to, clientName, reportUrl }) {
  return sendOne({ to, clientName, reportUrl, purpose: "manual" });
}
