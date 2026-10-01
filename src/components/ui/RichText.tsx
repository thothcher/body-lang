import * as React from "react";

/**
 * მინიმალური ინლაინ-მარკაპი: `**მუქი**` და `„ციტატა“`.
 * სრული markdown არ გვჭირდება — ეს შიგთავსი ჩვენივე დაწერილია.
 */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} className="font-semibold" style={{ color: "var(--fg)" }}>
            {p.slice(2, -2)}
          </strong>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        ),
      )}
    </>
  );
}

export function Prose({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="grid gap-4">
      {paragraphs.map((p, i) => (
        <p
          key={i}
          className="text-[16px] leading-[1.78]"
          style={{ color: "var(--fg-muted)" }}
          data-reveal="up"
          data-reveal-delay={Math.min(i * 60, 240)}
        >
          <RichText text={p} />
        </p>
      ))}
    </div>
  );
}
