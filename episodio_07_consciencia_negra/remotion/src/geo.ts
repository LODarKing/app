// Projeção dos mapas (equirretangular com cos 15°, a mesma da cena 01) e câmera de mapa.
import b10 from './data/brasil10.json';
import est from './data/estados.json';
import malha from './data/malha.json';
import { lerp } from './tema';

export type CamMapa = { lon: number; lat: number; K: number; cx: number; cy: number };
const C15 = Math.cos((15 * Math.PI) / 180);
export const xy = (c: CamMapa, lo: number, la: number): [number, number] => [c.cx + (lo - c.lon) * C15 * c.K, c.cy - (la - c.lat) * c.K];
/** câmera da cena 01 no fim (mapa inteiro) */
export const CAM_BR: CamMapa = { lon: -54.4, lat: -14.25, K: 19.6, cx: 540, cy: 880 };
/** interpolação de câmera: zoom em escala logarítmica, centro acompanhando */
export function camLerp(a: CamMapa, b: CamMapa, u: number): CamMapa {
  const K = Math.exp(lerp(Math.log(a.K), Math.log(b.K), u));
  // o centro anda em proporção ao zoom (sensação de aproximação contínua)
  const w = (1 / K - 1 / a.K) / (1 / b.K - 1 / a.K || 1);
  const uu = Number.isFinite(w) && a.K !== b.K ? w : u;
  return { lon: lerp(a.lon, b.lon, uu), lat: lerp(a.lat, b.lat, uu), K, cx: lerp(a.cx, b.cx, u), cy: lerp(a.cy, b.cy, u) };
}
export const BR10 = (b10 as { pontos: number[][] }).pontos;
export const ESTADOS = (est as { estados: { uf: string; nome: string; aneis: number[][][] }[] }).estados;
export const MALHA = malha as number[][];
/** caminho SVG de um anel em lon/lat; pula pontos fora de uma margem larga da tela (desempenho) e quase coincidentes */
export function caminho(c: CamMapa, anel: number[][], fechar = true): string {
  let d = '', px = -1e9, py = -1e9;
  for (let i = 0; i < anel.length; i++) {
    const [x, y] = xy(c, anel[i][0], anel[i][1]);
    if (Math.abs(x - px) + Math.abs(y - py) < 1.2 && i < anel.length - 1) continue;
    d += (d ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1); px = x; py = y;
  }
  return d + (fechar ? 'Z' : '');
}
export const POA_LL: [number, number] = [-51.2177, -30.0346];
export const SERRA_LL: [number, number] = [-36.0, -9.27];      // Serra da Barriga, União dos Palmares (AL), aprox.
export const SSA_LL: [number, number] = [-38.5014, -12.9718];  // Salvador (BA): assembleia do MNU em 1978 (Senado)
