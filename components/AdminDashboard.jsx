"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { deleteReportAction, logoutAction, regenerateNarrativeAction } from "@/app/admin/actions";
import { AREAS } from "@/lib/scoring";
import { INK, SLATE, CLAY, GREEN, LINE, FONT_SANS } from "@/lib/theme";
import QuizAccessSettings from "@/components/QuizAccessSettings";
import InviteManager from "@/components/InviteManager";

function topAreaOf(interestScores) {
  if (!interestScores) return "—";
  return AREAS.slice().sort((a, b) => interestScores[b.key] - interestScores[a.key])[0].key;
}

export default function AdminDashboard({ reports, quizPasscodeConfig, invites }) {
  const router = useRouter();
  const [items, setItems] = useState(reports);
  const [pendingId, setPendingId] = useState(null);
  const [pendingAction, setPendingAction] = useState(null); // "delete" | "regenerate"
  const [, startTransition] = useTransition();

  async function handleDelete(id) {
    if (!confirm("Delete this report? This can't be undone.")) return;
    setPendingId(id);
    setPendingAction("delete");
    try {
      const result = await deleteReportAction(id);
      if (result?.ok === false) {
        alert(result.error || "Delete failed.");
      } else {
        setItems((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (e) {
      alert(e?.message || "Delete failed — try reloading the page.");
    } finally {
      setPendingId(null);
      setPendingAction(null);
    }
  }

  async function handleRegenerate(id) {
    setPendingId(id);
    setPendingAction("regenerate");
    try {
      const result = await regenerateNarrativeAction(id);
      setItems((prev) => prev.map((r) => (r.id === id ? { ...r, error: result.ok ? null : result.error } : r)));
    } catch (e) {
      const error = e?.message || "Regenerate failed — try reloading the page.";
      setItems((prev) => prev.map((r) => (r.id === id ? { ...r, error } : r)));
    } finally {
      setPendingId(null);
      setPendingAction(null);
    }
  }

  function handleLogout() {
    startTransition(async () => {
      await logoutAction();
      router.refresh();
    });
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", gap: 6, color: SLATE, fontSize: 14, textDecoration: "none" }}
        >
          <ArrowLeft size={15} /> Back
        </Link>
        <button
          onClick={handleLogout}
          style={{ background: "none", border: "none", color: SLATE, fontSize: 13, cursor: "pointer" }}
        >
          Log out
        </button>
      </div>
      <QuizAccessSettings initialConfig={quizPasscodeConfig} />
      <InviteManager initialInvites={invites} />
      <h2 style={{ fontFamily: FONT_SANS, fontSize: 22, color: INK, marginBottom: 6 }}>Past reports</h2>
      <p style={{ fontSize: 13, color: SLATE, marginBottom: 24 }}>
        Every report generated in this app, stored so you can revisit them.
      </p>
      {items.length === 0 && <p style={{ color: SLATE, fontSize: 14 }}>No reports saved yet.</p>}
      {items.map((r) => {
        const busy = pendingId === r.id;
        return (
          <div
            key={r.id}
            style={{
              padding: "14px 0",
              borderBottom: `1px solid ${LINE}`,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: INK }}>{r.clientName || "Unnamed"}</div>
                <div style={{ fontSize: 12.5, color: SLATE, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {r.clientEmail || "no email"} · {new Date(r.createdAt).toLocaleDateString()} · Top area:{" "}
                  {topAreaOf(r.interestScores)}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                {r.error && (
                  <button
                    onClick={() => handleRegenerate(r.id)}
                    disabled={busy}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      background: "none",
                      border: `1px solid ${GREEN}`,
                      borderRadius: 6,
                      padding: "6px 12px",
                      fontSize: 12.5,
                      color: GREEN,
                      cursor: busy ? "default" : "pointer",
                    }}
                  >
                    <RefreshCw size={12} />
                    {busy && pendingAction === "regenerate" ? "Regenerating…" : "Regenerate"}
                  </button>
                )}
                <Link
                  href={`/r/${r.id}?from=admin`}
                  style={{
                    background: "none",
                    border: `1px solid ${LINE}`,
                    borderRadius: 6,
                    padding: "6px 12px",
                    fontSize: 12.5,
                    color: INK,
                    textDecoration: "none",
                  }}
                >
                  View
                </Link>
                <button
                  onClick={() => handleDelete(r.id)}
                  disabled={busy}
                  style={{
                    background: "none",
                    border: `1px solid ${LINE}`,
                    borderRadius: 6,
                    padding: "6px 12px",
                    fontSize: 12.5,
                    color: CLAY,
                    cursor: busy ? "default" : "pointer",
                  }}
                >
                  {busy && pendingAction === "delete" ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
            {r.error && (
              <div style={{ fontSize: 12, color: CLAY, marginTop: 6 }}>
                Narrative failed: {r.error}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
