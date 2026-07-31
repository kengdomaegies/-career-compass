"use client";

import Link from "next/link";
import { Printer, RotateCcw, AlertTriangle, ArrowLeft } from "lucide-react";
import { AREAS, STYLE_DIMENSIONS, computeBearing, polarPoint } from "@/lib/scoring";
import { INK, GREEN, GREEN_DARK, SAGE, CLAY, SLATE, CARD, LINE, FONT_SANS, FONT_DISPLAY } from "@/lib/theme";
import Logo from "@/components/Logo";
import MethodologyContent from "@/components/MethodologyContent";

function CompassRose({ scores }) {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 100;
  const { angle, magnitude } = computeBearing(scores);
  const needleLen = 30 + magnitude * 70;
  const needleTip = polarPoint(cx, cy, needleLen, angle);
  const needleTail = polarPoint(cx, cy, 18, angle + 180);

  const ringPoints = AREAS.map((a) => {
    const r = (scores[a.key] / 100) * maxR;
    return polarPoint(cx, cy, r, a.angle);
  });
  const ringPath =
    ringPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") + " Z";

  const top = AREAS.slice().sort((a, b) => scores[b.key] - scores[a.key])[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {[100, 66, 33].map((pct) => (
          <circle key={pct} cx={cx} cy={cy} r={(pct / 100) * maxR} fill="none" stroke={LINE} strokeWidth={1} />
        ))}
        {AREAS.map((a) => {
          const outer = polarPoint(cx, cy, maxR, a.angle);
          const labelPt = polarPoint(cx, cy, maxR + 30, a.angle);
          return (
            <g key={a.key}>
              <line x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke={LINE} strokeWidth={1} />
              <text
                x={labelPt.x}
                y={labelPt.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="11"
                fontFamily={FONT_SANS}
                fill={INK}
                fontWeight={a.key === top.key ? 700 : 400}
              >
                {a.key}
              </text>
            </g>
          );
        })}
        <path d={ringPath} fill={GREEN} fillOpacity={0.18} stroke={GREEN} strokeWidth={2} />
        <line
          x1={needleTail.x}
          y1={needleTail.y}
          x2={needleTip.x}
          y2={needleTip.y}
          stroke={CLAY}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={5} fill={INK} />
      </svg>
      <div style={{ textAlign: "center", marginTop: 4 }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 15, color: INK, fontWeight: 700 }}>
          Bearing: {top.key}
        </div>
        <div style={{ fontSize: 12, color: SLATE, maxWidth: 220, marginTop: 2 }}>
          {magnitude > 0.35
            ? "A clear, focused pull in one direction."
            : "Interests are spread fairly evenly across areas."}
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ label, value, top }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 14, fontWeight: top ? 700 : 500, color: INK }}>{label}</span>
        <span style={{ fontSize: 13, color: SLATE }}>{value}</span>
      </div>
      <div style={{ background: LINE, height: 8, borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: top ? GREEN : SAGE, borderRadius: 4 }} />
      </div>
    </div>
  );
}

function SpectrumBar({ poleA, poleB, value, aDesc, bDesc }) {
  const leaning = value >= 50 ? poleA : poleB;
  const leanDesc = value >= 50 ? aDesc : bDesc;
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, color: INK, marginBottom: 8 }}>
        <span>{poleA}</span>
        <span>{poleB}</span>
      </div>
      <div style={{ position: "relative", height: 8, background: LINE, borderRadius: 4, marginBottom: 8 }}>
        <div
          style={{
            position: "absolute",
            left: `calc(${100 - value}% - 8px)`,
            top: -5,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: GREEN,
            border: `2px solid ${CARD}`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
          }}
        />
      </div>
      <div style={{ fontSize: 12.5, color: SLATE, lineHeight: 1.5 }}>
        Leans <strong style={{ color: INK }}>{leaning}</strong> — {leanDesc}
      </div>
    </div>
  );
}

export default function ReportView({
  clientName,
  interestScores,
  styleScores,
  aiContent,
  error,
  createdAt,
  fromAdmin,
}) {
  const ranked = AREAS.slice().sort((a, b) => interestScores[b.key] - interestScores[a.key]);
  const top2 = ranked.slice(0, 2);

  return (
    <div>
      <div
        style={{ display: "flex", justifyContent: "flex-end", gap: 10, maxWidth: 720, margin: "0 auto", padding: "20px 24px 0" }}
        className="no-print"
      >
        <button
          onClick={() => window.print()}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: `1px solid ${LINE}`, borderRadius: 8, padding: "8px 14px", fontSize: 13, color: INK, cursor: "pointer" }}
        >
          <Printer size={14} /> Print / Save PDF
        </button>
        {fromAdmin ? (
          <Link
            href="/admin"
            style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: `1px solid ${LINE}`, borderRadius: 8, padding: "8px 14px", fontSize: 13, color: INK, textDecoration: "none" }}
          >
            <ArrowLeft size={14} /> Back to admin
          </Link>
        ) : (
          <Link
            href="/"
            style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: `1px solid ${LINE}`, borderRadius: 8, padding: "8px 14px", fontSize: 13, color: INK, textDecoration: "none" }}
          >
            <RotateCcw size={14} /> New assessment
          </Link>
        )}
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Logo height={56} />
          <div style={{ fontSize: 12, letterSpacing: "0.12em", color: SLATE, textTransform: "uppercase", marginTop: 18 }}>
            Career Compass Report
          </div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 28, color: INK, margin: "10px 0 4px" }}>
            {clientName || "Your Results"}
          </h1>
          <div style={{ fontSize: 13, color: SLATE }}>
            {new Date(createdAt || Date.now()).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 36 }}>
          <CompassRose scores={interestScores} />
        </div>

        {error && (
          <div
            style={{ display: "flex", gap: 10, background: "rgba(168,85,63,0.08)", border: `1px solid ${CLAY}`, borderRadius: 8, padding: "14px 16px", marginBottom: 28, fontSize: 13, color: INK }}
          >
            <AlertTriangle size={16} color={CLAY} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>
              The personalized narrative couldn't be generated ({error}). The scores below are still
              accurate.
            </span>
          </div>
        )}

        {aiContent?.typeName && (
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: FONT_SANS, fontSize: 21, color: GREEN_DARK, marginBottom: 8 }}>
              {aiContent.typeName}
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: INK }}>{aiContent.typeSummary}</p>
          </section>
        )}

        <section style={{ marginBottom: 32 }}>
          <h3 style={{ fontFamily: FONT_SANS, fontSize: 17, color: INK, marginBottom: 14 }}>
            Interest areas
          </h3>
          {ranked.map((a) => (
            <ScoreBar key={a.key} label={a.key} value={interestScores[a.key]} top={a.key === top2[0].key} />
          ))}
        </section>

        {aiContent?.topAreaNarrative && (
          <section style={{ marginBottom: 32 }}>
            <h3 style={{ fontFamily: FONT_SANS, fontSize: 17, color: INK, marginBottom: 8 }}>
              What "{top2[0].key}" means for you
            </h3>
            <p style={{ fontSize: 14.5, lineHeight: 1.7, color: INK }}>{aiContent.topAreaNarrative}</p>
          </section>
        )}

        <section style={{ marginBottom: 32 }}>
          <h3 style={{ fontFamily: FONT_SANS, fontSize: 17, color: INK, marginBottom: 4 }}>
            Personality &amp; work style
          </h3>
          <p style={{ fontSize: 13, color: SLATE, marginBottom: 18 }}>
            Where you tend to sit on four everyday spectrums. Most people lean, not live at the extremes.
          </p>
          {STYLE_DIMENSIONS.map((d) => (
            <SpectrumBar
              key={d.key}
              poleA={d.poleA}
              poleB={d.poleB}
              value={styleScores[d.key]}
              aDesc={d.aDesc}
              bDesc={d.bDesc}
            />
          ))}
        </section>

        {aiContent?.workStyleNarrative && (
          <section style={{ marginBottom: 32 }}>
            <h3 style={{ fontFamily: FONT_SANS, fontSize: 17, color: INK, marginBottom: 8 }}>
              How this shows up day to day
            </h3>
            <p style={{ fontSize: 14.5, lineHeight: 1.7, color: INK }}>{aiContent.workStyleNarrative}</p>
          </section>
        )}

        {(aiContent?.strengths?.length || aiContent?.challenges?.length) && (
          <section style={{ marginBottom: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <h3 style={{ fontFamily: FONT_SANS, fontSize: 16, color: SAGE, marginBottom: 10 }}>
                Strengths to lean on
              </h3>
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                {(aiContent.strengths || []).map((s, i) => (
                  <li key={i} style={{ fontSize: 14, lineHeight: 1.6, color: INK, marginBottom: 8 }}>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 style={{ fontFamily: FONT_SANS, fontSize: 16, color: CLAY, marginBottom: 10 }}>
                Worth watching
              </h3>
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                {(aiContent.challenges || []).map((s, i) => (
                  <li key={i} style={{ fontSize: 14, lineHeight: 1.6, color: INK, marginBottom: 8 }}>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {aiContent?.careerSuggestions?.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <h3 style={{ fontFamily: FONT_SANS, fontSize: 17, color: INK, marginBottom: 14 }}>
              Careers worth exploring
            </h3>
            {aiContent.careerSuggestions.map((c, i) => (
              <div key={i} style={{ borderLeft: `3px solid ${GREEN}`, paddingLeft: 14, marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: INK }}>{c.title}</div>
                <div style={{ fontSize: 13.5, color: SLATE, lineHeight: 1.6, marginTop: 2 }}>{c.why}</div>
              </div>
            ))}
          </section>
        )}

        <p className="no-print" style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, marginBottom: 32 }}>
          If you'd like a copy, you can save this as a PDF or print it using the button above — or you can
          request one from your career coach.
        </p>

        <div style={{ borderTop: `1px solid ${LINE}`, paddingTop: 16, marginTop: 40 }}>
          <p style={{ fontSize: 12, color: SLATE, fontStyle: "italic" }}>
            This report is a starting point for a coaching conversation, not a verdict — use it to guide
            further exploration together.
          </p>
        </div>

        <section className="methodology-page" style={{ marginTop: 48, paddingTop: 32, borderTop: `1px solid ${LINE}` }}>
          <div style={{ fontSize: 12, letterSpacing: "0.1em", color: SLATE, textTransform: "uppercase", marginBottom: 8 }}>
            Appendix
          </div>
          <h2 style={{ fontFamily: FONT_SANS, fontSize: 22, color: INK, marginBottom: 18 }}>
            About this assessment
          </h2>
          <MethodologyContent compact />
        </section>

        <div style={{ textAlign: "center", marginTop: 48 }}>
          <Logo height={34} />
          <p style={{ fontSize: 11, color: SLATE, marginTop: 10 }}>
            Mordecai Coaching and Leadership Solutions
          </p>
        </div>
      </div>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .methodology-page { page-break-before: always; border-top: none !important; padding-top: 0 !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}
