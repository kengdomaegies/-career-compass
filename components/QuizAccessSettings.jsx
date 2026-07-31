"use client";

import { useState } from "react";
import { Lock, Unlock } from "lucide-react";
import { setQuizPasscodeAction } from "@/app/admin/actions";
import { INK, SLATE, GREEN, GREEN_DARK, CLAY, CARD, LINE, FONT_SANS } from "@/lib/theme";

export default function QuizAccessSettings({ initialPasscode }) {
  const [current, setCurrent] = useState(initialPasscode || null);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState(null);

  async function save(newValue) {
    setPending(true);
    setMessage(null);
    try {
      const result = await setQuizPasscodeAction(newValue);
      if (result.ok) {
        setCurrent(result.passcode);
        setInput("");
        setMessage(result.passcode ? "Passcode updated." : "Passcode removed — the assessment is now open to anyone with the link.");
      } else {
        setMessage(result.error || "Something went wrong.");
      }
    } catch (e) {
      setMessage(e?.message || "Something went wrong — try reloading the page.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section
      style={{
        background: CARD,
        border: `1px solid ${LINE}`,
        borderRadius: 10,
        padding: "18px 20px",
        marginBottom: 32,
      }}
    >
      <h3 style={{ fontFamily: FONT_SANS, fontSize: 15, color: INK, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
        {current ? <Lock size={16} color={GREEN} /> : <Unlock size={16} color={SLATE} />}
        Assessment access
      </h3>
      <p style={{ fontSize: 12.5, color: SLATE, marginBottom: 12, lineHeight: 1.6 }}>
        {current ? (
          <>
            Anyone taking the assessment needs this passcode first:{" "}
            <strong style={{ color: INK, fontFamily: "monospace" }}>{current}</strong> — share it only with
            your clients.
          </>
        ) : (
          "No passcode set — the assessment is open to anyone with the link."
        )}
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={current ? "New passcode" : "Set a passcode"}
          style={{
            flex: 1,
            padding: "10px 14px",
            fontSize: 14,
            border: `1px solid ${LINE}`,
            borderRadius: 8,
            fontFamily: "inherit",
            boxSizing: "border-box",
          }}
        />
        <button
          onClick={() => save(input)}
          disabled={pending || !input.trim()}
          style={{
            background: input.trim() ? GREEN : LINE,
            color: input.trim() ? "#fff" : "#9CA3AF",
            border: "none",
            borderRadius: 8,
            padding: "10px 18px",
            fontSize: 14,
            fontWeight: 600,
            cursor: pending || !input.trim() ? "default" : "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {current ? "Change" : "Set passcode"}
        </button>
        {current && (
          <button
            onClick={() => save("")}
            disabled={pending}
            style={{
              background: "none",
              color: CLAY,
              border: `1px solid ${LINE}`,
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 13,
              cursor: pending ? "default" : "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Remove
          </button>
        )}
      </div>
      {message && <p style={{ fontSize: 12, color: GREEN_DARK, marginTop: 8 }}>{message}</p>}
    </section>
  );
}
