// Coreografia: câmera, boca e batom em função do tempo t (segundos). Tudo puro, sem estado.
import T from '../timeline.json';
import { Easing } from 'remotion';
import { P, bump, clamp, easeInCubic, easeInOutCubic, easeOutCubic, lerp, prog, springish } from './anim';
import { CITY, LIP_SCALE, TRAIL } from '../mapa/geo';
import { swipePoint } from '../components/Lips';
import { TITLE } from './layout';

export const S0 = 860 / (400 * LIP_SCALE);       // zoom inicial: boca com ~860 px de largura
const A0: P = [540, 900];
const ZOOM_EASE = Easing.bezier(0.5, 0, 0.12, 1);                           // onde a boca fica na tela no começo

export function camera(t: number) {
  const [z0, z1] = T.zoom;
  const e = ZOOM_EASE(prog(t, z0, z1));                       // recuo rápido no "mwah", pouso longo
  const pop = 0.86 + 0.14 * springish(prog(t, 0, 0.5), 2.2, 7);    // gancho: a boca já chega em movimento
  const drift = (1.05 - 0.05 * easeOutCubic(prog(t, 0, z0))) * pop;
  const s = Math.pow(S0 * drift, 1 - e);
  const anchor: P = [lerp(A0[0], CITY[0], e), lerp(A0[1], CITY[1], e)];
  return { s, anchor, e };
}
export const worldToScreen = (w: P, c = camera(0)): P => [c.anchor[0] + c.s * (w[0] - CITY[0]), c.anchor[1] + c.s * (w[1] - CITY[1])];
export const lipToScreen = (l: P, c = camera(0)): P => [c.anchor[0] + c.s * LIP_SCALE * l[0], c.anchor[1] + c.s * LIP_SCALE * (l[1] - 10)];

export function lips(t: number) {
  const lower = easeInOutCubic(prog(t, T.labioInferior[0], T.labioInferior[1]));
  const upper = easeInOutCubic(prog(t, T.labioSuperior[0], T.labioSuperior[1]));
  const k = bump(t, T.mwah - 0.12, T.mwah, T.mwah + 0.28);                  // "mwah": franze e solta
  const lift = bump(t, T.beijoMapa - 0.22, T.beijoMapa - 0.04, T.beijoMapa); // sobe antes do carimbo
  const sq = bump(t, T.beijoMapa, T.beijoMapa + 0.04, T.beijoMapa + 0.22);   // carimbo
  const settle = t > T.beijoMapa ? 0.04 * Math.exp(-9 * (t - T.beijoMapa)) * Math.sin(22 * (t - T.beijoMapa)) : 0;
  const sx = (1 - 0.1 * k) * (1 + 0.32 * lift) * (1 + 0.14 * sq) * (1 + settle);
  const sy = (1 + 0.07 * k) * (1 + 0.32 * lift) * (1 - 0.2 * sq) * (1 - settle);
  return { lower, upper, sx, sy, rot: -6 * lift };
}

// progresso do traço do mapa: lento enquanto a câmera ainda está perto, rápido depois, pousa no fim
export function trailQ(t: number) {
  const u = prog(t, T.tracoMapa[0], T.tracoMapa[1]);
  return Math.pow(easeInOutCubic(u), 1.25);
}

export function lipstick(t: number): { x: number; y: number; scale: number; angle: number; on: boolean } {
  const c = camera(t);
  const ls = 2.15 * Math.pow(c.s / S0, 0.55);
  const [e0, e1] = T.batomEntra, [l0, l1] = T.labioInferior, [u0, u1] = T.labioSuperior;
  if (t < l0) {
    const a = easeOutCubic(prog(t, e0, e1)), p = lipToScreen(swipePoint('lower', 0), c);
    return { x: lerp(1080, p[0], a), y: lerp(1500, p[1], a), scale: ls, angle: lerp(58, 36, a), on: true };
  }
  if (t < u0) {
    const p = lipToScreen(swipePoint('lower', easeInOutCubic(prog(t, l0, l1))), c);
    return { x: p[0], y: p[1], scale: ls, angle: 36 + 6 * Math.sin(prog(t, l0, l1) * Math.PI), on: true };
  }
  if (t < T.tracoMapa[0]) {
    const p = lipToScreen(swipePoint('upper', easeInOutCubic(prog(t, u0, u1))), c);
    return { x: p[0], y: p[1], scale: ls, angle: 36 - 4 * Math.sin(prog(t, u0, u1) * Math.PI), on: true };
  }
  const [m0, m1] = T.tracoMapa;
  const end = TRAIL.at(TRAIL.len);
  if (t < m1) {
    const a = TRAIL.at(trailQ(t) * TRAIL.len), p = worldToScreen(a.p, c);
    return { x: p[0], y: p[1], scale: ls, angle: 36 + 10 * Math.sin(a.ang), on: true };
  }
  if (t < m1 + 0.3) {
    const p = worldToScreen(end.p, c), a = easeInCubic(prog(t, m1, m1 + 0.3));
    return { x: p[0] + 900 * a, y: p[1] + 700 * a - 120 * Math.sin(a * Math.PI), scale: ls, angle: 36 + 30 * a, on: true };
  }
  // passada no "Amontada"
  const [a0, a1] = T.amontada;
  const y = TITLE.amontadaMidY;
  if (t >= a0 - 0.14 && t < a1 + 0.22) {
    const big = 1.0;
    if (t < a0) {
      const a = easeOutCubic(prog(t, a0 - 0.14, a0));
      return { x: lerp(-260, TITLE.left - 10, a), y: lerp(y + 380, y, a), scale: big, angle: lerp(150, 132, a), on: true };
    }
    if (t < a1) {
      const u = easeInOutCubic(prog(t, a0, a1));
      return { x: lerp(TITLE.left - 10, TITLE.amontadaRight + 30, u), y: y + 14 * Math.sin(u * Math.PI * 3), scale: big, angle: 132 - 6 * Math.sin(u * Math.PI), on: true };
    }
    const a = easeInCubic(prog(t, a1, a1 + 0.22));
    return { x: lerp(TITLE.amontadaRight + 30, 1400, a), y: lerp(y, y - 520, a), scale: big, angle: 132 - 20 * a, on: true };
  }
  return { x: -999, y: -999, scale: 1, angle: 0, on: false };
}
export const revealX = (t: number) => {
  const [a0, a1] = T.amontada;
  if (t < a0) return TITLE.left - 40;
  if (t >= a1) return 2000;
  return lerp(TITLE.left - 10, TITLE.amontadaRight + 30, easeInOutCubic(prog(t, a0, a1))) + 6;
};
export { clamp, springish };
