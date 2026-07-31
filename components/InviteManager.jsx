"use client";

import { useState } from "react";
import { Link2, Copy, Check } from "lucide-react";
import { createInviteAction, revokeInviteAction, deleteInviteAction } from "@/app/admin/actions";
import { INK, SLATE, GREEN, CLAY, CARD, LINE, FONT_SANS } from "@/lib/theme";

function inviteStatus(invite) {
  if (invite.revokedAt) return { label: "Revoked", color: CLAY };
  if (invite.expiresAt && new Date(invite.expiresAt) <= new Date()) return { label: "Expired", color: CLAY };
  return { label: "Active", color: GREEN };
}

function inviteUrl(id) {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/start/${id}`;
}

function CopyLinkButton({ id }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(inviteUrl(id));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API can fail (permissions, insecure context) — no harm, just don't flip state
    }
  }

  return (
    <button
      onClick={copy}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        background: "none",
        border: `1px solid ${LINE}`,
        borderRadius: 6,
        padding: "6px 12px",
        fontSize: 12.5,
        color: INK,
        cursor: "pointer",
      }}
    >
      {copied ? <Check size={12} color={GREEN} /> : <Copy size={12} />}
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}

export default function InviteManager({ initialInvites }) {
  const [invites, setInvites] = useState(initialInvites || []);
  const [label, setLabel] = useState("");
  const [email, setEmail] = useState("");
  const [days, setDays] = useState("");
  const [creating, setCreating] = useState(false);
  const [pendingId, setPendingId] = useState(null);
  const [error, setError] = useState(null);

  async function handleCreate() {
    setCreating(true);
    setError(null);
    try {
      const result = await createInviteAction({ label, clientEmail: email, expiresInDays: days });
      if (result.ok) {
        setInvites((prev) => [result.invite, ...prev]);
        setLabel("");
        setEmail("");
        setDays("");
      } else {
        setError(result.error || "Couldn't create the invite.");
      }
    } catch (e) {
      setError(e?.message || "Couldn't create the invite.");
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id) {
    setPendingId(id);
    try {
      const result = await revokeInviteAction(id);
      if (result.ok) {
        setInvites((prev) => prev.map((i) => (i.id === id ? { ...i, revokedAt: new Date().toISOString() } : i)));
      } else {
        alert(result.error || "Couldn't revoke the invite.");
      }
    } catch (e) {
      alert(e?.message || "Couldn't revoke the invite.");
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this invite? This can't be undone.")) return;
    setPendingId(id);
    try {
      const result = await deleteInviteAction(id);
      if (result.ok) {
        setInvites((prev) => prev.filter((i) => i.id !== id));
      } else {
        alert(result.error || "Couldn't delete the invite.");
      }
    } catch (e) {
      alert(e?.message || "Couldn't delete the invite.");
    } finally {
      setPendingId(null);
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
        <Link2 size={16} color={GREEN} /> Invite links
      </h3>
      <p style={{ fontSize: 12.5, color: SLATE, marginBottom: 12, lineHeight: 1.6 }}>
        Give each client their own link instead of a shared passcode — no secret to leak, and you can see who
        used it or revoke it individually.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Client name (optional)"
          style={{ flex: 1, minWidth: 140, padding: "10px 14px", fontSize: 14, border: `1px solid ${LINE}`, borderRadius: 8, fontFamily: "inherit", boxSizing: "border-box" }}
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Client email (optional)"
          style={{ flex: 1, minWidth: 160, padding: "10px 14px", fontSize: 14, border: `1px solid ${LINE}`, borderRadius: 8, fontFamily: "inherit", boxSizing: "border-box" }}
        />
        <input
          type="number"
          min="1"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          placeholder="Expires in N days (blank = never)"
          style={{ width: 200, padding: "10px 14px", fontSize: 14, border: `1px solid ${LINE}`, borderRadius: 8, fontFamily: "inherit", boxSizing: "border-box" }}
        />
        <button
          onClick={handleCreate}
          disabled={creating}
          style={{
            background: GREEN,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 18px",
            fontSize: 14,
            fontWeight: 600,
            cursor: creating ? "default" : "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {creating ? "Creating…" : "Create invite"}
        </button>
      </div>
      {error && <p style={{ fontSize: 12, color: CLAY, marginBottom: 8 }}>{error}</p>}

      {invites.length === 0 ? (
        <p style={{ fontSize: 13, color: SLATE, marginTop: 12 }}>No invite links yet.</p>
      ) : (
        <div style={{ marginTop: 12 }}>
          {invites.map((invite) => {
            const status = inviteStatus(invite);
            const busy = pendingId === invite.id;
            return (
              <div key={invite.id} style={{ padding: "12px 0", borderTop: `1px solid ${LINE}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: INK }}>
                      {invite.label || invite.clientEmail || "Unlabeled invite"}{" "}
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: status.color }}>· {status.label}</span>
                    </div>
                    <div style={{ fontSize: 12, color: SLATE }}>
                      {invite.clientEmail && invite.label ? `${invite.clientEmail} · ` : ""}
                      {invite.expiresAt
                        ? `expires ${new Date(invite.expiresAt).toLocaleDateString()}`
                        : "never expires"}{" "}
                      · used {invite.usedCount} time{invite.usedCount === 1 ? "" : "s"}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    {status.label === "Active" && <CopyLinkButton id={invite.id} />}
                    {status.label === "Active" && (
                      <button
                        onClick={() => handleRevoke(invite.id)}
                        disabled={busy}
                        style={{ background: "none", border: `1px solid ${LINE}`, borderRadius: 6, padding: "6px 12px", fontSize: 12.5, color: CLAY, cursor: busy ? "default" : "pointer" }}
                      >
                        {busy ? "…" : "Revoke"}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(invite.id)}
                      disabled={busy}
                      style={{ background: "none", border: `1px solid ${LINE}`, borderRadius: 6, padding: "6px 12px", fontSize: 12.5, color: SLATE, cursor: busy ? "default" : "pointer" }}
                    >
                      {busy ? "…" : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
