// EPISÓDIO 05 completo (62 s). Cada cena é função pura do tempo absoluto t; as Sequences se sobrepõem
// por frações de segundo para que as saídas em degraus de uma cena terminem por baixo da entrada da próxima.
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import TL from './timeline.json';
import { COR } from './lib';
import { Fontes } from './Fontes';
import { Legendas } from './Legendas';
import { Cena1 } from './Piloto';
import { Cena2 } from './Cena2';
import { Cena3 } from './Cena3';
import { Cena5 } from './Cena5';
import { Cena6 } from './Cena6';
import { Cena7 } from './Cena7';

const E = TL.episodio;
type CenaT = React.FC<{ t: number; fps: number }>;
const ComTempo: React.FC<{ ini: number; C: CenaT }> = ({ ini, C }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return <C t={Math.round(ini * fps) / fps + f / fps} fps={fps} />;
};
const CENAS: { ini: number; fim: number; C: CenaT }[] = [
  { ini: E.c2Ini, fim: E.c3Ini, C: Cena2 },
  { ini: E.c3Ini, fim: E.c5Suspense + 0.4, C: Cena3 },
  { ini: E.c5Suspense, fim: E.c6Ini + 0.4, C: Cena5 },
  { ini: E.c6Ini, fim: E.c7Ini + 0.4, C: Cena6 },
  { ini: E.c7Ini, fim: E.duracao, C: Cena7 },
];

export const Episodio: React.FC = () => {
  const { fps } = useVideoConfig(); const t = useCurrentFrame() / fps;
  return (
    <AbsoluteFill style={{ backgroundColor: COR.fundo }}>
      <Fontes />
      <Audio src={staticFile('episodio_mix.wav')} />
      <Sequence from={0} durationInFrames={Math.round(E.c2Ini * fps)}><Cena1 /></Sequence>
      {CENAS.map(({ ini, fim, C }, k) => (
        <Sequence key={k} from={Math.round(ini * fps)} durationInFrames={Math.round(fim * fps) - Math.round(ini * fps)}>
          <ComTempo ini={ini} C={C} />
        </Sequence>
      ))}
      <Legendas t={t} ate={E.c7Assinatura - 0.25} />
    </AbsoluteFill>
  );
};
