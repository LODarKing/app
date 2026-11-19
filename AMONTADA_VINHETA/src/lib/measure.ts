import { FONTS } from '../config/brand';

const cache = new Map<string, number[]>();
let ctx: CanvasRenderingContext2D | null = null;

/**
 * Posição x de cada letra numa linha, com o kerning da fonte preservado.
 * Mede o texto acumulado (prefixos) no canvas, que aplica o kerning como o navegador.
 * Devolve n+1 valores: o início de cada letra e, no fim, a largura total.
 */
export const glyphPositions = (text: string, size: number): number[] => {
  const key = `${text}|${size}`;
  const hit = cache.get(key);
  if (hit) return hit;
  if (!ctx) ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) throw new Error('Canvas indisponível');
  const t = FONTS.titulo;
  ctx.font = `${t.weight} ${size}px "${t.family}"`;
  // 62,5 % = 'extra-condensed' — o mesmo eixo de largura usado no CSS.
  (ctx as CanvasRenderingContext2D & { fontStretch: string }).fontStretch = 'extra-condensed';
  ctx.fontKerning = 'normal';
  const xs: number[] = [];
  for (let i = 0; i <= text.length; i++) xs.push(ctx.measureText(text.slice(0, i)).width);
  cache.set(key, xs);
  return xs;
};
