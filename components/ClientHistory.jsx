"use client";

import { AREAS, STYLE_DIMENSIONS } from "@/lib/scoring";
import { INK, SLATE, GREEN, CLAY, LINE } from "@/lib/theme";

function DeltaCell({ value, delta }) {
  return (
    <td style={{ padding: "5px 8px", textAlign: "center", color: INK, whiteSpace: "nowrap" }}>
      {value}
      {delta ? (
        <span style={{ color: delta > 0 ? GREEN : CLAY, fontSize: 10, marginLeft: 3 }}>
          {delta > 0 ? "+" : ""}
          {delta}
        </span>
      ) : null}
    </td>
  );
}

export default function ClientHistory({ reports }) {
  const sorted = [...reports].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <div style={{ overflowX: "auto", marginTop: 10, marginBottom: 2 }}>
      <table style={{ borderCollapse: "collapse", fontSize: 12, width: "100%" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "5px 8px", color: SLATE, fontWeight: 600 }}>Date</th>
            {AREAS.map((a) => (
              <th key={a.key} style={{ padding: "5px 8px", color: SLATE, fontWeight: 600 }}>
                {a.key}
              </th>
            ))}
            {STYLE_DIMENSIONS.map((d) => (
              <th
                key={d.key}
                style={{ padding: "5px 8px", color: SLATE, fontWeight: 600 }}
                title={`${d.poleA} (100) vs ${d.poleB} (0)`}
              >
                {d.poleA.slice(0, 4)}/{d.poleB.slice(0, 4)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => {
            const prev = i > 0 ? sorted[i - 1] : null;
            return (
              <tr key={r.id} style={{ borderTop: `1px solid ${LINE}` }}>
                <td style={{ padding: "5px 8px", color: INK, whiteSpace: "nowrap" }}>
                  {new Date(r.createdAt).toLocaleDateString()}
                </td>
                {AREAS.map((a) => {
                  const val = r.interestScores?.[a.key];
                  const prevVal = prev?.interestScores?.[a.key];
                  const delta = prev && val != null && prevVal != null ? val - prevVal : null;
                  return <DeltaCell key={a.key} value={val ?? "—"} delta={delta} />;
                })}
                {STYLE_DIMENSIONS.map((d) => {
                  const val = r.styleScores?.[d.key];
                  const prevVal = prev?.styleScores?.[d.key];
                  const delta = prev && val != null && prevVal != null ? val - prevVal : null;
                  return <DeltaCell key={d.key} value={val ?? "—"} delta={delta} />;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
