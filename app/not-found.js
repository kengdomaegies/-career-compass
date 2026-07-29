import Link from "next/link";
import { INK, BG, SLATE, GREEN } from "@/lib/theme";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div style={{ textAlign: "center", padding: 24 }}>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 24, color: INK, marginBottom: 8 }}>
          Report not found
        </h1>
        <p style={{ color: SLATE, fontSize: 14, marginBottom: 20 }}>
          This link may be mistyped, or the report no longer exists.
        </p>
        <Link href="/" style={{ color: GREEN, fontSize: 14, fontWeight: 600 }}>
          Take the assessment
        </Link>
      </div>
    </div>
  );
}
