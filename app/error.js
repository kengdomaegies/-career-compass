"use client";

import { INK, BG, SLATE, GREEN, FONT_SANS } from "@/lib/theme";

export default function GlobalError({ error, reset }) {
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
      <div style={{ textAlign: "center", padding: 24, maxWidth: 440 }}>
        <h1 style={{ fontFamily: FONT_SANS, fontSize: 22, color: INK, marginBottom: 8 }}>
          Something went wrong
        </h1>
        <p style={{ color: SLATE, fontSize: 14, marginBottom: 4, lineHeight: 1.6 }}>
          This page hit an unexpected error loading its data — often a temporary hiccup (like the
          database waking up from idle) rather than something broken.
        </p>
        {error?.message && (
          <p style={{ color: SLATE, fontSize: 12, marginBottom: 20, fontFamily: "monospace" }}>
            {error.message}
          </p>
        )}
        <button
          onClick={() => reset()}
          style={{
            background: GREEN,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 22px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
