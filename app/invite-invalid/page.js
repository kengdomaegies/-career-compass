import Link from "next/link";
import Logo from "@/components/Logo";
import { INK, BG, SLATE, GREEN, FONT_SANS } from "@/lib/theme";

export const metadata = { title: "Invite link invalid — Career Compass" };

export default function InviteInvalidPage() {
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
      <div style={{ textAlign: "center", padding: 24, maxWidth: 420 }}>
        <Logo height={56} />
        <h1 style={{ fontFamily: FONT_SANS, fontSize: 22, color: INK, margin: "20px 0 8px" }}>
          This invite link isn't valid
        </h1>
        <p style={{ color: SLATE, fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
          It may have expired or been revoked. Ask your coach for a new link.
        </p>
        <Link href="/" style={{ color: GREEN, fontSize: 14, fontWeight: 600 }}>
          Go to the assessment
        </Link>
      </div>
    </div>
  );
}
