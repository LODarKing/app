import React from 'react';
import { AbsoluteFill, Audio, getRemotionEnvironment, staticFile, useCurrentFrame } from 'remotion';
import { COR, FPS, b, prog, easeInOut } from './tema';
import { Fontes } from './comp/Fontes';
import { Papel } from './comp/Papel';
import { Legenda } from './comp/Legenda';
import { Cena01 } from './cenas/Cena01';

// 356 quadros = 11,867 s: termina no silêncio depois de "Em 1971," (fala acaba em 11,76 s; "durante" começa em 11,94 s)
export const PILOTO_QUADROS = 356;

/** Contrato de render: o quadro é função pura de t = frame / FPS (equivale a window.seek(t)). */
export const Quadro: React.FC<{ t: number; legenda?: boolean }> = ({ t, legenda = true }) => {
  const hist = easeInOut(prog(t, b(17), b(17) + 0.6)); // 1971: o registro esquenta para o documental
  return (
    <AbsoluteFill style={{ backgroundColor: COR.fundo }}>
      <Fontes />
      <AbsoluteFill style={{ backgroundColor: '#17120C', opacity: 0.45 * hist }} />
      <Cena01 t={t} />
      <Papel forca={0.06 + 0.1 * hist} quente={hist} />
      {legenda && <Legenda t={t} />}
    </AbsoluteFill>
  );
};

export const Piloto: React.FC = () => {
  const f = useCurrentFrame();
  const { isRendering } = getRemotionEnvironment();
  return (
    <>
      {/* no Studio toca a mixagem; no render a imagem sai muda e o som entra no FFmpeg (AAC 48 kHz) */}
      {!isRendering && <Audio src={staticFile('mix_piloto.wav')} />}
      <Quadro t={f / FPS} />
    </>
  );
};
