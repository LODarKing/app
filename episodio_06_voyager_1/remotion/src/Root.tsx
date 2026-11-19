// Projeto Remotion editável. O desenho de cada quadro vem dos mesmos componentes do render de produção
// (../../componentes_animacao), que são função pura do tempo: quadro f -> seek(f / 30).
import React from 'react';
import { Composition } from 'remotion';
import { Filme } from './Filme';
import TEMPOS from '../../componentes_animacao/dados/tempos.json';

export const Root: React.FC = () => (
  <>
    <Composition id="Episodio" component={Filme} durationInFrames={Math.round(TEMPOS.dur * 30)} fps={30} width={1080} height={1920}
      defaultProps={{ audio: 'audio/mix.wav', legenda: true }} />
    <Composition id="Piloto" component={Filme} durationInFrames={377} fps={30} width={1080} height={1920}
      defaultProps={{ audio: 'audio/mix_piloto.wav', legenda: true }} />
  </>
);
