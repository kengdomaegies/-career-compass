"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import { ALL_QUESTIONS, INTEREST_QUESTIONS, LIKERT, computeInterestScores, computeStyleScores } from "@/lib/scoring";
import { INK, BG, GREEN, GREEN_DARK, SLATE, CARD, LINE, CLAY, FONT_DISPLAY } from "@/lib/theme";
import Logo from "@/components/Logo";

function ProgressRibbon({ step, total }) {
  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            background: i <= step ? GREEN : LINE,
            transition: "background 0.3s",
          }}
        />
      ))}
    </div>
  );
}

function Intro({ onStart, clientName, setClientName, clientEmail, setClientEmail }) {
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", padding: "48px 24px" }}>
      <Logo height={78} />
      <h1
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 32,
          color: INK,
          margin: "22px 0 8px",
          letterSpacing: "-0.01em",
        }}
      >
        Career Compass
      </h1>
      <p style={{ color: SLATE, fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
        A short assessment of what draws you to certain kinds of work, and how you tend to operate day to
        day, then a personalized report built from your answers.
      </p>
      <input
        value={clientName}
        onChange={(e) => setClientName(e.target.value)}
        placeholder="First and last name (for the report)"
        style={{
          width: "100%",
          padding: "12px 16px",
          fontSize: 15,
          border: `1px solid ${LINE}`,
          borderRadius: 8,
          marginBottom: 12,
          fontFamily: "inherit",
          boxSizing: "border-box",
        }}
      />
      <input
        value={clientEmail}
        onChange={(e) => setClientEmail(e.target.value)}
        placeholder="Your email (so your coach can follow up with you)"
        type="email"
        style={{
          width: "100%",
          padding: "12px 16px",
          fontSize: 15,
          border: `1px solid ${LINE}`,
          borderRadius: 8,
          marginBottom: 20,
          fontFamily: "inherit",
          boxSizing: "border-box",
        }}
      />
      <button
        onClick={onStart}
        style={{
          background: INK,
          color: BG,
          border: "none",
          borderRadius: 8,
          padding: "14px 28px",
          fontSize: 15,
          fontWeight: 600,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        Begin <ArrowRight size={16} />
      </button>
      <p style={{ color: SLATE, fontSize: 12, marginTop: 24 }}>
        {ALL_QUESTIONS.length} quick questions, about 5 minutes.
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 14 }}>
        <Link
          href="/methodology"
          style={{ color: GREEN_DARK, fontSize: 13, textDecoration: "underline" }}
        >
          How this assessment works
        </Link>
        <Link href="/admin" style={{ color: SLATE, fontSize: 13, textDecoration: "underline" }}>
          Admin
        </Link>
      </div>
    </div>
  );
}

function Quiz({ answers, setAnswers, step, setStep, onFinish }) {
  const q = ALL_QUESTIONS[step];
  const selected = answers[step];
  const isFirstStyleQuestion = q.type === "style" && step === INTEREST_QUESTIONS.length;

  function choose(v) {
    setAnswers({ ...answers, [step]: v });
  }
  function next() {
    if (step < ALL_QUESTIONS.length - 1) setStep(step + 1);
    else onFinish();
  }
  function back() {
    if (step > 0) setStep(step - 1);
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "48px 24px" }}>
      <ProgressRibbon step={step} total={ALL_QUESTIONS.length} />
      <div
        style={{
          fontSize: 12,
          color: GREEN_DARK,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 6,
        }}
      >
        {q.type === "interest" ? "Part 1 · Interests" : "Part 2 · Work style"}
      </div>
      {isFirstStyleQuestion && (
        <p style={{ fontSize: 13, color: SLATE, marginBottom: 14 }}>
          Now a few questions about how you like to work, not just what you're drawn to.
        </p>
      )}
      <div style={{ fontSize: 12, color: SLATE, marginBottom: 10 }}>
        Question {step + 1} of {ALL_QUESTIONS.length}
      </div>
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: 24, color: INK, lineHeight: 1.4, marginBottom: 32 }}>
        {q.text}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32 }}>
        {LIKERT.map((opt) => (
          <button
            key={opt.v}
            onClick={() => choose(opt.v)}
            style={{
              textAlign: "left",
              padding: "13px 16px",
              borderRadius: 8,
              border: `1.5px solid ${selected === opt.v ? GREEN : LINE}`,
              background: selected === opt.v ? "rgba(168,120,60,0.08)" : CARD,
              cursor: "pointer",
              fontSize: 15,
              color: INK,
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontFamily: "inherit",
            }}
          >
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                border: `1.5px solid ${selected === opt.v ? GREEN : SLATE}`,
                background: selected === opt.v ? GREEN : "transparent",
                flexShrink: 0,
              }}
            />
            {opt.label}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button
          onClick={back}
          disabled={step === 0}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "none",
            color: step === 0 ? LINE : SLATE,
            cursor: step === 0 ? "default" : "pointer",
            fontSize: 14,
          }}
        >
          <ArrowLeft size={15} /> Back
        </button>
        <button
          onClick={next}
          disabled={!selected}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: selected ? INK : LINE,
            color: selected ? BG : "#9CA3AF",
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            fontSize: 14,
            fontWeight: 600,
            cursor: selected ? "pointer" : "default",
          }}
        >
          {step === ALL_QUESTIONS.length - 1 ? "See my report" : "Next"} <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "96px 24px" }}>
      <Loader2 size={28} color={GREEN} style={{ animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: SLATE, marginTop: 16, fontSize: 15 }}>Building your report…</p>
    </div>
  );
}

function SubmitError({ message, onRetry }) {
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "96px 24px", textAlign: "center" }}>
      <AlertTriangle size={28} color={CLAY} />
      <p style={{ color: INK, marginTop: 16, fontSize: 15 }}>
        Couldn't reach the server ({message}). Your answers are still here — try again.
      </p>
      <button
        onClick={onRetry}
        style={{
          marginTop: 20,
          background: INK,
          color: BG,
          border: "none",
          borderRadius: 8,
          padding: "12px 24px",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
}

export default function CareerCompassQuiz() {
  const router = useRouter();
  const [screen, setScreen] = useState("intro"); // intro | quiz | loading | submit-error
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0);
  const [submitError, setSubmitError] = useState(null);

  async function finishQuiz() {
    setScreen("loading");
    const interestScores = computeInterestScores(answers);
    const styleScores = computeStyleScores(answers);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientName, clientEmail, interestScores, styleScores }),
      });
      if (!res.ok) throw new Error(`request failed (${res.status})`);
      const data = await res.json();
      router.push(`/r/${data.id}`);
    } catch (e) {
      setSubmitError(e.message || "unknown error");
      setScreen("submit-error");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {screen === "intro" && (
        <Intro
          onStart={() => setScreen("quiz")}
          clientName={clientName}
          setClientName={setClientName}
          clientEmail={clientEmail}
          setClientEmail={setClientEmail}
        />
      )}
      {screen === "quiz" && (
        <Quiz answers={answers} setAnswers={setAnswers} step={step} setStep={setStep} onFinish={finishQuiz} />
      )}
      {screen === "loading" && <Loading />}
      {screen === "submit-error" && <SubmitError message={submitError} onRetry={finishQuiz} />}
    </div>
  );
}
