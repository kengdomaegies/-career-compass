import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReportToEmail } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req, { params }) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const to = typeof body?.to === "string" ? body.to.trim() : "";
  if (!EMAIL_RE.test(to)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const report = await prisma.report.findUnique({ where: { id: params.id } });
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const reportUrl = new URL(`/r/${report.id}`, req.nextUrl.origin).toString();
  const result = await sendReportToEmail({ to, clientName: report.clientName, reportUrl });

  const emailLog = Array.isArray(report.emailLog) ? report.emailLog : [];
  await prisma.report.update({
    where: { id: report.id },
    data: { emailLog: [...emailLog, result] },
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error || "Send failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
