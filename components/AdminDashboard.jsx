"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { deleteReportAction, logoutAction } from "@/app/admin/actions";
import { AREAS } from "@/lib/scoring";
import { INK, SLATE, CLAY, LINE, FONT_SANS } from "@/lib/theme";

function topAreaOf(interestScores) {
  if (!interestScores) return "—";
  return AREAS.slice().sort((a, b) => interestScores[b.key] - interestScores[a.key])[0].key;
}

export default function AdminDashboard({ reports }) {
  const router = useRouter();
  const [items, setItems] = useState(reports);
  const [pendingId, setPendingId] = useState(null);
  const [, startTransition] = useTransition();

  async function handleDelete(id) {
    if (!confirm("Delete this report? This can't be undone.")) return;
    setPendingId(id);
    await deleteReportAction(id);
    setItems((prev) => prev.filter((r) => r.id !== id));
    setPendingId(null);
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
      <h2 style={{ fontFamily: FONT_SANS, fontSize: 22, color: INK, marginBottom: 6 }}>Past reports</h2>
      <p style={{ fontSize: 13, color: SLATE, marginBottom: 24 }}>
        Every report generated in this app, stored so you can revisit them.
      </p>
      {items.length === 0 && <p style={{ color: SLATE, fontSize: 14 }}>No reports saved yet.</p>}
      {items.map((r) => (
        <div
          key={r.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 0",
            borderBottom: `1px solid ${LINE}`,
            gap: 12,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: INK }}>{r.clientName || "Unnamed"}</div>
            <div style={{ fontSize: 12.5, color: SLATE, overflow: "hidden", textOverflow: "ellipsis" }}>
              {r.clientEmail || "no email"} · {new Date(r.createdAt).toLocaleDateString()} · Top area:{" "}
              {topAreaOf(r.interestScores)}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
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
              disabled={pendingId === r.id}
              style={{
                background: "none",
                border: `1px solid ${LINE}`,
                borderRadius: 6,
                padding: "6px 12px",
                fontSize: 12.5,
                color: CLAY,
                cursor: pendingId === r.id ? "default" : "pointer",
              }}
            >
              {pendingId === r.id ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
