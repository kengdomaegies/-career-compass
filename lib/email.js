import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = process.env.RESEND_FROM || "Career Compass <onboarding@resend.dev>";
const OWNER_EMAIL = process.env.OWNER_EMAIL || "alvinkeng@gmail.com";

function buildOwnerNotification({ clientName, reportUrl }) {
  const name = clientName || "a client";
  const text = `A new Career Compass report was just generated for ${name}.\n\nView it here: ${reportUrl}\n\nThis link is private — anyone with it can view the report, so only share it with people who should see it.`;
  const html = `
    <p>A new Career Compass report was just generated for ${name}.</p>
    <p><a href="${reportUrl}">${reportUrl}</a></p>
    <p style="color:#6B7280;font-size:13px;">This link is private — anyone with it can view the report, so only share it with people who should see it.</p>
  `;

  return { subject: `Career Compass Report — ${name}`, text, html };
}

// Called right after a report is created: notifies the owner. Best-effort —
// never throws, so a failed send never blocks report creation. The client's
// email is still collected (for the coach's own follow-up) but isn't
// auto-emailed a copy.
export async function notifyReportGenerated({ clientName, reportUrl }) {
  const entry = { to: OWNER_EMAIL, purpose: "owner", sentAt: new Date().toISOString() };

  if (!resend) {
    return [{ ...entry, ok: false, error: "RESEND_API_KEY not configured" }];
  }

  try {
    const { subject, text, html } = buildOwnerNotification({ clientName, reportUrl });
    const { error } = await resend.emails.send({ from: FROM, to: OWNER_EMAIL, subject, text, html });
    if (error) return [{ ...entry, ok: false, error: error.message || String(error) }];
    return [{ ...entry, ok: true }];
  } catch (e) {
    return [{ ...entry, ok: false, error: e?.message || "unknown error" }];
  }
}
