"use client";

import * as React from "react";
import { useProgress } from "@/lib/progress";

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export default function GameScores() {
  const { state, ready } = useProgress();
  if (!ready) return null;

  const rows: { label: string; value: string }[] = [];
  if (state.games["guess"] !== undefined)
    rows.push({ label: "გამოიცანი ჟესტი", value: `${state.games["guess"]} ქულა` });
  [6, 8, 10].forEach((p) => {
    const v = state.games[`memory-${p}`];
    if (v !== undefined) rows.push({ label: `ბანქო · ${p} წყვილი`, value: fmt(v) });
  });
  const conn = Object.entries(state.games).filter(([k]) => k.startsWith("connections-"));
  conn.forEach(([k, v]) => {
    rows.push({ label: `კავშირები · ${k.replace("connections-", "")}`, value: `${4 - (4 - v)} სიცოცხლე დარჩა` });
  });
  if (state.games["decode"] !== undefined)
    rows.push({ label: "სცენის გაშიფვრა", value: `${state.games["decode"]} სწორი` });

  if (!rows.length) return null;

  return (
    <section className="mt-12" data-reveal="up" aria-labelledby="scores">
      <h2 id="scores" className="text-[20px]">
        შენი რეკორდები
      </h2>
      <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r) => (
          <div key={r.label} className="card flex items-center justify-between gap-3 px-4 py-3">
            <span className="text-[13.5px]" style={{ color: "var(--fg-muted)" }}>
              {r.label}
            </span>
            <span className="text-[14px] font-bold tabular-nums" style={{ color: "var(--color-clay)" }}>
              {r.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
