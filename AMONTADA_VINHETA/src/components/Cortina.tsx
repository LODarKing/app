import React from 'react';
import { COLORS } from '../config/brand';
import { T } from '../config/coreografia';
import { HEIGHT, WIDTH } from '../config/timeline';
import { EASE, prog } from '../lib/motion';

/** Bordas da cortina de saída (x em px) no quadro dado. */
export const bordasCortina = (frame: number) => {
  const c = T.cortina;
  const faixa = 54; // largura máxima da faixa coral, em px
  const pf = prog(frame, c.frente[0], c.frente[1], EASE.wipe);
  const pt = prog(frame, c.tras[0], c.tras[1], EASE.wipe);
  // a faixa coral só aparece com a borda em movimento: afina na largada e na chegada
  const largura = (p: number) => faixa * Math.min(1, 3 * Math.sin(Math.PI * p));
  const douradoFrente = WIDTH * pf;
  const douradoTras = WIDTH * pt;
  return {
    coralFrente: douradoFrente + largura(pf),
    douradoFrente,
    douradoTras,
    coralTras: douradoTras - largura(pt),
  };
};

/**
 * Cortina direcional: uma faixa coral fina abre caminho, o painel dourado cobre o quadro
 * no acerto final e sai pela direita, com o coral fechando. O que fica à esquerda da
 * borda coral de trás já é “depois da vinheta”: na versão com transparência, é a reportagem.
 */
export const Cortina: React.FC<{ frame: number }> = ({ frame }) => {
  const b = bordasCortina(frame);
  if (b.coralFrente <= 0 || b.coralTras >= WIDTH) return null;
  return (
    <svg width={WIDTH} height={HEIGHT} style={{ position: 'absolute', inset: 0 }}>
      <rect x={b.coralTras} y={0} width={Math.max(0, b.coralFrente - b.coralTras)} height={HEIGHT} fill={COLORS.coral} />
      <rect
        x={b.douradoTras}
        y={0}
        width={Math.max(0, b.douradoFrente - b.douradoTras)}
        height={HEIGHT}
        fill={COLORS.dourado}
      />
    </svg>
  );
};
