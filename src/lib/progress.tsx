"use client";

import * as React from "react";

const KEY = "sxeulis-ena:v1";

export interface QuizResult {
  best: number;
  total: number;
  attempts: number;
  lastAt: string;
}

export interface ProgressState {
  /** წაკითხული თავების slug-ები */
  read: string[];
  /** შენახული ჟესტები */
  saved: string[];
  /** ტესტების შედეგები testId-ის მიხედვით */
  quiz: Record<string, QuizResult>;
  /** თამაშების რეკორდები */
  games: Record<string, number>;
  /** სტუდიოში შენახული პოზები */
  studio: { id: string; name: string; config: Record<string, unknown>; at: string }[];
  /** ბოლო ვიზიტები (ISO თარიღები, უნიკალური დღეები) */
  visits: string[];
  updatedAt: string;
}

const EMPTY: ProgressState = {
  read: [],
  saved: [],
  quiz: {},
  games: {},
  studio: [],
  visits: [],
  updatedAt: "",
};

function load(): ProgressState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      ...EMPTY,
      ...parsed,
      read: parsed.read ?? [],
      saved: parsed.saved ?? [],
      quiz: parsed.quiz ?? {},
      games: parsed.games ?? {},
      studio: parsed.studio ?? [],
      visits: parsed.visits ?? [],
    };
  } catch {
    return EMPTY;
  }
}

function save(state: ProgressState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* კვოტა ამოიწურა ან პირადი რეჟიმია — ჩუმად ვაგრძელებთ */
  }
}

interface Ctx {
  state: ProgressState;
  /** true მას შემდეგ, რაც localStorage წაიკითხა (ჰიდრატაციის დაცვა) */
  ready: boolean;
  markRead: (slug: string) => void;
  unmarkRead: (slug: string) => void;
  toggleSaved: (id: string) => void;
  recordQuiz: (testId: string, score: number, total: number) => void;
  recordGame: (gameId: string, score: number, higherIsBetter?: boolean) => void;
  saveStudio: (name: string, config: Record<string, unknown>) => void;
  removeStudio: (id: string) => void;
  reset: () => void;
}

const ProgressContext = React.createContext<Ctx | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<ProgressState>(EMPTY);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const loaded = load();
    const today = new Date().toISOString().slice(0, 10);
    const visits = loaded.visits.includes(today)
      ? loaded.visits
      : [...loaded.visits, today].slice(-120);
    const next = { ...loaded, visits };
    // ჰიდრატაციის შემდეგ localStorage-იდან ერთჯერადი წაკითხვა
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(next);
    setReady(true);
    save(next);
  }, []);

  const update = React.useCallback((fn: (s: ProgressState) => ProgressState) => {
    setState((prev) => {
      const next = { ...fn(prev), updatedAt: new Date().toISOString() };
      save(next);
      return next;
    });
  }, []);

  const value = React.useMemo<Ctx>(
    () => ({
      state,
      ready,
      markRead: (slug) =>
        update((s) => (s.read.includes(slug) ? s : { ...s, read: [...s.read, slug] })),
      unmarkRead: (slug) => update((s) => ({ ...s, read: s.read.filter((x) => x !== slug) })),
      toggleSaved: (id) =>
        update((s) => ({
          ...s,
          saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [...s.saved, id],
        })),
      recordQuiz: (testId, score, total) =>
        update((s) => {
          const prev = s.quiz[testId];
          return {
            ...s,
            quiz: {
              ...s.quiz,
              [testId]: {
                best: Math.max(prev?.best ?? 0, score),
                total,
                attempts: (prev?.attempts ?? 0) + 1,
                lastAt: new Date().toISOString(),
              },
            },
          };
        }),
      recordGame: (gameId, score, higherIsBetter = true) =>
        update((s) => {
          const prev = s.games[gameId];
          const next =
            prev === undefined
              ? score
              : higherIsBetter
                ? Math.max(prev, score)
                : Math.min(prev, score);
          return { ...s, games: { ...s.games, [gameId]: next } };
        }),
      saveStudio: (name, config) =>
        update((s) => ({
          ...s,
          studio: [
            { id: `st-${Date.now()}`, name, config, at: new Date().toISOString() },
            ...s.studio,
          ].slice(0, 24),
        })),
      removeStudio: (id) => update((s) => ({ ...s, studio: s.studio.filter((x) => x.id !== id) })),
      reset: () => {
        setState({ ...EMPTY, updatedAt: new Date().toISOString() });
        save({ ...EMPTY, updatedAt: new Date().toISOString() });
      },
    }),
    [state, ready, update],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): Ctx {
  const ctx = React.useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used inside <ProgressProvider>");
  return ctx;
}

/** უწყვეტი დღეების სერია */
export function computeStreak(visits: string[]): number {
  if (!visits.length) return 0;
  const set = new Set(visits);
  let streak = 0;
  const d = new Date();
  // თუ დღეს არ შემოსულა, ვიწყებთ გუშინდლიდან
  if (!set.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
  for (;;) {
    const key = d.toISOString().slice(0, 10);
    if (!set.has(key)) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}
