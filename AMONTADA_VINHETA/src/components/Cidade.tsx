import React from 'react';
import { COLORS, LAYOUT } from '../config/brand';
import { T } from '../config/coreografia';
import { HEIGHT } from '../config/timeline';
import { TXT, type Layout } from '../lib/layout';
import { EASE, lerp, prog, pulse } from '../lib/motion';
import { estiloTitulo } from './Linhas';

/**
 * “Amontada…”: uma faixa dourada corre da esquerda e cobre a linha (o nome aparece
 * vazado em petróleo dentro dela), depois recolhe para a direita e deixa o nome em dourado.
 * Os três pontos da reticência são retângulos idênticos aos da fonte e pulam no motivo final.
 */
export const Cidade: React.FC<{ frame: number; lay: Layout }> = ({ frame, lay }) => {
  const g = LAYOUT.tamanhoDourado;
  const pad = 24;
  const topo = LAYOUT.base4 - lay.capDourado - pad;
  const alt = lay.capDourado + 2 * pad;
  const esq0 = lay.x0 - pad;
  const dir1 = lay.direita + pad;

  const entra = prog(frame, T.blocoEntra[0], T.blocoEntra[1], EASE.expoOut);
  const sai = prog(frame, T.blocoSai[0], T.blocoSai[1], EASE.editorial);
  const R = lerp(esq0, dir1, entra);
  const L = lerp(esq0, dir1, sai);

  const desliza = prog(frame, T.cidadeDesliza[0], T.cidadeDesliza[1], EASE.expoOut);
  const dx = lerp(-56, 0, desliza);
  const track = lerp(0.035 * g, 0, desliza);

  if (frame < T.blocoEntra[0]) return null;

  const palavra = (cor: string) => (
    <g transform={`translate(${dx} 0)`}>
      {TXT.cidade.split('').map((ch, i) => (
        <text key={i} x={lay.x0 + lay.xsCidade[i] + i * track} y={LAYOUT.base4} fill={cor} fontSize={g} style={estiloTitulo}>
          {ch}
        </text>
      ))}
      {lay.pontos.map((p, k) => {
        // pulo de “digitando…”: cada ponto sobe e volta, sem deformar
        const pop = pulse(frame - T.fimPontos[k], 1.7);
        const s = 1;
        const lift = -30 * pop;
        const x = p.x + TXT.cidade.length * track;
        return (
          <rect
            key={k}
            x={x + (p.w - p.w * s) / 2}
            y={p.y + p.h - p.h * s + lift}
            width={p.w * s}
            height={p.h * s}
            fill={cor}
          />
        );
      })}
    </g>
  );

  return (
    <g>
      {/* nome em dourado: só onde a faixa já passou e recolheu */}
      <clipPath id="cidOut">
        <rect x={0} y={0} width={Math.max(0, L)} height={HEIGHT} />
      </clipPath>
      <g clipPath="url(#cidOut)">{palavra(COLORS.dourado)}</g>
      {/* faixa dourada + nome vazado */}
      {R > L ? (
        <>
          <rect x={L} y={topo} width={R - L} height={alt} fill={COLORS.dourado} />
          <clipPath id="cidIn">
            <rect x={L} y={topo} width={R - L} height={alt} />
          </clipPath>
          <g clipPath="url(#cidIn)">{palavra(COLORS.petroleo)}</g>
        </>
      ) : null}
    </g>
  );
};
