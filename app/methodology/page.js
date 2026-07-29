import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MethodologyContent from "@/components/MethodologyContent";
import { INK, BG, SLATE, FONT_SANS } from "@/lib/theme";

export const metadata = {
  title: "About this assessment — Career Compass",
};

export default function MethodologyPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "48px 24px" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: SLATE,
            fontSize: 14,
            marginBottom: 28,
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={15} /> Back
        </Link>
        <h1 style={{ fontFamily: FONT_SANS, fontSize: 26, color: INK, marginBottom: 20 }}>
          About this assessment
        </h1>
        <MethodologyContent />
      </div>
    </div>
  );
}
