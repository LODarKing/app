import React from 'react';
import { AbsoluteFill, Audio, getRemotionEnvironment, staticFile, useCurrentFrame } from 'remotion';
import { COR, FPS, b, prog, easeInOut } from './tema';
import { Fontes } from './comp/Fontes';
import { Papel } from './comp/Papel';
import { Legenda } from './comp/Legenda';
import { Cena01 } from './cenas/Cena01';
import { Cena02 } from './cenas/Cena02';
import { Cena03 } from './cenas/Cena03';
import { Cena04 } from './cenas/Cena04';
import { Cena05 } from './cenas/Cena05';
import { Cena06 } from './cenas/Cena06';
import { Cena07 } from './cenas/Cena07';
import fala from './data/fala.json';

// duração: fim da fala + 5,6 s de encerramento (marca + respiro da trilha; total ≥ 70 s)
export const EPISODIO_QUADROS = Math.round((fala.fimFala + 5.6) * FPS);
export const FIM_CENA01 = 356 / FPS; // a cena 01 é exatamente o piloto aprovado

/** registro histórico (papel quente) de 1971 até Palmares; volta ao azul contemporâneo em "Hoje" */
export const hist = (t: number) =>
  easeInOut(prog(t, b(17), b(17) + 0.6)) * (1 - 0.5 * easeInOut(prog(t, 39.1, 42.3))) * (1 - easeInOut(prog(t, b(76.5), b(76.5) + 1.0)));

export const QuadroEp: React.FC<{ t: number; legenda?: boolean }> = ({ t, legenda = true }) => {
  const h = hist(t);
  return (
    <AbsoluteFill style={{ backgroundColor: COR.fundo }}>
      <Fontes />
      <AbsoluteFill style={{ backgroundColor: '#17120C', opacity: 0.45 * h }} />
      {t < FIM_CENA01 && <Cena01 t={t} />}
      <Cena02 t={t} />
      <Cena03 t={t} />
      <Cena04 t={t} />
      <Cena05 t={t} />
      <Cena06 t={t} />
      <Cena07 t={t} />
      <Papel forca={0.05 + 0.1 * h} quente={h} />
      {legenda && <Legenda t={t} />}
    </AbsoluteFill>
  );
};

export const Episodio: React.FC<{ legenda?: boolean }> = ({ legenda = true }) => {
  const f = useCurrentFrame();
  const { isRendering } = getRemotionEnvironment();
  return (
    <>
      {!isRendering && <Audio src={staticFile('mix_episodio.wav')} />}
      <QuadroEp t={f / FPS} legenda={legenda} />
    </>
  );
};
