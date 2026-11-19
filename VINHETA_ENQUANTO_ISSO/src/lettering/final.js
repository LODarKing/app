// Composição final escolhida (proposta 1 — "Bala de Batom") e medidas usadas pela coreografia.
import { buildLockup } from './lockups.js';
export const FINAL_V = 1;
export const MAP_SHIFT = [40, 0];
export function finalMetrics() {
  const L = buildLockup(FINAL_V), am = L.words[3];
  const xs = am.strokes.filter((s) => s.pts && s.li <= 7).flatMap((s) => s.pts.map((p) => p[0]));
  const letters = [];
  for (let li = 0; li <= 10; li++) {
    const ss = am.strokes.filter((s) => s.pts && s.li === li); if (!ss.length) continue;
    const px = ss.flatMap((s) => s.pts.map((p) => p[0])); letters[li] = [Math.min(...px), Math.max(...px)];
  }
  const e0 = L.words[0].strokes[0].pts[0];
  return { amLeft: Math.min(...xs), amRight: Math.max(...xs), amMidY: am.y - am.xh * 0.5, amY: am.y, amXh: am.xh, letters, eStart: e0, amCenter: [(Math.min(...xs) + Math.max(...xs)) / 2, am.y - am.xh * 0.6] };
}
