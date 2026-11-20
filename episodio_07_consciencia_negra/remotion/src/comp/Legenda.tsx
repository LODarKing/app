import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COR, FONTE, clamp, easeOut } from '../tema';
import blocos from '../data/legendas.json';

type Pal = { t: string; cor: string | null; ini: number | null; fim: number | null };
type Bloco = { texto: string; ini: number | null; fim: number | null; sai: number | null; palavras: Pal[]; naTela?: boolean };

/** Legenda dinâmica: o bloco sobe da linha de base (máscara) e cada palavra acende quando é falada.
 *  Branco predominante; dourado e ciano só nos termos-chave. Faixa segura de Shorts: centro em y≈1390. */
export const Legenda: React.FC<{ t: number; y?: number }> = ({ t, y = 1390 }) => {
  const bl = (blocos as Bloco[]).find((b) => b.ini !== null && !b.naTela && t >= b.ini - 0.05 && t < (b.sai ?? 1e9));
  if (!bl) return null;
  const u = easeOut(clamp((t - (bl.ini! - 0.05)) / 0.22));
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: y - 190, height: 380, background: 'linear-gradient(180deg, rgba(9,14,26,0) 0%, rgba(9,14,26,0.82) 35%, rgba(9,14,26,0.82) 65%, rgba(9,14,26,0) 100%)' }} />
      <div style={{ position: 'absolute', left: 70, right: 70, top: y - 70, height: 140, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ transform: `translateY(${(1 - u) * 60}px)`, textAlign: 'center', fontFamily: FONTE.ui, fontWeight: 600, fontSize: 58, lineHeight: 1.2, letterSpacing: -0.5, color: COR.branco, textShadow: '0 3px 0 rgba(4,7,14,0.85), 0 0 2px rgba(4,7,14,0.9)' }}>
          {bl.palavras.map((p, i) => {
            const aceso = p.ini === null || t >= p.ini - 0.03;
            const cor = p.cor === 'dourado' ? COR.dourado : p.cor === 'ciano' ? COR.ciano : COR.branco;
            return (
              <span key={i} style={{ color: cor, opacity: aceso ? 1 : 0.42 }}>
                {p.t}{i < bl.palavras.length - 1 ? ' ' : ''}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
