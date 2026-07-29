import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, verifySessionValue } from "@/lib/adminSession";
import AdminLoginForm from "@/components/AdminLoginForm";
import AdminDashboard from "@/components/AdminDashboard";
import { BG } from "@/lib/theme";

export const metadata = { title: "Admin — Career Compass" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const sessionValue = cookies().get(ADMIN_COOKIE)?.value;
  const authed = verifySessionValue(sessionValue);

  const reports = authed
    ? await prisma.report.findMany({
        orderBy: { createdAt: "desc" },
        select: { id: true, clientName: true, clientEmail: true, createdAt: true, interestScores: true },
      })
    : [];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {authed ? <AdminDashboard reports={reports} /> : <AdminLoginForm />}
    </div>
  );
}
