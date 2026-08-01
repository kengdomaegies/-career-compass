"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Search, AlertTriangle, Download, History } from "lucide-react";
import { deleteReportAction, logoutAction, regenerateNarrativeAction } from "@/app/admin/actions";
import { AREAS, STYLE_DIMENSIONS } from "@/lib/scoring";
import { INK, SLATE, CLAY, GREEN, LINE, CARD, FONT_SANS } from "@/lib/theme";
import QuizAccessSettings from "@/components/QuizAccessSettings";
import InviteManager from "@/components/InviteManager";
import InsightsSummary from "@/components/InsightsSummary";
import ClientHistory from "@/components/ClientHistory";
import AdminPasswordSettings from "@/components/AdminPasswordSettings";

const TABS = [
  { id: "reports", label: "Clients & Reports" },
  { id: "access", label: "Access & Security" },
];

function topAreaOf(interestScores) {
  if (!interestScores) return "—";
  return AREAS.slice().sort((a, b) => interestScores[b.key] - interestScores[a.key])[0].key;
}

function emailKey(clientEmail) {
  return (clientEmail || "").trim().toLowerCase();
}

function csvEscape(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function reportsToCsv(reports) {
  const headers = [
    "Name",
    "Email",
    "Date",
    "Top area",
    "Profile type",
    ...AREAS.map((a) => a.key),
    ...STYLE_DIMENSIONS.map((d) => `${d.poleA} vs ${d.poleB}`),
    "Error",
  ];
  const rows = reports.map((r) => [
    r.clientName || "",
    r.clientEmail || "",
    new Date(r.createdAt).toLocaleDateString(),
    r.interestScores ? topAreaOf(r.interestScores) : "",
    r.aiContent?.typeName || "",
    ...AREAS.map((a) => r.interestScores?.[a.key] ?? ""),
    ...STYLE_DIMENSIONS.map((d) => r.styleScores?.[d.key] ?? ""),
    r.error || "",
  ]);
  return [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
}

function downloadCsv(reports) {
  const csv = reportsToCsv(reports);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `career-compass-reports-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminDashboard({ reports, quizPasscodeConfig, invites, isCustomAdminPasscode }) {
  const router = useRouter();
  const [tab, setTab] = useState("reports");
  const [items, setItems] = useState(reports);
  const [pendingId, setPendingId] = useState(null);
  const [pendingAction, setPendingAction] = useState(null); // "delete" | "regenerate"
  const [search, setSearch] = useState("");
  const [expandedEmail, setExpandedEmail] = useState(null);
  const [, startTransition] = useTransition();

  const filteredItems = items.filter((r) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (r.clientName || "").toLowerCase().includes(q) || (r.clientEmail || "").toLowerCase().includes(q);
  });

  const errorCount = items.filter((r) => r.error).length;

  // Group by email so repeat clients (retaking the assessment) can be
  // compared over time — only meaningful when an email was given.
  const groupsByEmail = {};
  items.forEach((r) => {
    const key = emailKey(r.clientEmail);
    if (!key) return;
    (groupsByEmail[key] ||= []).push(r);
  });

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

      {errorCount > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(168,85,63,0.08)",
            border: `1px solid ${CLAY}`,
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 20,
            fontSize: 13,
            color: INK,
          }}
        >
          <AlertTriangle size={16} color={CLAY} style={{ flexShrink: 0 }} />
          <span>
            {errorCount} report{errorCount === 1 ? "" : "s"} need attention — narrative generation failed.
            {tab !== "reports" ? (
              <>
                {" "}
                <button
                  onClick={() => setTab("reports")}
                  style={{ background: "none", border: "none", color: CLAY, textDecoration: "underline", cursor: "pointer", fontSize: 13, padding: 0 }}
                >
                  View in Clients &amp; Reports
                </button>
                .
              </>
            ) : (
              <> Find {errorCount === 1 ? "it" : "them"} below and click Regenerate.</>
            )}
          </span>
        </div>
      )}

      <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: `1px solid ${LINE}` }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "10px 16px",
              fontSize: 14,
              fontWeight: 600,
              background: "none",
              border: "none",
              borderBottom: tab === t.id ? `2px solid ${GREEN}` : "2px solid transparent",
              color: tab === t.id ? INK : SLATE,
              cursor: "pointer",
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "access" && (
        <>
          <QuizAccessSettings initialConfig={quizPasscodeConfig} />
          <InviteManager initialInvites={invites} />
          <AdminPasswordSettings initialIsCustom={isCustomAdminPasscode} />
        </>
      )}

      {tab === "reports" && (
        <>
          <InsightsSummary reports={reports} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
            <h2 style={{ fontFamily: FONT_SANS, fontSize: 22, color: INK }}>Past reports</h2>
            <button
              onClick={() => downloadCsv(filteredItems)}
              disabled={filteredItems.length === 0}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "none",
                border: `1px solid ${LINE}`,
                borderRadius: 6,
                padding: "6px 12px",
                fontSize: 12.5,
                color: filteredItems.length === 0 ? "#9CA3AF" : INK,
                cursor: filteredItems.length === 0 ? "default" : "pointer",
              }}
            >
              <Download size={13} /> Export CSV
            </button>
          </div>
          <p style={{ fontSize: 13, color: SLATE, marginBottom: 16 }}>
            Every report generated in this app, stored so you can revisit them.
          </p>
          <div style={{ position: "relative", marginBottom: 20 }}>
            <Search size={15} color={SLATE} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
              style={{
                width: "100%",
                padding: "10px 14px 10px 36px",
                fontSize: 14,
                border: `1px solid ${LINE}`,
                borderRadius: 8,
                fontFamily: "inherit",
                boxSizing: "border-box",
                background: CARD,
              }}
            />
          </div>
          {items.length === 0 && <p style={{ color: SLATE, fontSize: 14 }}>No reports saved yet.</p>}
          {items.length > 0 && filteredItems.length === 0 && (
            <p style={{ color: SLATE, fontSize: 14 }}>No reports match "{search}".</p>
          )}
          {filteredItems.map((r) => {
            const busy = pendingId === r.id;
            const key = emailKey(r.clientEmail);
            const group = key ? groupsByEmail[key] : null;
            const isRepeat = group && group.length > 1;
            const historyOpen = isRepeat && expandedEmail === key;
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
                    <div style={{ fontSize: 15, fontWeight: 700, color: INK }}>
                      {r.clientName || "Unnamed"}
                      {isRepeat && (
                        <span style={{ fontSize: 11, fontWeight: 500, color: SLATE, marginLeft: 8 }}>
                          ({group.length} assessments)
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12.5, color: SLATE, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {r.clientEmail || "no email"} · {new Date(r.createdAt).toLocaleDateString()} · Top area:{" "}
                      {topAreaOf(r.interestScores)}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    {isRepeat && (
                      <button
                        onClick={() => setExpandedEmail(historyOpen ? null : key)}
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
                        <History size={12} /> {historyOpen ? "Hide history" : "History"}
                      </button>
                    )}
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
                {historyOpen && <ClientHistory reports={group} />}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
