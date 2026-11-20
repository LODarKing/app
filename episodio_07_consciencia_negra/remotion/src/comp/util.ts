import { lerp } from '../tema';
/** texto datilografado: mostra os primeiros caracteres conforme o tempo (cps = caracteres por segundo) */
export const typed = (s: string, t: number, t0: number, cps = 26) => s.slice(0, Math.max(0, Math.floor((t - t0) * cps)));
/** "desdatilografa" (some de trás para frente) a partir de t1 */
export const typedIO = (s: string, t: number, t0: number, t1: number, cps = 26, cpsOut = 60) =>
  t < t1 ? typed(s, t, t0, cps) : s.slice(0, Math.max(0, s.length - Math.floor((t - t1) * cpsOut)));
export function corMix(a: string, z: string, u: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), pz = [1, 3, 5].map((i) => parseInt(z.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(lerp(v, pz[i], u))).join(',')})`;
}
