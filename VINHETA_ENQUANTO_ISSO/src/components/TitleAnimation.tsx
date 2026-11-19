// "Enquanto Isso em Amontada…": palavras sobem por máscara com overshoot, "em" estala,
// "Amontada" é revelada pela passada do batom, e as reticências caem uma por batida (colcheia).
import React from 'react';
import T from '../timeline.json';
import { prog, springish } from '../lib/anim';
import { revealX } from '../lib/choreo';
import { COLORS, TITLE } from '../lib/layout';

const anton: React.CSSProperties = { fontFamily: 'Anton', fontWeight: 400, lineHeight: 1, whiteSpace: 'nowrap', letterSpacing: '0.005em' };

const Rise: React.FC<{ t: number; t0: number; children: React.ReactNode; h: number }> = ({ t, t0, children, h }) => {
  const s = springish(prog(t, t0, t0 + 0.5), 3.6, 7.5);
  return (
    <span style={{ display: 'inline-block', overflow: 'hidden', height: h * 1.12, verticalAlign: 'top', paddingRight: 4 }}>
      <span style={{ display: 'inline-block', transform: `translateY(${((1 - s) * h * 1.15).toFixed(2)}px) rotate(${((1 - s) * 6).toFixed(2)}deg)`, transformOrigin: '0% 100%' }}>{children}</span>
    </span>
  );
};

export const TitleAnimation: React.FC<{ t: number; static?: boolean }> = ({ t, static: still }) => {
  const tt = still ? 99 : t;
  const [e0] = T.enquantoIsso;
  const em = springish(prog(tt, T.em, T.em + 0.55), 3.4, 6.2);
  const rx = still ? 2000 : revealX(t);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ ...anton, position: 'absolute', left: TITLE.left, top: TITLE.enquantoTop, fontSize: TITLE.enquantoSize, color: COLORS.wine }}>
        <Rise t={tt} t0={e0} h={TITLE.enquantoSize}>Enquanto</Rise>{' '}
        <Rise t={tt} t0={e0 + 0.09} h={TITLE.enquantoSize}>Isso</Rise>
      </div>
      <div style={{ position: 'absolute', left: TITLE.left + 6, top: TITLE.emTop, fontFamily: 'Poppins', fontStyle: 'italic', fontWeight: 600, fontSize: TITLE.emSize, lineHeight: 1, color: COLORS.pink, transform: `scale(${em.toFixed(4)}) rotate(${((1 - em) * -14).toFixed(2)}deg)`, transformOrigin: '20% 70%' }}>
        em
      </div>
      <div style={{ ...anton, position: 'absolute', left: 0, width: 1080, paddingLeft: TITLE.left, boxSizing: 'border-box', top: TITLE.amontadaTop, fontSize: TITLE.amontadaSize, letterSpacing: `${TITLE.track}em`, color: COLORS.red, clipPath: `inset(-120px ${Math.max(0, 1080 - rx).toFixed(1)}px -80px 0px)` }}>
        <span id="amontada-word">Amontada</span>
        {T.pontos.map((p, i) => {
          const s = still ? 1 : springish(prog(t, p, p + 0.45), 3.8, 7);
          return <span key={i} style={{ display: 'inline-block', transform: `translateY(${((1 - s) * -90).toFixed(2)}px) scale(${Math.max(0, s).toFixed(4)})`, transformOrigin: '50% 85%', opacity: s > 0 ? 1 : 0 }}>.</span>;
        })}
      </div>
    </div>
  );
};
