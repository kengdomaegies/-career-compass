"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { verifyQuizPasscodeAction } from "@/app/actions";
import Logo from "@/components/Logo";
import { INK, GREEN, SLATE, CLAY, LINE, FONT_SANS } from "@/lib/theme";

export default function QuizPasscodeGate() {
  const router = useRouter();
  const [passInput, setPassInput] = useState("");
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  async function unlock() {
    if (!passInput) return;
    setPending(true);
    const result = await verifyQuizPasscodeAction(passInput);
    setPending(false);
    if (result.ok) {
      router.refresh();
    } else {
      setError(result.error || "That's not the right passcode.");
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: "64px 24px", textAlign: "center" }}>
      <Logo height={64} />
      <Lock size={24} color={GREEN} style={{ marginTop: 24 }} />
      <h2 style={{ fontFamily: FONT_SANS, fontSize: 20, color: INK, margin: "16px 0 8px" }}>
        This assessment is private
      </h2>
      <p style={{ fontSize: 13, color: SLATE, marginBottom: 20, lineHeight: 1.6 }}>
        Enter the passcode your coach gave you to begin.
      </p>
      <input
        type="password"
        value={passInput}
        onChange={(e) => {
          setPassInput(e.target.value);
          setError(null);
        }}
        onKeyDown={(e) => e.key === "Enter" && unlock()}
        placeholder="Passcode"
        style={{
          width: "100%",
          padding: "10px 14px",
          border: `1px solid ${error ? CLAY : LINE}`,
          borderRadius: 8,
          marginBottom: 8,
          fontFamily: "inherit",
          boxSizing: "border-box",
        }}
      />
      {error && <p style={{ color: CLAY, fontSize: 12.5, marginBottom: 12 }}>{error}</p>}
      <button
        onClick={unlock}
        disabled={pending || !passInput}
        style={{
          background: GREEN,
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "10px 22px",
          fontSize: 14,
          fontWeight: 600,
          cursor: pending ? "default" : "pointer",
          marginTop: 8,
          opacity: pending ? 0.7 : 1,
        }}
      >
        {pending ? "Checking…" : "Enter"}
      </button>
    </div>
  );
}
