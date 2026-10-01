"use client";

import * as React from "react";
import Link from "next/link";
import GestureFigure from "@/components/figures/GestureFigure";
import { GESTURE_MAP } from "@/lib/content/gestures";
import {
  CONNECTION_PUZZLES,
  GROUP_COLOR,
  type ConnectionGroup,
  type ConnectionPuzzle,
} from "@/lib/content/games";
import { useProgress } from "@/lib/progress";

const MISTAKES = 4;

function shuffle<T>(a: T[]): T[] {
  const out = [...a];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function ConnectionsGame() {
  const [puzzleIdx, setPuzzleIdx] = React.useState(0);
  const puzzle: ConnectionPuzzle = CONNECTION_PUZZLES[puzzleIdx];

  const [tiles, setTiles] = React.useState<string[]>([]);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [solved, setSolved] = React.useState<ConnectionGroup[]>([]);
  const [mistakes, setMistakes] = React.useState(0);
  const [shake, setShake] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const { recordGame } = useProgress();

  const reset = React.useCallback(
    (idx = puzzleIdx) => {
      const p = CONNECTION_PUZZLES[idx];
      setTiles(shuffle(p.groups.flatMap((g) => g.ids)));
      setSelected([]);
      setSolved([]);
      setMistakes(0);
      setMessage(null);
    },
    [puzzleIdx],
  );

  React.useEffect(() => {
    // ახალი თავსატეხის ჩატვირთვა
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reset(puzzleIdx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzleIdx]);

  const won = solved.length === 4;
  const lost = mistakes >= MISTAKES && !won;

  React.useEffect(() => {
    if (won) recordGame(`connections-${puzzle.id}`, MISTAKES - mistakes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [won]);

  React.useEffect(() => {
    // წაგების შემდეგ ყველა ჯგუფის გამჟღავნება
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (lost) setSolved(puzzle.groups);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lost]);

  const toggle = (id: string) => {
    if (won || lost) return;
    setMessage(null);
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : s.length < 4 ? [...s, id] : s,
    );
  };

  const submit = () => {
    if (selected.length !== 4) return;
    const match = puzzle.groups.find(
      (g) => !solved.includes(g) && selected.every((id) => g.ids.includes(id)),
    );
    if (match) {
      setSolved((s) => [...s, match]);
      setTiles((t) => t.filter((id) => !match.ids.includes(id)));
      setSelected([]);
      setMessage(null);
    } else {
      // რამდენით ავცდით
      const closest = Math.max(
        ...puzzle.groups
          .filter((g) => !solved.includes(g))
          .map((g) => selected.filter((id) => g.ids.includes(id)).length),
      );
      setMistakes((m) => m + 1);
      setShake(true);
      setTimeout(() => setShake(false), 480);
      setMessage(closest === 3 ? "ერთი ჟესტით აცდი!" : closest === 2 ? "ორი სწორია." : "არა — სხვა ლოგიკა სცადე.");
    }
  };

  const solvedIds = new Set(solved.flatMap((g) => g.ids));

  return (
    <div className="mx-auto max-w-2xl">
      {/* თავსატეხის არჩევა */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5">
          {CONNECTION_PUZZLES.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPuzzleIdx(i)}
              className="focus-ring rounded-full border px-3.5 py-1.5 text-[12.5px] transition-colors"
              style={{
                background: i === puzzleIdx ? "var(--brand)" : "var(--bg-raised)",
                color: i === puzzleIdx ? "#fff" : "var(--fg-muted)",
                borderColor: i === puzzleIdx ? "var(--brand)" : "var(--line)",
              }}
            >
              {p.title}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[12.5px]" style={{ color: "var(--fg-faint)" }}>
          შეცდომები
          <span className="flex gap-1">
            {[...Array(MISTAKES)].map((_, i) => (
              <span
                key={i}
                className="size-2.5 rounded-full transition-colors"
                style={{ background: i < MISTAKES - mistakes ? "var(--fg-muted)" : "var(--line)" }}
              />
            ))}
          </span>
        </div>
      </div>

      {/* ამოხსნილი ჯგუფები */}
      <div className="mt-4 grid gap-2.5">
        {solved.map((g) => {
          const c = GROUP_COLOR[g.level];
          return (
            <div
              key={g.title}
              className="rounded-xl px-4 py-3 text-center"
              style={{ background: c.bg }}
              data-reveal="scale"
            >
              <p className="text-[14px] font-bold" style={{ color: c.fg }}>
                {g.title}
              </p>
              <p className="mt-0.5 text-[12.5px]" style={{ color: "var(--color-ink-2)" }}>
                {g.ids.map((id) => GESTURE_MAP[id]?.title).join(" · ")}
              </p>
            </div>
          );
        })}
      </div>

      {/* ბადე */}
      {tiles.length > 0 && (
        <div
          className="mt-2.5 grid grid-cols-4 gap-2.5"
          style={{ animation: shake ? "shake .45s" : undefined }}
        >
          {tiles.map((id) => {
            const g = GESTURE_MAP[id];
            if (!g || solvedIds.has(id)) return null;
            const on = selected.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggle(id)}
                aria-pressed={on}
                className="focus-ring grid aspect-square place-items-center rounded-xl border p-1.5 transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: on ? "var(--brand)" : "var(--bg-raised)",
                  borderColor: on ? "var(--brand)" : "var(--line)",
                  color: on ? "#fff" : "var(--fg)",
                }}
                data-cursor={on ? "მოხსნა" : "არჩევა"}
              >
                <GestureFigure
                  gesture={g}
                  labelled={false}
                  showFocus={false}
                  className="h-[62%] w-auto"
                />
                <span className="line-clamp-2 px-0.5 text-center text-[10.5px] font-medium leading-tight">
                  {g.title}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {message && (
        <p className="mt-3 text-center text-[13.5px] font-medium" style={{ color: "var(--color-clay)" }} aria-live="polite">
          {message}
        </p>
      )}

      {/* მართვა */}
      {!won && !lost && (
        <div className="mt-5 flex flex-wrap justify-center gap-2.5">
          <button
            type="button"
            onClick={() => setTiles((t) => shuffle(t))}
            className="focus-ring rounded-full border px-5 py-2.5 text-[14px]"
            style={{ borderColor: "var(--line-strong)" }}
          >
            არევა
          </button>
          <button
            type="button"
            onClick={() => setSelected([])}
            disabled={!selected.length}
            className="focus-ring rounded-full border px-5 py-2.5 text-[14px] disabled:opacity-40"
            style={{ borderColor: "var(--line-strong)" }}
          >
            გასუფთავება
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={selected.length !== 4}
            className="focus-ring rounded-full px-6 py-2.5 text-[14px] font-medium transition-opacity disabled:opacity-35"
            style={{ background: "var(--brand)", color: "#fff" }}
            data-cursor="შემოწმება"
          >
            შემოწმება
          </button>
        </div>
      )}

      {(won || lost) && (
        <div className="card mt-5 p-6 text-center" data-reveal="scale">
          <h3 className="text-[22px]" style={{ color: won ? "var(--color-sage)" : "var(--color-clay)" }}>
            {won
              ? mistakes === 0
                ? "უშეცდომოდ! 🎉"
                : "ამოხსენი!"
              : "ამჯერად არა"}
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
            {won
              ? `${mistakes} შეცდომით დაასრულე. ჯგუფები ტონისა და სხეულის ნაწილის ლოგიკას მისდევს.`
              : "ყველა ჯგუფი ზემოთ ჩანს. გადახედე და სცადე სხვა თავსატეხი — ლოგიკა იგივეა."}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="focus-ring rounded-full px-6 py-2.5 text-[14.5px] font-medium"
              style={{ background: "var(--brand)", color: "#fff" }}
            >
              თავიდან
            </button>
            {puzzleIdx < CONNECTION_PUZZLES.length - 1 && (
              <button
                type="button"
                onClick={() => setPuzzleIdx((i) => i + 1)}
                className="focus-ring rounded-full border px-6 py-2.5 text-[14.5px]"
                style={{ borderColor: "var(--line-strong)" }}
              >
                შემდეგი თავსატეხი
              </button>
            )}
            <Link href="/games" className="focus-ring rounded-full px-6 py-2.5 text-[14.5px]" style={{ color: "var(--brand)" }}>
              სხვა თამაშები
            </Link>
          </div>
        </div>
      )}

      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}`}</style>
    </div>
  );
}
