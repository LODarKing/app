// CENA 3 (33,70–51,56): tipos de deficiência; deficiências não visíveis (cordão de girassol);
// habilidades e necessidades de cada pessoa; respeitar as diferenças.
import React from 'react';
import { MotionBG, Chip, Icon, Burst, Confetti, PAL, FONT, rnd } from '../fx';
import { FrontKid } from '../../chars/FrontKid';
import { GABRIEL, GIRL } from '../../chars/rigs';
import { Theo } from '../../chars/Theo';
import { kidPose, theoRoll, expr, GAB_S, GIRL_S } from '../acting';
import { ss, sm, outBack } from '../../lib/anim';
import { clamp, lerp, f } from '../../lib/paths';

const TYPES: [number, string, string, string, number, number][] = [
  [2.05, 'FÍSICA', 'wheelchair', PAL.orange, 290, 560], [2.9, 'VISUAL', 'cane', PAL.royal, 790, 560],
  [3.8, 'AUDITIVA', 'ear', PAL.red, 290, 880], [4.85, 'INTELECTUAL', 'book', '#3FA34D', 790, 880], [5.83, 'MÚLTIPLA', 'multi', '#7B4FD0', 540, 1190],
];

/** cordão de girassol, no sistema de coordenadas da folha da Desbravadora */
export const SunflowerLanyard: React.FC<{ glow?: number }> = ({ glow = 0 }) => {
  const dots = [];
  for (let i = 0; i < 9; i++) {
    const k = i / 8;
    dots.push(<circle key={`l${i}`} cx={f(lerp(338, 404, k))} cy={f(lerp(650, 880, k))} r={7} fill="#FFC21A" />);
    dots.push(<circle key={`r${i}`} cx={f(lerp(502, 436, k))} cy={f(lerp(650, 880, k))} r={7} fill="#FFC21A" />);
  }
  return (
    <g>
      {glow > 0 ? <ellipse cx={420} cy={860} rx={150} ry={170} fill="#FFE97A" opacity={0.45 * glow} filter="url(#s3blur)" /> : null}
      <path d="M338 650 L404 880 M502 650 L436 880" stroke="#2E8B3E" strokeWidth={18} strokeLinecap="round" />
      {dots}
      <rect x={386} y={872} width={68} height={92} rx={12} fill="#FFFFFF" stroke="#2E8B3E" strokeWidth={6} />
      <g transform="translate(395 895) scale(0.5)"><Icon name="sunflower" size={100} /></g>
    </g>
  );
};

export const S03: React.FC<{ t: number }> = ({ t }) => {
  const gridOut = ss((t - 6.3) / 0.35);
  const hidIn = ss((t - 6.35) / 0.35), hidOut = ss((t - 10.85) / 0.35);
  const allIn = ss((t - 10.8) / 0.4);
  const exAll = expr(t, { smile: [[10.8, 0.8], [14.3, 0.9]], open: [[10.8, 0.5], [12.5, 0.3], [15.6, 0.8]], look: [[10.8, [0, 1]]] });
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <MotionBG t={t} c1={t < 6.4 ? '#5B3FC4' : t < 10.9 ? '#1E8E5A' : '#E86F2A'} c2={PAL.deep} />
      <svg width={0} height={0}><defs><filter id="s3blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18" /></filter></defs></svg>
      {/* tipos de deficiência */}
      {gridOut < 1 ? <div style={{ position: 'absolute', inset: 0, opacity: 1 - gridOut, transform: `scale(${f(1 - 0.1 * gridOut)})` }}>
        <Chip t={t} t0={0.45} t1={99} x={540} y={300} text={<>TIPOS DE <span style={{ color: PAL.yellow }}>DEFICIÊNCIA</span></>} size={56} rot={-2} />
        {TYPES.map(([t0, label, icon, c, x, y], i) => {
          const k = outBack((t - t0) / 0.45);
          if (k <= 0) return null;
          const active = t >= t0 && t < (TYPES[i + 1]?.[0] ?? 6.4);
          const wob = active ? Math.sin((t - t0) * 9) * 2.5 : 0;
          return <div key={i} style={{ position: 'absolute', left: x - 210, top: y - 140, width: 420, height: 280, transform: `scale(${f(k * (active ? 1.06 : 1))}) rotate(${f(wob + (i % 2 ? 2 : -2))}deg)`, background: '#FFFFFF', borderRadius: 34, border: `6px solid ${PAL.deep}`, boxShadow: `0 12px 0 ${PAL.deep}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            <div style={{ width: 150, height: 150, borderRadius: 75, background: c, border: `6px solid ${PAL.deep}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={100} /></div>
            <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 46, color: PAL.navy }}>{label}</div>
          </div>;
        })}
        {TYPES.map(([t0, , , c, x, y], i) => <Burst key={i} t={t} t0={t0} x={x} y={y - 40} color={c} r={190} />)}
      </div> : null}
      {/* deficiências que não são visíveis */}
      {hidIn > 0 && hidOut < 1 ? <div style={{ position: 'absolute', inset: 0, opacity: hidIn * (1 - hidOut) }}>
        <Chip t={t} t0={6.5} t1={99} x={540} y={290} text={<>NEM TODA DEFICIÊNCIA <span style={{ color: PAL.yellow }}>É VISÍVEL</span></>} size={44} rot={-2} />
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
          <ellipse cx={540} cy={1330} rx={300} ry={40} fill="#000" opacity={0.18} />
          <FrontKid rig={GIRL} id="s3girl" pose={kidPose(t, { x: 540, y: 1340, scale: GIRL_S * 1.5, phase: 1, skirt: true, actions: [{ kind: 'present', side: 'R', t0: 9.9, t1: 10.9, angle: -50 }], head: [[6.4, 0], [8.0, -4], [9.6, 3]],
            ex: expr(t, { smile: [[6.4, 0.85]], open: [[6.4, 0.3], [8.5, 0.6], [9.5, 0.3]], look: [[6.4, [0, 2]], [9.3, [4, 6]], [10.4, [0, 2]]] }) })}
            accessory={<SunflowerLanyard glow={clamp((t - 9.9) / 0.3) * (1 - clamp((t - 10.8) / 0.3)) + 0.4 * Math.sin(t * 4) ** 2 * clamp((t - 9.9) / 0.3)} />} />
        </svg>
        <Burst t={t} t0={10.0} x={540} y={960} color="#FFC21A" r={220} />
        <Chip t={t} t0={9.6} t1={99} x={540} y={470} text={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}><Icon name="sunflower" size={56} /> CORDÃO DE GIRASSOL</span>} bg="#2E8B3E" size={40} rot={2} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 545, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 28, color: '#fff', opacity: clamp((t - 9.9) / 0.3) }}>Lei nº 14.624/2023 • uso opcional</div>
      </div> : null}
      {/* habilidades e necessidades; respeitar as diferenças */}
      {allIn > 0 ? <div style={{ position: 'absolute', inset: 0, opacity: allIn }}>
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
          <ellipse cx={540} cy={1320} rx={480} ry={44} fill="#000" opacity={0.15} />
          <FrontKid rig={GIRL} id="s3g2" pose={kidPose(t, { x: 190, y: 1320, scale: GIRL_S * 0.78, phase: 1, skirt: true, hop: [15.6], actions: [{ kind: 'wave', side: 'L', t0: 15.6, t1: 17.6 }], ex: exAll })} accessory={<SunflowerLanyard />} />
          <Theo pose={theoRoll(t, () => 420, { scale: 0.36, y: 1320, ex: exAll, head: Math.sin(clamp((t - 15.7) / 0.6) * Math.PI) * -4 })} id="s3t" />
          <FrontKid rig={GABRIEL} id="s3k" pose={kidPose(t, { x: 880, y: 1320, scale: GAB_S * 0.78, hop: [15.75], actions: [{ kind: 'wave', side: 'R', t0: 15.65, t1: 17.6 }], ex: exAll })} />
        </svg>
        {/* habilidades (estrela) e necessidades (ícone) sobre cada um */}
        {[[190, 'star', 'sunflower'], [500, 'star', 'ramp'], [880, 'star', 'book']].map(([x, a, b], i) => {
          const k1 = outBack((t - 12.75 - i * 0.12) / 0.4), k2 = outBack((t - 13.65 - i * 0.12) / 0.4);
          const out = ss((t - 15.3) / 0.3);
          return <div key={i} style={{ position: 'absolute', left: (x as number) - 110, top: 520 + 10 * Math.sin(t * 2 + i), width: 220, display: 'flex', justifyContent: 'center', gap: 14, opacity: 1 - out }}>
            <div style={{ width: 96, height: 96, borderRadius: 48, background: PAL.yellow, border: `5px solid ${PAL.deep}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${f(Math.max(0, k1))})` }}><Icon name={a as string} color={PAL.orange} size={62} /></div>
            <div style={{ width: 96, height: 96, borderRadius: 48, background: '#FFFFFF', border: `5px solid ${PAL.deep}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${f(Math.max(0, k2))})` }}><Icon name={b as string} color={PAL.navy} size={62} /></div>
          </div>;
        })}
        <Chip t={t} t0={12.75} t1={15.3} x={330} y={420} text="HABILIDADES" bg={PAL.yellow} color={PAL.navy} size={40} rot={-3} />
        <Chip t={t} t0={13.65} t1={15.3} x={760} y={420} text="NECESSIDADES" bg="#FFFFFF" color={PAL.navy} size={40} rot={3} />
        <Chip t={t} t0={14.4} t1={99} x={540} y={760} text={<>RESPEITAR AS <span style={{ color: PAL.yellow }}>DIFERENÇAS</span></>} size={56} rot={-2} />
        {/* corações subindo */}
        {Array.from({ length: 16 }, (_, i) => {
          const t0 = 15.0 + rnd(i) * 1.6, k = (t - t0) / 2.2;
          if (k <= 0 || k >= 1) return null;
          return <div key={i} style={{ position: 'absolute', left: 80 + rnd(i + 3) * 900, top: 1250 - k * 900, opacity: 1 - k, transform: `scale(${f(0.5 + rnd(i + 5) * 0.6)}) rotate(${f(Math.sin(t * 3 + i) * 15)}deg)` }}><Icon name="heart" color={[PAL.red, PAL.yellow, '#FF7EB6', '#FFFFFF'][i % 4]} size={70} /></div>;
        })}
        <Confetti t={t} t0={16.75} ox={540} oy={900} n={70} />
      </div> : null}
    </div>
  );
};
