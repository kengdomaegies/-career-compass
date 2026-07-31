import { cookies } from "next/headers";
import { getSetting, QUIZ_PASSCODE_KEY } from "@/lib/settings";
import { QUIZ_COOKIE, verifyQuizSessionValue } from "@/lib/quizSession";
import CareerCompassQuiz from "@/components/CareerCompassQuiz";
import QuizPasscodeGate from "@/components/QuizPasscodeGate";
import { BG } from "@/lib/theme";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const passcode = await getSetting(QUIZ_PASSCODE_KEY);

  if (passcode) {
    const sessionValue = cookies().get(QUIZ_COOKIE)?.value;
    const authed = verifyQuizSessionValue(sessionValue);
    if (!authed) {
      return (
        <div
          style={{
            minHeight: "100vh",
            background: BG,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          }}
        >
          <QuizPasscodeGate />
        </div>
      );
    }
  }

  return <CareerCompassQuiz />;
}
