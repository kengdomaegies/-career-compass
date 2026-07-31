import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ReportView from "@/components/ReportView";
import { BG } from "@/lib/theme";

export const dynamic = "force-dynamic";

export default async function ReportPage({ params, searchParams }) {
  const report = await prisma.report.findUnique({ where: { id: params.token } });

  if (!report) notFound();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <ReportView
        clientName={report.clientName}
        interestScores={report.interestScores}
        styleScores={report.styleScores}
        aiContent={report.aiContent}
        error={report.error}
        createdAt={report.createdAt}
        fromAdmin={searchParams?.from === "admin"}
      />
    </div>
  );
}
