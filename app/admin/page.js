import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, verifySessionValue } from "@/lib/adminSession";
import { getSetting, QUIZ_PASSCODE_KEY } from "@/lib/settings";
import AdminLoginForm from "@/components/AdminLoginForm";
import AdminDashboard from "@/components/AdminDashboard";
import { BG } from "@/lib/theme";

export const metadata = { title: "Admin — Career Compass" };
export const dynamic = "force-dynamic";
// The "Regenerate narrative" action can make up to 3 sequential Claude
// calls with backoff — give it the same headroom as the reports route.
export const maxDuration = 60;

export default async function AdminPage() {
  const sessionValue = cookies().get(ADMIN_COOKIE)?.value;
  const authed = verifySessionValue(sessionValue);

  const [reports, quizPasscode] = authed
    ? await Promise.all([
        prisma.report.findMany({
          orderBy: { createdAt: "desc" },
          select: { id: true, clientName: true, clientEmail: true, createdAt: true, interestScores: true, error: true },
        }),
        getSetting(QUIZ_PASSCODE_KEY),
      ])
    : [[], null];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {authed ? <AdminDashboard reports={reports} quizPasscode={quizPasscode} /> : <AdminLoginForm />}
    </div>
  );
}
