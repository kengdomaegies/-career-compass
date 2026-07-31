"use client";

import { BarChart3 } from "lucide-react";
import { AREAS, STYLE_DIMENSIONS } from "@/lib/scoring";
import { INK, SLATE, GREEN, LINE, CARD, FONT_SANS } from "@/lib/theme";

function topAreaOf(interestScores) {
  return AREAS.slice().sort((a, b) => interestScores[b.key] - interestScores[a.key])[0].key;
}

export default function InsightsSummary({ reports }) {
  const withScores = reports.filter((r) => r.interestScores);
  if (withScores.length === 0) return null;

  const areaCounts = {};
  AREAS.forEach((a) => (areaCounts[a.key] = 0));
  withScores.forEach((r) => {
    areaCounts[topAreaOf(r.interestScores)] += 1;
  });
  const maxCount = Math.max(1, ...Object.values(areaCounts));
  const rankedAreas = AREAS.slice().sort((a, b) => areaCounts[b.key] - areaCounts[a.key]);

  const withStyle = reports.filter((r) => r.styleScores);
  const avgStyle = {};
  STYLE_DIMENSIONS.forEach((d) => {
    avgStyle[d.key] = withStyle.length
      ? Math.round(withStyle.reduce((sum, r) => sum + (r.styleScores[d.key] || 0), 0) / withStyle.length)
      : 50;
  });

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
      <h3 style={{ fontFamily: FONT_SANS, fontSize: 15, color: INK, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
        <BarChart3 size={16} color={GREEN} /> Across all {withScores.length} client{withScores.length === 1 ? "" : "s"}
      </h3>

      <div style={{ fontSize: 12.5, color: SLATE, marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        Most common top interest area
      </div>
      <div style={{ marginBottom: 20 }}>
        {rankedAreas.map((a) => (
          <div key={a.key} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: INK, width: 90, flexShrink: 0 }}>{a.key}</span>
            <div style={{ flex: 1, background: LINE, height: 8, borderRadius: 4, overflow: "hidden" }}>
              <div
                style={{
                  width: `${(areaCounts[a.key] / maxCount) * 100}%`,
                  height: "100%",
                  background: GREEN,
                  borderRadius: 4,
                }}
              />
            </div>
            <span style={{ fontSize: 12, color: SLATE, width: 20, textAlign: "right", flexShrink: 0 }}>
              {areaCounts[a.key]}
            </span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 12.5, color: SLATE, marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        Average work-style lean
      </div>
      {STYLE_DIMENSIONS.map((d) => (
        <div key={d.key} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: INK, marginBottom: 3 }}>
            <span>{d.poleA}</span>
            <span>{d.poleB}</span>
          </div>
          <div style={{ position: "relative", height: 6, background: LINE, borderRadius: 3 }}>
            <div
              style={{
                position: "absolute",
                left: `calc(${100 - avgStyle[d.key]}% - 5px)`,
                top: -2,
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: GREEN,
                border: `1.5px solid ${CARD}`,
              }}
            />
          </div>
        </div>
      ))}
    </section>
  );
}
