// Núcleo: medidas, cores da marca, tempo, easing, ruído com semente e texto.
// Contrato: tudo aqui é função pura do tempo t — nada é carregado de um quadro para o outro.
import TEMPOS from './dados/tempos.json';

export const W = 1080, H = 1920, FPS = 30;
export const T = TEMPOS as {
  dur: number; fps: number; bpm: number; fase: number;
  cenas: { id: string; nome: string; t0: number; t1: number }[];
  marcos: Record<string, number>;
  legendas: { n: number; ini: number; fim: number; texto: string; queimar?: boolean; palavras: { t: string; ini: number; fim: number; linha: number; d: string }[] }[];
  palavras: [string, number, number][];
};
export const M = T.marcos;

// Identidade do canal (cores oficiais — não alterar)
export const COR = { fundo: '#090E1A', ciano: '#00D9F5', branco: '#F5F7FC', amarelo: '#F7C75B' };
export const RGB = { fundo: [9, 14, 26], ciano: [0, 217, 245], branco: [245, 247, 252], amarelo: [247, 199, 91] } as const;
export const rgba = (c: readonly number[], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

// Fontes: uma de título (Archivo; corte normal e expandido) e uma de interface (IBM Plex Mono)
export const F = {
  titulo: (px: number, peso = 800) => `${peso} ${px}px Archivo`,
  tituloX: (px: number, peso = 900) => `${peso} ${px}px ArchivoX`,
  ui: (px: number, peso = 500) => `${peso} ${px}px Plex`,
};
export const FONTES: [string, string, string][] = [
  ['Archivo', 'Archivo-SemiBold.ttf', '600'], ['Archivo', 'Archivo-Bold.ttf', '700'], ['Archivo', 'Archivo-ExtraBold.ttf', '800'],
  ['ArchivoX', 'ArchivoExpanded-ExtraBold.ttf', '800'], ['ArchivoX', 'ArchivoExpanded-Black.ttf', '900'],
  ['Plex', 'IBMPlexMono-Regular.ttf', '400'], ['Plex', 'IBMPlexMono-Medium.ttf', '500'], ['Plex', 'IBMPlexMono-SemiBold.ttf', '600'],
];

// Tempo e easing
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const eOut3 = (k: number) => 1 - Math.pow(1 - k, 3);
export const eIn3 = (k: number) => k * k * k;
export const eInOut3 = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
export const eOut5 = (k: number) => 1 - Math.pow(1 - k, 5);
export const eOutExpo = (k: number) => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k));
export const eInExpo = (k: number) => (k <= 0 ? 0 : Math.pow(2, 10 * k - 10));
export const eInOutSine = (k: number) => -(Math.cos(Math.PI * k) - 1) / 2;
/** mola amortecida (sem estado): 0 -> 1 com leve ultrapassagem */
export const mola = (k: number, z = 0.55, w = 11) => (k <= 0 ? 0 : 1 - Math.exp(-z * w * k) * Math.cos(w * Math.sqrt(1 - z * z) * k));
export const SEMI = 60 / T.bpm / 4;
export const grade = (t: number) => T.fase + Math.round((t - T.fase) / SEMI) * SEMI;

// Ruído com semente (mulberry32) — nunca Math.random
export function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** ruído 1D suave com semente (valor interpolado) */
export function ruido1(x: number, semente = 1) {
  const i = Math.floor(x), f = x - i, h = (n: number) => mulberry32(n * 7919 + semente * 104729)();
  const u = f * f * (3 - 2 * f); return lerp(h(i), h(i + 1), u) * 2 - 1;
}

// Texto
export type Ctx = CanvasRenderingContext2D;
export function texto(c: Ctx, s: string, x: number, y: number, font: string, cor: string, opts: { alinhar?: CanvasTextAlign; base?: CanvasTextBaseline; esp?: number } = {}) {
  c.font = font; c.fillStyle = cor; c.textAlign = opts.alinhar ?? 'center'; c.textBaseline = opts.base ?? 'alphabetic';
  (c as any).letterSpacing = `${opts.esp ?? 0}px`; c.fillText(s, x, y); (c as any).letterSpacing = '0px';
}
export function largura(c: Ctx, s: string, font: string, esp = 0) { c.font = font; (c as any).letterSpacing = `${esp}px`; const w = c.measureText(s).width; (c as any).letterSpacing = '0px'; return w; }

/** revelação por máscara: o texto sobe de dentro de uma fenda (sem fade) */
export function textoFenda(c: Ctx, s: string, x: number, y: number, font: string, cor: string, k: number, opts: { alinhar?: CanvasTextAlign; esp?: number; alt?: number } = {}) {
  if (k <= 0) return;
  const alt = opts.alt ?? 200, w = largura(c, s, font, opts.esp) + 40;
  const x0 = opts.alinhar === 'left' ? x - 20 : opts.alinhar === 'right' ? x - w + 20 : x - w / 2;
  c.save(); c.beginPath(); c.rect(x0, y - alt, w, alt * 1.28); c.clip();
  texto(c, s, x, y + (1 - eOut5(k)) * alt, font, cor, { alinhar: opts.alinhar, esp: opts.esp }); c.restore();
}
/** palavra: [início, fim] da n-ésima ocorrência */
export function palavra(p: string, n = 0): [number, number] {
  let k = 0; for (const w of T.palavras) if (w[0].replace(/[.,!?]/g, '') === p) { if (k === n) return [w[1], w[2]]; k++; }
  throw new Error('palavra ' + p);
}
