import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from 'remotion';
import { COLORS } from './config/brand';
import { T } from './config/coreografia';
import { HEIGHT, WIDTH } from './config/timeline';
import { Boca } from './components/Boca';
import { Cidade } from './components/Cidade';
import { bordasCortina, Cortina } from './components/Cortina';
import { Fio } from './components/Fio';
import { Fundo, Grao } from './components/Fundo';
import { Linhas } from './components/Linhas';
import { Mapa } from './components/Mapa';
import { FontGate } from './lib/fonts';
import { computeLayout } from './lib/layout';
import { EASE, prog } from './lib/motion';

/**
 * completo       — vinheta com fundo (MP4 principal).
 * alfaElementos  — só os elementos animados, fundo transparente (sobreposição).
 * alfaTransicao  — vinheta com fundo; a cortina final revela transparência, ou seja,
 *                  a primeira imagem da reportagem colocada embaixo na edição.
 */
export type Modo = 'completo' | 'alfaElementos' | 'alfaTransicao';

/** capa: mostra a boca já pintada, sem o batom (usado só no PNG da capa). */
export type VinhetaProps = { modo: Modo; comAudio: boolean; capa?: boolean };

const Cena: React.FC<{ frame: number; modo: Modo; capa?: boolean }> = ({ frame, modo, capa }) => {
  const lay = useMemo(() => computeLayout(), []);
  const b = bordasCortina(frame);
  // tudo que está à esquerda da borda vermelho da frente já foi coberto pela cortina
  const recorte = `inset(0px 0px 0px ${b.vermelhoFrente}px)`;
  const saida = 80 * prog(frame, T.saidaTexto[0], T.saidaTexto[1], EASE.in);

  return (
    <>
      {modo !== 'alfaElementos' ? (
        <AbsoluteFill style={{ clipPath: modo === 'alfaTransicao' ? recorte : undefined }}>
          <Fundo frame={frame} x0={lay.x0} />
          {/* o grão fica só no MP4: no ProRes ele quintuplica o arquivo e a reportagem já tem textura própria */}
          {modo === 'completo' ? <Grao frame={frame} /> : null}
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{ clipPath: recorte }}>
        <svg width={WIDTH} height={HEIGHT} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          {/* na saída cada camada ganha impulso diferente: o título se inclina para a cortina */}
          <g transform={`translate(${saida * 0.3} 0)`}>
            <Mapa frame={frame} comPreenchimento={modo !== 'alfaElementos'} />
          </g>
          <g transform={`translate(${saida * 1.2} 0)`}>
            <Boca frame={frame} capa={capa} />
          </g>
          <g transform={`translate(${saida * 0.8} 0)`}>
            <Fio frame={frame} lay={lay} />
          </g>
          <g transform={`translate(${saida * 0.5} 0)`}>
            <Linhas frame={frame} lay={lay} />
          </g>
          <g transform={`translate(${saida * 1.6} 0)`}>
            <Cidade frame={frame} lay={lay} />
          </g>
        </svg>
      </AbsoluteFill>
      <Cortina frame={frame} />
    </>
  );
};

export const Vinheta: React.FC<VinhetaProps> = ({ modo, comAudio, capa }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: modo === 'completo' ? COLORS.fundo : 'transparent' }}>
      <FontGate>
        <Cena frame={frame} modo={modo} capa={capa} />
      </FontGate>
      {comAudio ? <Audio src={staticFile('audio/trilha-vinheta.wav')} /> : null}
    </AbsoluteFill>
  );
};
