/**
 * ავატარის გეომეტრიის ჩატვირთვა: ორ Web Worker-ში პარალელურად აიგება
 * (UI არ იყინება), შედეგი კეშირდება მოდულის დონეზე — `use(loadAvatar())`-
 * ისთვის სტაბილური. Worker-ის შეცდომისას — მთავარ ნაკადზე.
 */
import type { AvatarData, FaceData, LimbData, Part } from "./buildAll";

let promise: Promise<AvatarData> | null = null;

async function buildOnMainThread<T>(part: Part): Promise<T> {
  // ერთი კადრი დავუთმოთ ბრაუზერს, რომ ჩამტვირთავი გამოჩნდეს
  await new Promise((r) => setTimeout(r, 30));
  const { buildFace, buildLimbs } = await import("./buildAll");
  return (part === "face" ? buildFace() : buildLimbs()) as T;
}

function buildPart<T>(part: Part): Promise<T> {
  return new Promise<T>((resolve) => {
    let worker: Worker;
    try {
      worker = new Worker(new URL("./avatar.worker.ts", import.meta.url), { type: "module" });
    } catch {
      buildOnMainThread<T>(part).then(resolve);
      return;
    }
    const fallback = () => {
      worker.terminate();
      buildOnMainThread<T>(part).then(resolve);
    };
    worker.onmessage = (e: MessageEvent<{ ok: boolean; data?: T }>) => {
      worker.terminate();
      if (e.data.ok && e.data.data) resolve(e.data.data);
      else fallback();
    };
    worker.onerror = fallback;
    worker.postMessage(part);
  });
}

export function loadAvatar(): Promise<AvatarData> {
  if (!promise) {
    promise = Promise.all([buildPart<FaceData>("face"), buildPart<LimbData>("limbs")]).then(([face, limbs]) => ({
      ...face,
      ...limbs,
    }));
  }
  return promise;
}
