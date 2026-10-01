/// <reference lib="webworker" />
import { buildFace, buildLimbs, partTransferables, type Part } from "./buildAll";

const scope = self as unknown as DedicatedWorkerGlobalScope;

scope.onmessage = (e: MessageEvent<Part>) => {
  const part = e.data;
  try {
    const data = part === "face" ? buildFace() : buildLimbs();
    scope.postMessage({ ok: true, data }, partTransferables(part, data));
  } catch (err) {
    scope.postMessage({ ok: false, error: String(err) });
  }
};
