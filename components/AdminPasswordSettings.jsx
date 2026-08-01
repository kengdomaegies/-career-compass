"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { changeAdminPasscodeAction, resetAdminPasscodeAction } from "@/app/admin/actions";
import { INK, SLATE, GREEN, GREEN_DARK, CLAY, CARD, LINE, FONT_SANS } from "@/lib/theme";

export default function AdminPasswordSettings({ initialIsCustom }) {
  const [custom, setCustom] = useState(!!initialIsCustom);
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState(null);

  async function save() {
    setPending(true);
    setMessage(null);
    try {
      const result = await changeAdminPasscodeAction(newPass, confirmPass);
      if (result.ok) {
        setCustom(true);
        setNewPass("");
        setConfirmPass("");
        setMessage("Admin passcode updated — use it next time you log in.");
      } else {
        setMessage(result.error || "Something went wrong.");
      }
    } catch (e) {
      setMessage(e?.message || "Something went wrong — try reloading the page.");
    } finally {
      setPending(false);
    }
  }

  async function reset() {
    if (
      !confirm(
        "Reset to the ADMIN_PASSCODE environment variable? Your custom passcode will stop working immediately."
      )
    )
      return;
    setPending(true);
    setMessage(null);
    try {
      const result = await resetAdminPasscodeAction();
      if (result.ok) {
        setCustom(false);
        setMessage("Reset — your ADMIN_PASSCODE environment variable is active again.");
      } else {
        setMessage(result.error || "Something went wrong.");
      }
    } catch (e) {
      setMessage(e?.message || "Something went wrong — try reloading the page.");
    } finally {
      setPending(false);
    }
  }

  const canSave = newPass.length >= 6 && confirmPass.length >= 6 && !pending;

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
      <h3
        style={{
          fontFamily: FONT_SANS,
          fontSize: 15,
          color: INK,
          marginBottom: 4,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <KeyRound size={16} color={GREEN} /> Admin login passcode
      </h3>
      <p style={{ fontSize: 12.5, color: SLATE, marginBottom: 12, lineHeight: 1.6 }}>
        {custom
          ? "You're using a custom passcode set here — the ADMIN_PASSCODE environment variable no longer works."
          : "Currently using the ADMIN_PASSCODE environment variable. Set a custom one below to change it without redeploying."}
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        <input
          type="password"
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
          placeholder="New passcode (min 6 characters)"
          style={{
            flex: 1,
            minWidth: 160,
            padding: "10px 14px",
            fontSize: 14,
            border: `1px solid ${LINE}`,
            borderRadius: 8,
            fontFamily: "inherit",
            boxSizing: "border-box",
          }}
        />
        <input
          type="password"
          value={confirmPass}
          onChange={(e) => setConfirmPass(e.target.value)}
          placeholder="Confirm new passcode"
          style={{
            flex: 1,
            minWidth: 160,
            padding: "10px 14px",
            fontSize: 14,
            border: `1px solid ${LINE}`,
            borderRadius: 8,
            fontFamily: "inherit",
            boxSizing: "border-box",
          }}
        />
        <button
          onClick={save}
          disabled={!canSave}
          style={{
            background: canSave ? GREEN : LINE,
            color: canSave ? "#fff" : "#9CA3AF",
            border: "none",
            borderRadius: 8,
            padding: "10px 18px",
            fontSize: 14,
            fontWeight: 600,
            cursor: canSave ? "pointer" : "default",
            whiteSpace: "nowrap",
          }}
        >
          Save
        </button>
      </div>
      {custom && (
        <button
          onClick={reset}
          disabled={pending}
          style={{
            background: "none",
            color: CLAY,
            border: `1px solid ${LINE}`,
            borderRadius: 8,
            padding: "8px 14px",
            fontSize: 12.5,
            cursor: pending ? "default" : "pointer",
          }}
        >
          Reset to environment default
        </button>
      )}
      {message && <p style={{ fontSize: 12, color: GREEN_DARK, marginTop: 8 }}>{message}</p>}
    </section>
  );
}
