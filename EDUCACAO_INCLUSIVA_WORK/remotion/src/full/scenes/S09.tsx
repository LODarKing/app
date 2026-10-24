// CENA 9 (144,54–160,60): Lei Brasileira de Inclusão (Lei nº 13.146/2015): direitos, acessibilidade, educação,
// participação em igualdade de condições; a sociedade deve eliminar barreiras para que todos participem.
import React from 'react';
import { MotionBG, Chip, Icon, Burst, Card, Confetti, PAL, FONT, rnd } from '../fx';
import { FrontKid } from '../../chars/FrontKid';
import { GABRIEL, GIRL } from '../../chars/rigs';
import { Theo } from '../../chars/Theo';
import { kidPose, theoRoll, expr, GAB_S, GIRL_S } from '../acting';
import { ss, sm, outBack } from '../../lib/anim';
import { clamp, lerp, f } from '../../lib/paths';
import GEO from '../geo.json';

const RIGHTS: [number, string, string, string][] = [
  [3.45, 'DIREITOS', 'scale', PAL.royal], [4.45, 'ACESSIBILIDADE', 'ramp', '#3FA34D'], [5.5, 'EDUCAÇÃO', 'school', PAL.orange], [6.5, 'PARTICIPAÇÃO', 'people', '#7B4FD0'],
];

export const S09: React.FC<{ t: number }> = ({ t }) => {
  const br = GEO.brazil as { d: string; c: number[] };
  const mapK = sm((t - 0.1) / 0.9), mapOut = ss((t - 2.85) / 0.4);
  const lawK = outBack((t - 1.15) / 0.5);
  const grid = ss((t - 3.0) / 0.3), gridOut = ss((t - 9.0) / 0.35);
  const wall = ss((t - 9.0) / 0.35);
  const crumble = sm((t - 11.65) / 0.8);
  const party = t > 12.4;
  const ex = expr(t, { smile: [[9, 0.3], [11.6, 0.4], [12.2, 0.95]], open: [[9, 0.05], [12.2, 0.8]], worry: [[9, 0.4], [11.7, 0.5], [12.2, 0]] });
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <MotionBG t={t} c1={t < 9 ? '#159A5B' : '#1D4FC4'} c2={PAL.deep} />
      {/* Brasil + a Lei */}
      {mapOut < 1 ? <div style={{ position: 'absolute', inset: 0, opacity: 1 - mapOut, transform: `scale(${f(1 + 0.2 * mapOut)})` }}>
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
          <defs><clipPath id="brc"><path d={br.d} /></clipPath><linearGradient id="brg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2FBF61" /><stop offset="1" stopColor="#0E8A44" /></linearGradient></defs>
          <path d={br.d} fill="#000" opacity={0.25} transform="translate(10 16)" />
          <path d={br.d} fill="url(#brg)" stroke={PAL.deep} strokeWidth={8} strokeLinejoin="round" strokeDasharray={4000} strokeDashoffset={4000 * (1 - mapK)} fillOpacity={mapK} />
          <g clipPath="url(#brc)">
            <path d={`M${br.c[0]} ${br.c[1] - 230} L${br.c[0] + 300} ${br.c[1]} L${br.c[0]} ${br.c[1] + 230} L${br.c[0] - 300} ${br.c[1]} Z`} fill={PAL.yellow} opacity={0.9 * mapK} />
            <circle cx={br.c[0]} cy={br.c[1]} r={140 * mapK} fill="#2851D8" />
          </g>
        </svg>
        <Card t={t} t0={1.15} t1={99} x={540} y={1170} w={720} h={210} from="down" rot={-2}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '24px 30px' }}>
            <div style={{ width: 120, height: 120, borderRadius: 24, background: PAL.navy, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="doc" size={86} /></div>
            <div style={{ fontFamily: FONT, color: PAL.navy }}>
              <div style={{ fontWeight: 900, fontSize: 44, lineHeight: 1.05 }}>LEI BRASILEIRA DE INCLUSÃO</div>
              <div style={{ fontWeight: 700, fontSize: 28, marginTop: 6 }}>Lei nº 13.146/2015</div>
            </div>
          </div>
        </Card>
        {void lawK}
      </div> : null}
      {/* direitos garantidos */}
      {grid > 0 && gridOut < 1 ? <div style={{ position: 'absolute', inset: 0, opacity: grid * (1 - gridOut) }}>
        <Chip t={t} t0={3.0} t1={99} x={540} y={300} text={<>A LEI <span style={{ color: PAL.yellow }}>GARANTE</span></>} size={56} rot={-2} />
        {RIGHTS.map(([t0, lab, ic, c], i) => {
          const k = outBack((t - t0) / 0.42), x = i % 2 ? 790 : 290, y = i < 2 ? 640 : 980;
          if (k <= 0) return null;
          return <div key={i} style={{ position: 'absolute', left: x - 215, top: y - 150, width: 430, height: 300, background: '#fff', border: `6px solid ${PAL.deep}`, borderRadius: 32, boxShadow: `0 12px 0 ${PAL.deep}`, transform: `scale(${f(Math.max(0, k))}) rotate(${f(i % 2 ? 2 : -2)}deg)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            <div style={{ width: 150, height: 150, borderRadius: 75, background: c, border: `6px solid ${PAL.deep}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={ic} size={100} /></div>
            <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: i === 1 ? 36 : 42, color: PAL.navy }}>{lab}</div>
          </div>;
        })}
        {RIGHTS.map(([t0, , , c], i) => <Burst key={i} t={t} t0={t0} x={i % 2 ? 790 : 290} y={i < 2 ? 600 : 940} color={c} r={190} />)}
        <Chip t={t} t0={7.7} t1={99} x={540} y={1250} text={<>EM <span style={{ color: PAL.yellow }}>IGUALDADE</span> DE CONDIÇÕES</>} bg={PAL.green} size={44} rot={2} />
      </div> : null}
      {/* eliminar barreiras: muro se desfaz e os três passam */}
      {wall > 0 ? <div style={{ position: 'absolute', inset: 0, opacity: wall }}>
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
          <rect x={0} y={1320} width={1080} height={20} fill="#FFFFFF" opacity={0.6} />
          {Array.from({ length: 6 }, (_, row) => Array.from({ length: 6 }, (_, col) => {
            const i = row * 6 + col, bx = 230 + col * 104 + (row % 2) * 52 - 52, by = 1320 - 80 - row * 80;
            const fx = (rnd(i) - 0.5) * 1100 * crumble, fy = 1400 * crumble * crumble - 400 * crumble * rnd(i + 5);
            if (bx < 170 || bx > 900) return null;
            return <rect key={i} x={f(bx + fx)} y={f(by + fy)} width={100} height={76} rx={8} fill={i % 3 ? '#C8553D' : '#B44A35'} stroke={PAL.deep} strokeWidth={5} opacity={1 - crumble * 0.7} transform={`rotate(${f(crumble * (rnd(i + 3) - 0.5) * 300)} ${f(bx + 50 + fx)} ${f(by + 38 + fy)})`} />;
          }))}
          {crumble > 0.3 ? <g opacity={clamp((crumble - 0.3) * 2)}>
            <FrontKid rig={GIRL} id="s9g" pose={kidPose(t, { x: 230, y: 1320, scale: GIRL_S * 0.78, phase: 1, skirt: true, hop: [12.7, 14.2], actions: [{ kind: 'wave', side: 'L', t0: 12.6, t1: 16 }], ex })} />
            <Theo pose={theoRoll(t, (tt) => lerp(380, 470, sm((tt - 12.0) / 1.6)), { scale: 0.37, y: 1320, ex })} id="s9t" />
            <FrontKid rig={GABRIEL} id="s9k" pose={kidPose(t, { x: 870, y: 1320, scale: GAB_S * 0.78, hop: [12.85, 14.35], actions: [{ kind: 'wave', side: 'R', t0: 12.7, t1: 16 }], ex })} />
          </g> : null}
        </svg>
        <Chip t={t} t0={11.6} t1={99} x={540} y={330} text={<>ELIMINAR <span style={{ color: PAL.yellow }}>BARREIRAS</span></>} bg={PAL.red} size={56} rot={-2} />
        {party ? <Chip t={t} t0={13.3} t1={99} x={540} y={470} text={<>TODOS PODEM <span style={{ color: PAL.yellow }}>PARTICIPAR!</span></>} bg={PAL.green} size={50} rot={2} /> : null}
        <Confetti t={t} t0={12.3} ox={540} oy={1000} />
        <Burst t={t} t0={11.7} x={540} y={1100} color={PAL.yellow} r={380} />
      </div> : null}
    </div>
  );
};
