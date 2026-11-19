import React from 'react';
import { COLORS } from '../config/brand';
import { T } from '../config/coreografia';
import { HEIGHT, WIDTH } from '../config/timeline';
import { EASE, prog } from '../lib/motion';

/** Bordas da cortina de saída (x em px) no quadro dado. */
export const bordasCortina = (frame: number) => {
  const c = T.cortina;
  const faixa = 54; // largura máxima da faixa vermelho, em px
  const pf = prog(frame, c.frente[0], c.frente[1], EASE.wipe);
  const pt = prog(frame, c.tras[0], c.tras[1], EASE.wipe);
  // a faixa vermelho só aparece com a borda em movimento: afina na largada e na chegada
  const largura = (p: number) => faixa * Math.min(1, 3 * Math.sin(Math.PI * p));
  const rosaFrente = WIDTH * pf;
  const rosaTras = WIDTH * pt;
  return {
    vermelhoFrente: rosaFrente + largura(pf),
    rosaFrente,
    rosaTras,
    vermelhoTras: rosaTras - largura(pt),
  };
};

/**
 * Cortina direcional: uma faixa vermelho fina abre caminho, o painel rosa cobre o quadro
 * no acerto final e sai pela direita, com o vermelho fechando. O que fica à esquerda da
 * borda vermelho de trás já é “depois da vinheta”: na versão com transparência, é a reportagem.
 */
export const Cortina: React.FC<{ frame: number }> = ({ frame }) => {
  const b = bordasCortina(frame);
  if (b.vermelhoFrente <= 0 || b.vermelhoTras >= WIDTH) return null;
  return (
    <svg width={WIDTH} height={HEIGHT} style={{ position: 'absolute', inset: 0 }}>
      <rect x={b.vermelhoTras} y={0} width={Math.max(0, b.vermelhoFrente - b.vermelhoTras)} height={HEIGHT} fill={COLORS.vermelho} />
      <rect
        x={b.rosaTras}
        y={0}
        width={Math.max(0, b.rosaFrente - b.rosaTras)}
        height={HEIGHT}
        fill={COLORS.rosa}
      />
    </svg>
  );
};
