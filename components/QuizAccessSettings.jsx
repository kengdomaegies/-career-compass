"use client";

import { useState } from "react";
import { Lock, Unlock } from "lucide-react";
import { setQuizPasscodeAction } from "@/app/admin/actions";
import { INK, SLATE, GREEN, GREEN_DARK, CLAY, CARD, LINE, FONT_SANS } from "@/lib/theme";

function isExpired(expiresAt) {
  return !!expiresAt && new Date(expiresAt) <= new Date();
}

function formatExpiry(expiresAt) {
  if (!expiresAt) return "never expires";
  const date = new Date(expiresAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  return isExpired(expiresAt) ? `expired ${date}` : `expires ${date}`;
}

export default function QuizAccessSettings({ initialConfig }) {
  const [current, setCurrent] = useState(initialConfig || null);
  const [input, setInput] = useState("");
  const [days, setDays] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState(null);

  async function save(newValue, expiresInDays) {
    setPending(true);
    setMessage(null);
    try {
      const result = await setQuizPasscodeAction(newValue, expiresInDays);
      if (result.ok) {
        setCurrent(result.passcode ? { passcode: result.passcode, expiresAt: result.expiresAt } : null);
        setInput("");
        setDays("");
        setMessage(
          result.passcode ? "Passcode updated." : "Passcode removed — the assessment is now open to anyone with the link (unless invite links are active)."
        );
      } else {
        setMessage(result.error || "Something went wrong.");
      }
    } catch (e) {
      setMessage(e?.message || "Something went wrong — try reloading the page.");
    } finally {
      setPending(false);
    }
  }

  const active = current && !isExpired(current.expiresAt);

  return (
    <section
      style={{
        background: CARD,
        border: `1px solid ${LINE}`,
        borderRadius: 10,
        padding: "18px 20px",
        marginBottom: 24,
      }}
    >
      <h3 style={{ fontFamily: FONT_SANS, fontSize: 15, color: INK, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
        {active ? <Lock size={16} color={GREEN} /> : <Unlock size={16} color={SLATE} />}
        Shared passcode
      </h3>
      <p style={{ fontSize: 12.5, color: SLATE, marginBottom: 12, lineHeight: 1.6 }}>
        {current ? (
          <>
            {active ? "Anyone taking the assessment needs this passcode first: " : "This passcode has expired: "}
            <strong style={{ color: INK, fontFamily: "monospace" }}>{current.passcode}</strong> ({formatExpiry(current.expiresAt)})
            {active && " — share it only with your clients."}
          </>
        ) : (
          "No shared passcode set — use this for a simple one-code-for-everyone approach, or use invite links below for per-client control."
        )}
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={current ? "New passcode" : "Set a passcode"}
          style={{
            flex: 1,
            minWidth: 140,
            padding: "10px 14px",
            fontSize: 14,
            border: `1px solid ${LINE}`,
            borderRadius: 8,
            fontFamily: "inherit",
            boxSizing: "border-box",
          }}
        />
        <input
          type="number"
          min="1"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          placeholder="Expires in N days (blank = never)"
          style={{
            width: 200,
            padding: "10px 14px",
            fontSize: 14,
            border: `1px solid ${LINE}`,
            borderRadius: 8,
            fontFamily: "inherit",
            boxSizing: "border-box",
          }}
        />
        <button
          onClick={() => save(input, days)}
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
