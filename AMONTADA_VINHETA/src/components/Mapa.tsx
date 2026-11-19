import React from 'react';
import { COLORS, LAYOUT } from '../config/brand';
import { T } from '../config/coreografia';
import { MAPA, MAPA_D } from '../config/mapaAmontada';
import { EASE, lerp, prog } from '../lib/motion';

// pontos do contorno (caixa 1000 × ~1000) e comprimento acumulado, para achar a ponta do traço
const PTS: [number, number][] = MAPA_D.slice(2, -2)
  .split(' L ')
  .map((p) => p.split(' ').map(Number) as [number, number]);
PTS.push(PTS[0]);
const ACUM = [0];
for (let i = 1; i < PTS.length; i++) {
  ACUM.push(ACUM[i - 1] + Math.hypot(PTS[i][0] - PTS[i - 1][0], PTS[i][1] - PTS[i - 1][1]));
}
const TOTAL = ACUM[ACUM.length - 1];
const pontoEm = (p: number): [number, number] => {
  const alvo = p * TOTAL;
  let i = 1;
  while (i < ACUM.length - 1 && ACUM[i] < alvo) i++;
  const u = (alvo - ACUM[i - 1]) / Math.max(1e-6, ACUM[i] - ACUM[i - 1]);
  return [lerp(PTS[i - 1][0], PTS[i][0], u), lerp(PTS[i - 1][1], PTS[i][1], u)];
};

/**
 * O contorno do município de Amontada (do mapa enviado; só a silhueta, sem nomes).
 * Uma ponta de caneta desenha a divisa desde a abertura e fecha o traço no acerto em que
 * “Amontada…” pousa; em seguida o território se preenche da esquerda para a direita,
 * junto com a revelação do nome.
 */
export const Mapa: React.FC<{ frame: number; comPreenchimento: boolean }> = ({ frame, comPreenchimento }) => {
  const m = LAYOUT.mapa;
  const esc = m.largura / MAPA.largura;
  const p = prog(frame, T.mapa.traco[0], T.mapa.traco[1], EASE.editorial);
  const fill = prog(frame, T.mapa.preenche[0], T.mapa.preenche[1], EASE.editorial);
  if (p <= 0) return null;
  const [hx, hy] = pontoEm(p);
  const sw = m.traco / esc; // espessura constante em px na tela
  return (
    <g transform={`translate(${m.x} ${m.y}) scale(${esc})`}>
      {comPreenchimento && fill > 0 ? (
        <>
          <clipPath id="mapaFill">
            <rect x={-10} y={-10} width={(MAPA.largura + 20) * fill} height={MAPA.altura + 20} />
          </clipPath>
          <path d={MAPA_D} fill={COLORS.fundoClaro} clipPath="url(#mapaFill)" />
        </>
      ) : null}
      <path
        d={MAPA_D}
        fill="none"
        stroke={COLORS.rosa}
        strokeOpacity={m.opacidade}
        strokeWidth={sw}
        strokeLinejoin="round"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={1 - p}
      />
      {p < 1 ? <circle cx={hx} cy={hy} r={(m.traco * 2.2) / esc} fill={COLORS.rosa} /> : null}
    </g>
  );
};
