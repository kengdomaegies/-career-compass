import { AREAS, STYLE_DIMENSIONS } from "@/lib/scoring";
import { INK, FONT_SANS } from "@/lib/theme";

const AREA_TO_RIASEC = {
  Building: "Realistic",
  Thinking: "Investigative",
  Creating: "Artistic",
  Helping: "Social",
  Persuading: "Enterprising",
  Organizing: "Conventional",
};

export default function MethodologyContent({ compact }) {
  const h3size = compact ? 17 : 19;
  const pSize = compact ? 14 : 15;
  return (
    <div>
      <p style={{ fontSize: pSize, lineHeight: 1.7, color: INK, marginBottom: 24 }}>
        This assessment looks at two things: what draws you to certain kinds of work, and how you tend to
        operate once you're doing it. Together, they give a coach and client a shared starting point for a
        real conversation — not a verdict on who you should become.
      </p>

      <h3 style={{ fontFamily: FONT_SANS, fontSize: h3size, color: INK, marginBottom: 8 }}>
        Part 1 · Interest Areas
      </h3>
      <p style={{ fontSize: pSize, lineHeight: 1.7, color: INK, marginBottom: 10 }}>
        This section is built on <strong>Holland's RIASEC theory</strong>, a career-interest framework
        developed by psychologist John Holland and one of the most widely used models in career counseling
        since the 1970s. It's the basis for tools like the U.S. Department of Labor's O*NET Interest
        Profiler and the Strong Interest Inventory. The theory holds that most people's work interests
        cluster into six broad types:
      </p>
      <ul style={{ paddingLeft: 18, margin: "0 0 20px", fontSize: pSize, lineHeight: 1.7, color: INK }}>
        {AREAS.map((a) => (
          <li key={a.key} style={{ marginBottom: 4 }}>
            <strong>{a.key}</strong> ({AREA_TO_RIASEC[a.key]}) — {a.blurb}
          </li>
        ))}
      </ul>
      <p style={{ fontSize: pSize, lineHeight: 1.7, color: INK, marginBottom: 24 }}>
        Most people aren't purely one type — they lean toward two or three. The assessment measures
        relative strength across all six and highlights where your strongest pull sits.
      </p>

      <h3 style={{ fontFamily: FONT_SANS, fontSize: h3size, color: INK, marginBottom: 8 }}>
        Part 2 · Personality &amp; Work Style
      </h3>
      <p style={{ fontSize: pSize, lineHeight: 1.7, color: INK, marginBottom: 10 }}>
        This section maps four everyday spectrums that shape how someone prefers to work:
      </p>
      <ul style={{ paddingLeft: 18, margin: "0 0 20px", fontSize: pSize, lineHeight: 1.7, color: INK }}>
        {STYLE_DIMENSIONS.map((d) => (
          <li key={d.key} style={{ marginBottom: 4 }}>
            <strong>
              {d.poleA} ↔ {d.poleB}
            </strong>{" "}
            — {d.aDesc.replace(/\.$/, "")}, or {d.bDesc.charAt(0).toLowerCase() + d.bDesc.slice(1)}
          </li>
        ))}
      </ul>
      <p style={{ fontSize: pSize, lineHeight: 1.7, color: INK, marginBottom: 4 }}>
        <strong>A note on what this is and isn't:</strong> unlike Part 1, this section isn't drawn from a
        single validated psychometric instrument — it's a practical set of lenses designed to be useful in
        a coaching conversation. It's a starting point for reflection, not a clinical or diagnostic measure.
        Two people who land in the same spot on these spectrums can still be very different people; the
        value is in what it prompts you to notice and discuss, not in the score itself.
      </p>
    </div>
  );
}
