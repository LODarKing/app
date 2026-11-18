// Utilidades puras: tudo depende só do tempo t (segundos). Nenhum estado passa de um quadro para o outro.
import { Easing, interpolate, spring } from 'remotion';

export const COR = { fundo: '#090E1A', ciano: '#00D9F5', branco: '#F5F7FC', amarelo: '#F7C75B', painel: '#0E1526', cianoEsc: '#0090A6', cianoClaro: '#BDF4FB' };
export const FONTE_TITULO = 'InterDisplay';
export const FONTE_UI = 'JetBrainsMono';

// ruído com semente (mulberry32), nunca Math.random
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0; let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lin = (t: number, t0: number, t1: number, v0: number, v1: number, ease: (x: number) => number = (x) => x) =>
  interpolate(t, [t0, t1], [v0, v1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
export const inOut = Easing.inOut(Easing.cubic);
export const out = Easing.out(Easing.cubic);
// mola avaliada a partir de um instante (em segundos); 0 antes dele
export const mola = (t: number, t0: number, fps: number, cfg: { damping?: number; stiffness?: number; mass?: number } = {}) =>
  t < t0 ? 0 : spring({ frame: (t - t0) * fps, fps, config: { damping: 14, stiffness: 120, mass: 1, ...cfg } });
// passos discretos (revelações "por módulo", sem fade)
export const passos = (p: number, n: number) => Math.floor(clamp(p) * n) / n;
