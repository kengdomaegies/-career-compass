import { LOGO_SRC } from "@/lib/logo";

export default function Logo({ height = 56 }) {
  return (
    <img
      src={LOGO_SRC}
      alt="Mordecai Coaching and Leadership Solutions"
      style={{ height, width: "auto", display: "block", margin: "0 auto" }}
    />
  );
}
