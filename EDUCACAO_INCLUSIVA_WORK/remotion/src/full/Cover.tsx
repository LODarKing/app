// Capa (thumbnail 1080x1920) no estilo aprovado.
import React from 'react';
import { AbsoluteFill, Img, staticFile, continueRender, delayRender } from 'remotion';
import { SetBack, SetFront } from '../scene/Clubhouse';
import { FrontKid } from '../chars/FrontKid';
import { GABRIEL, GIRL } from '../chars/rigs';
import { Theo } from '../chars/Theo';
import { kidPose, theoRoll, expr, THEO_S, GAB_S, GIRL_S } from './acting';
import { camT } from '../scene/Clubhouse';
import { PAL, FONT } from './fx';

const h = typeof document !== 'undefined' ? delayRender('fonts') : 0;
if (typeof document !== 'undefined') {
  const faces = [['Poppins-Black.ttf', '900'], ['Poppins-ExtraBold.ttf', '800']].map(([file, w]) => new FontFace('Poppins', `url(${staticFile(file)})`, { weight: w }));
  Promise.all(faces.map((ff) => ff.load())).then((l) => { l.forEach((ff) => (document as any).fonts.add(ff)); continueRender(h); }).catch(() => continueRender(h));
}
export const Cover: React.FC = () => {
  const t = 3.0, cam = { x: 640, y: -520, zoom: 0.86 };
  const ex = expr(t, { smile: [[0, 1]], open: [[0, 0.85]], look: [[0, [0, 2]]] });
  const S = 0.0833;
  return (
    <AbsoluteFill style={{ background: '#D4F1FB' }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <SetBack cam={cam} t={t} />
        <g transform={camT(cam, 1)}>
          <path d={`M${610 - 244 / S} 0 L610 -244 L650 -244 L650 0 Z`} fill="#D9D3C6" stroke="#8E887C" strokeWidth={3.5} />
          <line x1={610 - 244 / S - 30} y1={-280} x2={640} y2={-524} stroke="#5F6B78" strokeWidth={12} />
          <FrontKid rig={GIRL} id="cg" pose={kidPose(t, { x: 870, y: -244, scale: GIRL_S, phase: 1, skirt: true, actions: [{ kind: 'wave', side: 'L', t0: 0, t1: 99 }], ex })} />
          <FrontKid rig={GABRIEL} id="ck" pose={kidPose(t, { x: 1060, y: -244, scale: GAB_S, actions: [{ kind: 'wave', side: 'R', t0: 0, t1: 99 }], ex })} />
          <g transform={`rotate(${-Math.atan(S) * 180 / Math.PI} 470 ${-S * (470 - 610 + 244 / S)})`}><Theo pose={theoRoll(t, () => 470, { scale: THEO_S, y: -S * (470 - 610 + 244 / S), ex, head: -4, lean: 6 })} id="ct" /></g>
        </g>
        <SetFront cam={cam} t={t} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(25,12,60,.75) 0%, rgba(25,12,60,0) 38%, rgba(25,12,60,0) 70%, rgba(25,12,60,.8) 100%)' }} />
      <Img src={staticFile('emblema_recortado.png')} style={{ position: 'absolute', left: 540 - 120, top: 90, width: 240, height: 200, objectFit: 'contain', filter: 'drop-shadow(0 10px 18px rgba(0,0,0,.4))' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 320, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 112, lineHeight: 1.02, color: '#fff', WebkitTextStroke: `12px ${PAL.deep}`, paintOrder: 'stroke fill', textShadow: `0 10px 0 ${PAL.deep}` }}>EDUCAÇÃO<br /><span style={{ color: PAL.yellow }}>INCLUSIVA</span></div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1560, textAlign: 'center' }}>
        <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 66, color: PAL.navy, background: PAL.yellow, padding: '12px 36px 6px', borderRadius: 26, border: `7px solid ${PAL.deep}`, boxShadow: `0 10px 0 ${PAL.deep}` }}>NINGUÉM FICA DE FORA!</span>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1720, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 30, color: '#fff' }}>SÉRIE ESPECIALIDADES DOS DESBRAVADORES</div>
    </AbsoluteFill>
  );
};
