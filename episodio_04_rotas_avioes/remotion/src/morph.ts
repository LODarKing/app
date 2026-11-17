// Transformação contínua MAPA PLANO -> GLOBO.
//
// A superfície é uma folha com coordenadas (λ, Φ), λ = longitude relativa ao meridiano central,
// Φ = mix(Mercator(φ), φ, u)  — u: 0 = Mercator, 1 = equirretangular (latitude verdadeira).
// A folha é curvada com curvatura s (0 = plana, 1 = esfera de raio 1):
//   ponto = ρ·(sin(sλ)cos(sΦ), sin(sΦ), cos(sλ)cos(sΦ)), ρ = 1/s  (calota de uma esfera de raio ρ)
// Para s = 1 e u = 1 é exatamente a esfera com longitude λ e latitude φ: as coordenadas geográficas
// de cada ponto, rota e marcador são preservadas em toda a transformação.
// A calota é girada em torno do próprio centro para manter Φc de frente para a câmera
// (no limite s -> 0 isso vira só um deslocamento vertical do mapa).
// Fórmulas escritas na forma estável (sin²) para não perder precisão com ρ grande.
// O mesmo código existe em GLSL em GlobeGL.tsx.
import { mercY, MERC_MAX } from './geo';

export type Mat3 = number[]; // linha a linha, 9 valores
export const I3: Mat3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];
export const rotY = (a: number): Mat3 => [Math.cos(a), 0, Math.sin(a), 0, 1, 0, -Math.sin(a), 0, Math.cos(a)];
export const rotX = (a: number): Mat3 => [1, 0, 0, 0, Math.cos(a), -Math.sin(a), 0, Math.sin(a), Math.cos(a)];
export const rotZ = (a: number): Mat3 => [Math.cos(a), -Math.sin(a), 0, Math.sin(a), Math.cos(a), 0, 0, 0, 1];
export const mul = (A: Mat3, B: Mat3): Mat3 => {
  const r = new Array(9).fill(0);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++) r[i * 3 + j] += A[i * 3 + k] * B[k * 3 + j];
  return r;
};
const mv = (M: Mat3, x: number, y: number, z: number): [number, number, number] =>
  [M[0] * x + M[1] * y + M[2] * z, M[3] * x + M[4] * y + M[5] * z, M[6] * x + M[7] * y + M[8] * z];

export type View = {
  s: number;        // curvatura 0..1
  u: number;        // Mercator 0 -> equirretangular 1
  latC: number;     // latitude (rad) mantida de frente para a câmera
  G: Mat3;          // rotação extra do globo (órbita), em torno do centro da esfera
  zoom: number;
  panX: number; panY: number; // deslocamento do alvo (unidades de raio)
  roll: number;     // giro da imagem (rad)
  cx: number; cy: number;     // centro na tela (px)
};
export const K_PX = 300;          // px por radiano no zoom 1 (mapa plano)
export const CAM_D = 6;           // distância da câmera (raios)
export const CAM_F = K_PX * CAM_D;

export const sheetPhi = (lat: number, u: number) => {
  const m = Math.max(-MERC_MAX, Math.min(MERC_MAX, mercY(lat)));
  return m + (lat - m) * u;
};

export type P = { x: number; y: number; vis: boolean; depth: number; facing: number };

export function project(lam: number, lat: number, v: View): P {
  const s = Math.max(v.s, 1e-6), rho = 1 / s;
  const Phi = sheetPhi(lat, v.u), PhiC = sheetPhi(v.latC, v.u);
  const a = s * lam, b = s * Phi, bc = s * PhiC;
  const sa2 = Math.sin(a / 2) ** 2, sd = Math.sin((b - bc) / 2);
  let X = rho * Math.sin(a) * Math.cos(b);
  let Y = rho * (Math.sin(b - bc) + 2 * Math.cos(b) * Math.sin(bc) * sa2);
  let Z = -rho * (2 * sd * sd + 2 * Math.cos(b) * Math.cos(bc) * sa2);
  let n = [X * s, Y * s, 1 + Z * s];
  // rotação extra em torno do centro (0,0,-ρ): W = G·P + (G·c0 - c0), c0 = (0,0,ρ)
  const G = v.G;
  const gp = mv(G, X, Y, Z), gc = mv(G, 0, 0, rho);
  X = gp[0] + gc[0]; Y = gp[1] + gc[1]; Z = gp[2] + gc[2] - rho;
  n = mv(G, n[0], n[1], n[2]);
  X -= v.panX; Y -= v.panY;
  const w = CAM_D - Z;
  let px = v.zoom * CAM_F * X / w, py = v.zoom * CAM_F * Y / w;
  const cr = Math.cos(v.roll), sr = Math.sin(v.roll);
  const rx = px * cr - py * sr, ry = px * sr + py * cr;
  const facing = n[0] * -X + n[1] * -Y + n[2] * (CAM_D - Z);
  return { x: v.cx + rx, y: v.cy - ry, vis: facing > 0, depth: w, facing };
}

// Converte uma lista de pontos projetados em um caminho SVG que só desenha os trechos visíveis.
export function pathOf(pts: P[], closeGaps = true): string {
  let d = '', pen = false;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    if (!p.vis) { pen = false; continue; }
    if (pen && closeGaps) {
      const q = pts[i - 1];
      if (Math.hypot(p.x - q.x, p.y - q.y) > 400) pen = false; // salto (não deve ocorrer; segurança)
    }
    d += (pen ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1);
    pen = true;
  }
  return d;
}
