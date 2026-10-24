// CENA 4 (51,56–69,97): discriminação (tratamento desigual, direitos negados) e bullying
// (intencional e repetido: humilhações, apelidos ofensivos — só rabiscos e símbolos, nunca palavras —,
// exclusão, ataques virtuais). Tudo isso precisa ser combatido.
import React from 'react';
import { MotionBG, Chip, Icon, Burst, Stamp, PAL, FONT, rnd } from '../fx';
import { FrontKid } from '../../chars/FrontKid';
import { GABRIEL, GIRL } from '../../chars/rigs';
import { Theo } from '../../chars/Theo';
import { kidPose, theoRoll, expr, GAB_S, GIRL_S } from '../acting';
import { ss, sm, outBack } from '../../lib/anim';
import { clamp, lerp, f } from '../../lib/paths';

const Scribble: React.FC<{ seed: number; w: number; color: string }> = ({ seed, w, color }) => {
  let d = 'M0 0';
  for (let i = 1; i < 14; i++) d += ` Q${f(i * w / 14 - w / 28)} ${f((rnd(seed + i) - 0.5) * 34)} ${f(i * w / 14)} ${f((rnd(seed + i + 40) - 0.5) * 18)}`;
  return <path d={d} stroke={color} strokeWidth={7} fill="none" strokeLinecap="round" />;
};

export const S04: React.FC<{ t: number }> = ({ t }) => {
  const aOut = ss((t - 5.7) / 0.35);
  const tilt = sm((t - 2.6) / 0.6) * 16 + Math.sin(t * 3) * 1.5 * sm((t - 2.6) / 0.6);
  const bIn = ss((t - 5.8) / 0.35), bOut = ss((t - 15.6) / 0.35);
  const cIn = ss((t - 15.6) / 0.4);
  const det = expr(t, { smile: [[15.6, 0.3], [17.0, 0.6]], open: [[15.6, 0.05], [16.8, 0.5]], worry: [[15.6, 0]], browUp: [[15.6, -2]] });
  const cards: [number, string, React.ReactNode][] = [
    [10.5, 'HUMILHAÇÕES', <svg width={180} height={130} viewBox="-10 -10 200 140"><path d="M0 10 Q0 0 10 0 L170 0 Q180 0 180 10 L180 80 Q180 90 170 90 L70 90 L40 120 L44 90 L10 90 Q0 90 0 80 Z" fill="#fff" stroke={PAL.deep} strokeWidth={6} /><g transform="translate(22 30)"><Scribble seed={3} w={136} color={PAL.red} /></g><g transform="translate(22 58)"><Scribble seed={9} w={110} color={PAL.red} /></g></svg>],
    [11.7, 'APELIDOS OFENSIVOS', <svg width={180} height={130} viewBox="-10 -10 200 140"><path d="M0 10 Q0 0 10 0 L170 0 Q180 0 180 10 L180 80 Q180 90 170 90 L130 90 L150 120 L100 90 L10 90 Q0 90 0 80 Z" fill="#fff" stroke={PAL.deep} strokeWidth={6} /><text x={90} y={62} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill={PAL.red}>#@!%</text></svg>],
    [13.45, 'EXCLUSÃO', <svg width={180} height={130} viewBox="0 0 180 130"><circle cx={70} cy={65} r={52} fill="none" stroke="#fff" strokeWidth={6} strokeDasharray="12 9" />{[[50, 45], [90, 45], [50, 85], [90, 85]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={14} fill="#fff" />)}<circle cx={158} cy={65 + Math.sin(t * 4) * 4} r={14} fill={PAL.yellow} /></svg>],
    [14.45, 'ATAQUES VIRTUAIS', <svg width={180} height={130} viewBox="0 0 180 130"><rect x={60} y={6} width={62} height={118} rx={12} fill="#fff" stroke={PAL.deep} strokeWidth={6} /><rect x={68} y={20} width={46} height={84} rx={4} fill="#2B2F4A" />{[0, 1, 2].map((i) => <rect key={i} x={i % 2 ? 22 : 128} y={20 + i * 34} width={44} height={24} rx={8} fill={PAL.red} transform={`translate(0 ${f(Math.sin(t * 6 + i) * 3)})`} />)}</svg>],
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <MotionBG t={t} c1={t < 15.6 ? '#7A2A4A' : '#1F8F5F'} c2={PAL.deep} accent={t < 15.6 ? 'rgba(229,72,77,0.10)' : 'rgba(255,255,255,0.08)'} />
      {/* discriminação */}
      {aOut < 1 ? <div style={{ position: 'absolute', inset: 0, opacity: 1 - aOut }}>
        <Chip t={t} t0={0.2} t1={99} x={540} y={300} text="DISCRIMINAÇÃO" bg={PAL.red} size={70} rot={-3} />
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
          <g transform={`translate(540 520) scale(${f(clamp(outBack((t - 1.0) / 0.5), 0, 1.2))})`}>
            <rect x={-12} y={0} width={24} height={460} rx={10} fill="#FFFFFF" />
            <rect x={-120} y={450} width={240} height={30} rx={12} fill="#FFFFFF" />
            <g transform={`rotate(${f(-tilt)})`}>
              <rect x={-330} y={-14} width={660} height={28} rx={14} fill="#FFFFFF" />
              {[-1, 1].map((sgn) => {
                const x = sgn * 300, drop = sgn * Math.sin((tilt * Math.PI) / 180) * 300;
                return <g key={sgn} transform={`rotate(${f(tilt)} ${x} 0)`}>
                  <path d={`M${x} 0 L${x - 90} 170 M${x} 0 L${x + 90} 170`} stroke="#FFFFFF" strokeWidth={6} />
                  <path d={`M${x - 120} 170 L${x + 120} 170 Q${x + 100} 230 ${x} 232 Q${x - 100} 230 ${x - 120} 170 Z`} fill={sgn < 0 ? PAL.yellow : '#FFFFFF'} stroke={PAL.deep} strokeWidth={6} />
                  {sgn < 0 ? <g transform={`translate(${x - 40} 92) scale(0.8)`}><Icon name="star" color={PAL.orange} size={100} /></g> : null}
                  {void drop}
                </g>;
              })}
            </g>
            <circle r={28} fill={PAL.yellow} stroke={PAL.deep} strokeWidth={6} />
          </g>
        </svg>
        <Chip t={t} t0={2.65} t1={99} x={540} y={1120} text="TRATAMENTO DESIGUAL" bg="#FFFFFF" color={PAL.red} size={44} rot={2} />
        <Stamp t={t} t0={5.2} t1={99} x={540} y={760} text="DIREITOS NEGADOS" color={PAL.red} rot={-10} size={66} />
      </div> : null}
      {/* bullying */}
      {bIn > 0 && bOut < 1 ? <div style={{ position: 'absolute', inset: 0, opacity: bIn * (1 - bOut) }}>
        <Chip t={t} t0={6.75} t1={99} x={540} y={290} text="BULLYING" bg={PAL.red} size={84} rot={-3} />
        {/* intencional e repetido: ondas que se repetem */}
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
          {t > 7.7 && t < 10.3 ? [0, 1, 2].map((i) => {
            const k = ((t - 7.8 - i * 0.35) % 1.05) / 1.05;
            return k > 0 ? <circle key={i} cx={540} cy={560} r={60 + 180 * k} fill="none" stroke={PAL.red} strokeWidth={10 * (1 - k)} opacity={1 - k} /> : null;
          }) : null}
        </svg>
        <Chip t={t} t0={7.75} t1={10.3} x={540} y={560} text={<>INTENCIONAL <span style={{ color: PAL.yellow }}>E REPETIDO</span></>} size={46} rot={2} />
        {t < 10.45 ? <div style={{ position: 'absolute', left: 0, right: 0, top: 760, display: 'flex', justifyContent: 'center', gap: 24, opacity: 1 - ss((t - 10.1) / 0.3) }}>
          {['SEG', 'TER', 'QUA', 'QUI'].map((d, i) => {
            const k = outBack((t - 8.0 - i * 0.12) / 0.4), mk = outBack((t - 8.6 - i * 0.38) / 0.3);
            return <div key={d} style={{ position: 'relative', width: 190, height: 220, background: '#FFFFFF', borderRadius: 26, border: `6px solid ${PAL.deep}`, boxShadow: `0 10px 0 ${PAL.deep}`, transform: `scale(${f(Math.max(0, k))})`, overflow: 'hidden' }}>
              <div style={{ background: PAL.red, color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 40, textAlign: 'center', padding: '8px 0' }}>{d}</div>
              {mk > 0 ? <svg width={190} height={150} style={{ position: 'absolute', left: 0, top: 66 }}><g transform={`translate(95 70) scale(${f(mk)})`}><path d="M-42 -42 L42 42 M42 -42 L-42 42" stroke={PAL.red} strokeWidth={18} strokeLinecap="round" /></g></svg> : null}
            </div>;
          })}
        </div> : null}
        {cards.map(([t0, label, art], i) => {
          const k = outBack((t - t0) / 0.42), x = i % 2 ? 790 : 290, y = i < 2 ? 640 : 1000;
          if (k <= 0) return null;
          return <div key={i} style={{ position: 'absolute', left: x - 215, top: y - 160, width: 430, height: 320, transform: `scale(${f(Math.max(0, k))}) rotate(${f(i % 2 ? 2 : -2)}deg)`, background: '#3B1530', border: `6px solid ${PAL.deep}`, borderRadius: 32, boxShadow: `0 12px 0 ${PAL.deep}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            {art}
            <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 36, color: '#fff', textAlign: 'center' }}>{label}</div>
          </div>;
        })}
      </div> : null}
      {/* tudo isso precisa ser combatido */}
      {cIn > 0 ? <div style={{ position: 'absolute', inset: 0, opacity: cIn }}>
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
          <ellipse cx={540} cy={1320} rx={470} ry={44} fill="#000" opacity={0.15} />
          <FrontKid rig={GIRL} id="s4g" pose={kidPose(t, { x: 200, y: 1320, scale: GIRL_S * 0.8, phase: 1, skirt: true, actions: [{ kind: 'present', side: 'L', t0: 16.6, t1: 18.6, angle: 120 }], ex: det })} />
          <Theo pose={theoRoll(t, () => 420, { scale: 0.37, y: 1320, ex: det, head: -2 })} id="s4t" />
          <FrontKid rig={GABRIEL} id="s4k" pose={kidPose(t, { x: 880, y: 1320, scale: GAB_S * 0.8, actions: [{ kind: 'present', side: 'R', t0: 16.5, t1: 18.6, angle: -120 }], ex: det })} />
        </svg>
        <Stamp t={t} t0={16.95} t1={99} x={540} y={560} text="COMBATER!" color={PAL.green} rot={-8} size={96} />
        <Chip t={t} t0={16.2} t1={99} x={540} y={330} text={<>RESPEITO <span style={{ color: PAL.yellow }}>SEMPRE</span></>} size={52} rot={2} />
        <Burst t={t} t0={16.95} x={540} y={560} color={PAL.green} r={320} />
      </div> : null}
    </div>
  );
};
