import React from 'react';
import { COLORS, LAYOUT } from '../config/brand';
import { T } from '../config/coreografia';
import { EASE, lerp, prog, pulse } from '../lib/motion';

/**
 * A boca e o batom.
 * 1) o contorno dos lábios se desenha em traço fino (cena 2),
 * 2) um batom entra pela direita e pinta o lábio de cima da direita para a esquerda,
 *    depois o de baixo da esquerda para a direita — a tinta aparece exatamente por onde a ponta passa,
 * 3) o batom sai e a boca dá um beijo curto, com um reflexo que surge no lábio de baixo.
 * Desenho em coordenadas próprias (caixa de 400 × 182); posição e escala em brand.ts.
 */

// ── formas dos lábios ──
const LABIO_SUP =
  'M 0 92 C 38 66, 92 20, 148 18 C 171 17, 187 36, 200 43 C 213 36, 229 17, 252 18 ' +
  'C 308 20, 362 66, 400 92 C 332 99, 272 90, 200 103 C 128 90, 68 99, 0 92 Z';
const LABIO_INF =
  'M 0 92 C 68 99, 128 90, 200 103 C 272 90, 332 99, 400 92 ' +
  'C 352 148, 282 182, 200 182 C 118 182, 48 148, 0 92 Z';
const LINHA_BOCA = 'M 6 93 C 68 99, 128 90, 200 103 C 272 90, 332 99, 394 93';
const REFLEXO = 'M 236 128 C 262 122, 290 124, 306 132 C 290 136, 262 137, 236 128 Z';

// ── trajetos da ponta do batom (Catmull-Rom amostrado → polilinha com comprimento conhecido) ──
type P = [number, number];
const amostra = (pts: P[], n = 14): P[] => {
  const out: P[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < n; k++) {
      const t = k / n;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
};

const trajeto = (pts: P[]) => {
  const poly = amostra(pts);
  const acum = [0];
  for (let i = 1; i < poly.length; i++) {
    acum.push(acum[i - 1] + Math.hypot(poly[i][0] - poly[i - 1][0], poly[i][1] - poly[i - 1][1]));
  }
  const total = acum[acum.length - 1];
  const d = 'M ' + poly.map((p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' L ');
  /** ponto a uma fração p do comprimento */
  const em = (p: number): P => {
    const alvo = Math.min(1, Math.max(0, p)) * total;
    let i = 1;
    while (i < acum.length - 1 && acum[i] < alvo) i++;
    const u = (alvo - acum[i - 1]) / Math.max(1e-6, acum[i] - acum[i - 1]);
    return [lerp(poly[i - 1][0], poly[i][0], u), lerp(poly[i - 1][1], poly[i][1], u)];
  };
  return { d, em };
};

const SUP = trajeto([
  [404, 92], [340, 68], [270, 52], [226, 58], [200, 70], [174, 58], [130, 52], [60, 68], [-4, 92],
]);
const INF = trajeto([
  [-4, 97], [58, 126], [128, 146], [200, 150], [272, 146], [342, 126], [404, 97],
]);

/** Batom desenhado de pé (ponta na origem, corpo para cima); a rotação vem de fora. */
const Batom: React.FC = () => (
  <g>
    {/* estojo */}
    <rect x={-27} y={-226} width={54} height={128} rx={7} fill={COLORS.rosa} />
    <rect x={-27} y={-122} width={54} height={12} fill={COLORS.vermelhoEscuro} />
    <rect x={14} y={-218} width={6} height={92} rx={3} fill={COLORS.branco} opacity={0.55} />
    {/* anel */}
    <rect x={-21} y={-98} width={42} height={16} fill={COLORS.branco} />
    {/* ponta de batom chanfrada */}
    <path d="M -17 -82 L -17 -12 C -17 4, -6 10, 4 6 L 17 -18 L 17 -82 Z" fill={COLORS.vermelho} />
    <path d="M 5 -82 L 5 3 L 17 -18 L 17 -82 Z" fill={COLORS.vermelhoEscuro} />
  </g>
);

export const Boca: React.FC<{ frame: number; capa?: boolean }> = ({ frame, capa }) => {
  const b = LAYOUT.boca;
  const f = capa ? 10_000 : frame; // a capa mostra a boca pronta, sem o batom
  const contorno = prog(f, T.contorno[0], T.contorno[1], EASE.editorial);
  if (contorno <= 0) return null;

  const tb = T.batom;
  const pSup = prog(f, tb.superior[0], tb.superior[1], EASE.sine);
  const pInf = prog(f, tb.inferior[0], tb.inferior[1], EASE.sine);
  const entra = prog(f, tb.entra[0], tb.entra[1], EASE.expoOut);
  const sai = prog(f, tb.sai[0], tb.sai[1], EASE.in);

  // posição da ponta do batom
  const fora: P = [560, -230];
  let ponta: P;
  if (f < tb.superior[0]) ponta = [lerp(fora[0], SUP.em(0)[0], entra), lerp(fora[1], SUP.em(0)[1], entra)];
  else if (f < tb.inferior[0]) {
    // entre os dois traços a ponta desce do canto esquerdo de cima para o de baixo
    const meio = prog(f, tb.superior[1], tb.inferior[0]);
    const a = SUP.em(pSup);
    ponta = meio > 0 ? [lerp(a[0], INF.em(0)[0], meio), lerp(a[1], INF.em(0)[1], meio)] : a;
  } else if (f < tb.sai[0]) ponta = INF.em(pInf);
  else ponta = [lerp(INF.em(1)[0], fora[0] + 40, sai), lerp(INF.em(1)[1], fora[1], sai)];
  const pintando = f >= tb.superior[0] && f < tb.sai[0];
  const angulo = 34 + (pintando ? 5 * Math.sin((f - tb.superior[0]) * 0.9) : 0);
  const mostraBatom = !capa && f >= tb.entra[0] && sai < 1;

  // beijo: aperta e solta
  const bj = pulse(f - T.beijo, 1.8);
  const sx = 1 + 0.1 * bj;
  const sy = 1 - 0.2 * bj;
  const reflexo = prog(f, T.beijo + 1, T.beijo + 5, EASE.expoOut);

  const tinta = (id: string, d: string, p: number, largura: number) =>
    p > 0.001 ? (
      <mask id={id} maskUnits="userSpaceOnUse" x={-60} y={-60} width={520} height={300}>
        <path
          d={d}
          pathLength={1}
          stroke="white"
          strokeWidth={largura}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeDasharray="1 1"
          strokeDashoffset={1 - p}
        />
      </mask>
    ) : null;

  return (
    <g transform={`translate(${b.x} ${b.y}) scale(${b.escala})`}>
      <g transform={`translate(200 100) scale(${sx} ${sy}) translate(-200 -100)`}>
        {tinta('tintaSup', SUP.d, pSup, 116)}
        {tinta('tintaInf', INF.d, pInf, 104)}
        {pSup > 0.001 ? (
          <g mask="url(#tintaSup)">
            <path d={LABIO_SUP} fill={COLORS.vermelhoEscuro} />
          </g>
        ) : null}
        {pInf > 0.001 ? (
          <g mask="url(#tintaInf)">
            <path d={LABIO_INF} fill={COLORS.vermelho} />
            <path d={LINHA_BOCA} stroke={COLORS.fundo} strokeWidth={5} fill="none" strokeLinecap="round" />
          </g>
        ) : null}
        {reflexo > 0 ? (
          <path
            d={REFLEXO}
            fill={COLORS.branco}
            opacity={0.85}
            transform={`translate(271 130) scale(${reflexo}) translate(-271 -130)`}
          />
        ) : null}
        {/* contorno em traço fino, desenhado da esquerda para a direita */}
        {[LABIO_SUP, LABIO_INF].map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1}
            fill="none"
            stroke={COLORS.branco}
            strokeWidth={3.2}
            strokeLinejoin="round"
            strokeDasharray="1 1"
            strokeDashoffset={1 - contorno}
          />
        ))}
      </g>
      {mostraBatom ? (
        <g transform={`translate(${ponta[0]} ${ponta[1]}) rotate(${angulo})`}>
          <Batom />
        </g>
      ) : null}
    </g>
  );
};
