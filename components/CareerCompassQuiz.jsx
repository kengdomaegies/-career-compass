"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import { ALL_QUESTIONS, INTEREST_QUESTIONS, LIKERT, computeInterestScores, computeStyleScores } from "@/lib/scoring";
import { PROFILE_QUESTIONS } from "@/lib/profileQuestions";
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
      <div style={{ textAlign: "left", marginBottom: 32 }}>
        <p style={{ color: SLATE, fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
          Hi there, feeling unsure about your next career move? You're not alone — and that's exactly why this
          assessment exists. The Career Compass is a simple, guided set of questions designed to help you
          discover your strengths, interests, and what truly matters to you in a career. There are no right
          or wrong answers, so just relax and answer honestly. It takes about 6 minutes, and every question
          brings you a step closer to understanding yourself better.
        </p>
        <p style={{ color: SLATE, fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
          By the end, you'll walk away with a clearer picture of the career directions that fit you best —
          plus personalised insights we'll explore together in your coaching session. Whether you're
          choosing what to study, hunting for your first job, or thinking about a career switch, this is
          your starting point for a plan that's built around you. Ready? Let's find your direction!
        </p>
        <p style={{ color: SLATE, fontSize: 13.5, lineHeight: 1.6 }}>
          If you'd like more detail on the thinking behind it, you can check out{" "}
          <Link href="/methodology" style={{ color: GREEN_DARK }}>
            how this assessment works
          </Link>
          .
        </p>
      </div>
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
        A few quick questions about you, then {ALL_QUESTIONS.length} short ones — about 6 minutes total.
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

function ProfileIntake({ profile, setProfile, onContinue }) {
  const allAnswered = PROFILE_QUESTIONS.every((q) => profile[q.key]);

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "48px 24px" }}>
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
        Before we begin
      </div>
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: 24, color: INK, lineHeight: 1.4, marginBottom: 8 }}>
        A little about you
      </h2>
      <p style={{ fontSize: 14, color: SLATE, lineHeight: 1.6, marginBottom: 32 }}>
        This just helps set the stage — there's no right or wrong answer here either.
      </p>
      {PROFILE_QUESTIONS.map((q) => (
        <div key={q.key} style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: INK, marginBottom: q.subtext ? 2 : 10 }}>
            {q.text}
          </div>
          {q.subtext && <div style={{ fontSize: 12.5, color: SLATE, marginBottom: 10 }}>{q.subtext}</div>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {q.options.map((opt) => {
              const selected = profile[q.key] === opt;
              return (
                <button
                  key={opt}
                  onClick={() => setProfile({ ...profile, [q.key]: opt })}
                  style={{
                    padding: "9px 14px",
                    borderRadius: 20,
                    border: `1.5px solid ${selected ? GREEN : LINE}`,
                    background: selected ? "rgba(44,107,70,0.08)" : CARD,
                    color: INK,
                    fontSize: 13.5,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <button
        onClick={onContinue}
        disabled={!allAnswered}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: allAnswered ? INK : LINE,
          color: allAnswered ? BG : "#9CA3AF",
          border: "none",
          borderRadius: 8,
          padding: "13px 26px",
          fontSize: 15,
          fontWeight: 600,
          cursor: allAnswered ? "pointer" : "default",
        }}
      >
        Continue <ArrowRight size={16} />
      </button>
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

const PROGRESS_KEY = "career-compass-quiz-progress";

export default function CareerCompassQuiz() {
  const router = useRouter();
  const [screen, setScreen] = useState("intro"); // intro | profile | quiz | loading | submit-error
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [profile, setProfile] = useState({});
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0);
  const [submitError, setSubmitError] = useState(null);
  const [restored, setRestored] = useState(false);

  // Restore progress on load — if the tab was closed or refreshed mid-quiz,
  // this brings the client straight back to where they left off instead of
  // making them redo the whole thing.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.clientName) setClientName(saved.clientName);
        if (saved.clientEmail) setClientEmail(saved.clientEmail);
        if (saved.profile) setProfile(saved.profile);
        if (saved.answers) setAnswers(saved.answers);
        if (typeof saved.step === "number") setStep(saved.step);
        // Trust the saved screen first — inferring purely from answer/profile
        // counts breaks the case where someone finished the profile step but
        // hadn't answered a single quiz question yet (answers is still {}).
        if (saved.screen === "quiz") {
          setScreen("quiz");
        } else if (saved.screen === "profile" || (saved.profile && Object.keys(saved.profile).length > 0)) {
          setScreen("profile");
        }
      }
    } catch {
      // corrupt/unavailable storage — just start fresh
    } finally {
      setRestored(true);
    }
  }, []);

  // Save progress as it changes, once initial restore has run (so we don't
  // immediately overwrite saved progress with the pre-restore blank state).
  // Only persist resumable screens — "loading"/"submit-error" are transient
  // and "intro" has nothing worth resuming into.
  useEffect(() => {
    if (!restored) return;
    if (screen !== "profile" && screen !== "quiz") return;
    try {
      localStorage.setItem(
        PROGRESS_KEY,
        JSON.stringify({ clientName, clientEmail, profile, answers, step, screen })
      );
    } catch {
      // storage unavailable (private browsing, quota) — progress just won't persist
    }
  }, [restored, clientName, clientEmail, profile, answers, step, screen]);

  function clearSavedProgress() {
    try {
      localStorage.removeItem(PROGRESS_KEY);
    } catch {
      // ignore
    }
  }

  async function finishQuiz() {
    setScreen("loading");
    const interestScores = computeInterestScores(answers);
    const styleScores = computeStyleScores(answers);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientName, clientEmail, profile, interestScores, styleScores }),
      });
      if (!res.ok) throw new Error(`request failed (${res.status})`);
      const data = await res.json();
      clearSavedProgress();
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
          onStart={() => setScreen("profile")}
          clientName={clientName}
          setClientName={setClientName}
          clientEmail={clientEmail}
          setClientEmail={setClientEmail}
        />
      )}
      {screen === "profile" && (
        <ProfileIntake profile={profile} setProfile={setProfile} onContinue={() => setScreen("quiz")} />
      )}
      {screen === "quiz" && (
        <Quiz answers={answers} setAnswers={setAnswers} step={step} setStep={setStep} onFinish={finishQuiz} />
      )}
      {screen === "loading" && <Loading />}
      {screen === "submit-error" && <SubmitError message={submitError} onRetry={finishQuiz} />}
    </div>
  );
}
