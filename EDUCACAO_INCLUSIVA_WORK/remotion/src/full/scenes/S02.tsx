// CENA 2 (13,07–33,70): deficiência ≠ incapacidade; barreiras criadas pela sociedade; CIF (OMS); Convenção da ONU.
import React from 'react';
import { MotionBG, Chip, Card, Icon, Burst, Confetti, PAL, rnd, FONT } from '../fx';
import { FrontKid } from '../../chars/FrontKid';
import { GABRIEL, GIRL } from '../../chars/rigs';
import { Theo } from '../../chars/Theo';
import { kidPose, theoRoll, expr, GAB_S, GIRL_S } from '../acting';
import { ss, sm, outBack, keys } from '../../lib/anim';
import { clamp, lerp, f } from '../../lib/paths';

const Strike: React.FC<{ t: number; t0: number; x: number; y: number; w: number }> = ({ t, t0, x, y, w }) => {
  const k = sm((t - t0) / 0.25);
  if (k <= 0) return null;
  return <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
    <path d={`M${x - w / 2} ${y + 30} L${x - w / 2 + w * k} ${y - 30 + 0 * k}`} stroke={PAL.red} strokeWidth={22} strokeLinecap="round" />
    <path d={`M${x - w / 2} ${y - 30} L${x - w / 2 + w * clamp(k * 1.2 - 0.2)} ${y + 30}`} stroke={PAL.red} strokeWidth={22} strokeLinecap="round" opacity={k > 0.2 ? 1 : 0} />
  </svg>;
};

export const S02: React.FC<{ t: number }> = ({ t }) => {
  // ---- A: deficiência ≠ incapacidade (0–3,5)
  const aOut = ss((t - 3.3) / 0.3);
  const theoA = theoRoll(t, () => 0, { scale: 0.5, ex: expr(t, { smile: [[0, 0.8], [2.4, 0.6], [3.2, 0.9]], open: [[0, 0.5], [2.4, 0.1], [3.0, 0.6]], look: [[0, [2, -2]]] }), head: Math.sin(clamp((t - 2.5) / 0.7) * Math.PI * 3) * 5 * (t > 2.5 && t < 3.2 ? 1 : 0) });
  // ---- B: barreiras (3,5–8,6)
  const bIn = ss((t - 3.5) / 0.35), bOut = ss((t - 8.4) / 0.35);
  const wallTop = (i: number) => 4.9 + i * 0.16;
  const crumble = sm((t - 7.25) / 0.6);
  const theoBX = (tt: number) => tt < 7.35 ? 210 : lerp(210, 830, sm((tt - 7.35) / 1.2));
  const theoB = theoRoll(t, theoBX, { scale: 0.36, ex: expr(t, { smile: [[3.5, 0.7], [6.2, 0.6], [6.6, -0.2], [7.3, 0.8]], open: [[3.5, 0.4], [6.6, 0.05], [7.4, 0.6]], worry: [[6.2, 0], [6.7, 0.7], [7.3, 0]] }), y: 1180 });
  // ---- C: CIF (7,4–15,3)
  const cIn = ss((t - 7.6) / 0.4), cOut = ss((t - 15.2) / 0.35);
  const ring = outBack((t - 10.4) / 0.5);
  const node = (t0: number) => outBack((t - t0) / 0.45);
  const nodes: [number, string, string, number, number, string][] = [[12.85, 'SAÚDE', 'heart', 540, 470, PAL.red], [13.75, 'AMBIENTE', 'tree', 285, 990, PAL.green], [14.6, 'PARTICIPAÇÃO', 'people', 795, 990, PAL.royal]];
  // ---- D: ONU (15,4–20,6)
  const dIn = ss((t - 15.45) / 0.35);
  const allIn = outBack((t - 19.6) / 0.5);
  const card = Math.min(outBack((t - 15.5) / 0.5), 1);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <MotionBG t={t} c1={t < 7.4 ? '#2D5BE3' : t < 15.3 ? '#0E8C9C' : '#2F3FA8'} c2={PAL.deep} />
      {/* A */}
      {aOut < 1 ? <div style={{ position: 'absolute', inset: 0, opacity: 1 - aOut, transform: `scale(${f(1 + 0.15 * aOut)})` }}>
        <Chip t={t} t0={0.55} t1={9} x={540} y={400} text="DEFICIÊNCIA" bg={PAL.yellow} color={PAL.navy} size={84} rot={-3} />
        {t > 1.35 ? <div style={{ position: 'absolute', left: 0, right: 0, top: 455, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 170, color: '#fff', WebkitTextStroke: `16px ${PAL.deep}`, paintOrder: 'stroke fill', transform: `rotate(${f((1 - clamp(outBack((t - 1.4) / 0.5))) * 360)}deg) scale(${f(clamp(outBack((t - 1.4) / 0.5), 0, 2))})` }}>≠</div> : null}
        <Chip t={t} t0={2.35} t1={9} x={540} y={760} text="INCAPACIDADE" bg="#FFFFFF" color={PAL.red} size={78} rot={2} />
        <Strike t={t} t0={2.62} x={540} y={760} w={640} />
        <Burst t={t} t0={2.62} x={540} y={760} color={PAL.red} r={260} />
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
          <ellipse cx={560} cy={1290} rx={300} ry={46} fill="#FFFFFF" opacity={0.18} />
          <ellipse cx={560} cy={1290} rx={210} ry={30} fill="#FFFFFF" opacity={0.2} />
          <Theo pose={{ ...theoA, x: 420, y: 1290 + 200 * (1 - clamp(outBack((t - 0.1) / 0.6))) }} id="s2a" />
        </svg>
      </div> : null}
      {/* B */}
      {bIn > 0 && bOut < 1 ? <div style={{ position: 'absolute', inset: 0, opacity: bIn * (1 - bOut) }}>
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
          <rect x={40} y={1180} width={1000} height={14} rx={7} fill="#FFFFFF" opacity={0.85} />
          {/* meta: participação */}
          <g transform={`translate(930 1180) scale(${f(outBack((t - 3.9) / 0.45))})`}>
            <rect x={-6} y={-300} width={12} height={300} rx={6} fill="#FFFFFF" />
            <path d={`M6 -296 L${f(120 + 8 * Math.sin(t * 5))} -262 L6 -226 Z`} fill={PAL.yellow} stroke={PAL.deep} strokeWidth={5} strokeLinejoin="round" />
            <circle r={30} cy={-312} fill={PAL.yellow} stroke={PAL.deep} strokeWidth={5} />
          </g>
          {/* muro de tijolos que a sociedade "cria" e depois derruba */}
          {Array.from({ length: 4 }, (_, row) => Array.from({ length: 3 }, (_, col) => {
            const i = row * 3 + col, tt = wallTop(i);
            const drop = outBack((t - tt) / 0.35);
            if (drop <= 0) return null;
            const bx = 530 + col * 62 + (row % 2) * 31 - 31, by = 1180 - 50 - row * 50;
            const fx = crumble > 0 ? (rnd(i) - 0.5) * 500 * crumble : 0, fy = crumble > 0 ? 900 * crumble * crumble - 200 * crumble : 0;
            return <rect key={i} x={f(bx + fx)} y={f(by - (1 - clamp(drop)) * 400 + fy)} width={60} height={46} rx={6} fill="#C8553D" stroke={PAL.deep} strokeWidth={5} transform={`rotate(${f(crumble * (rnd(i + 3) - 0.5) * 200)} ${f(bx + 30 + fx)} ${f(by + 23 + fy)})`} opacity={1 - crumble * 0.6} />;
          }))}
          {/* rampa (acessibilidade) que surge no lugar do muro */}
          <path d={`M480 1180 L${f(480 + 240 * sm((t - 7.4) / 0.5))} 1180 L${f(480 + 240 * sm((t - 7.4) / 0.5))} ${f(1180 - 30 * sm((t - 7.4) / 0.5))} Z`} fill={PAL.green} stroke={PAL.deep} strokeWidth={5} strokeLinejoin="round" />
          <Theo pose={theoB} id="s2b" />
        </svg>
        <Chip t={t} t0={3.95} t1={8.5} x={930} y={810} text="PARTICIPAÇÃO" bg={PAL.yellow} color={PAL.navy} size={38} />
        <Chip t={t} t0={3.7} t1={8.5} x={210} y={880} text="PESSOA" bg="#FFFFFF" color={PAL.navy} size={38} />
        <Chip t={t} t0={6.55} t1={7.35} x={600} y={850} text="BARREIRA" bg={PAL.red} size={46} rot={-4} />
        <Chip t={t} t0={7.5} t1={8.5} x={600} y={1255} text="ACESSIBILIDADE" bg={PAL.green} size={38} />
        <Chip t={t} t0={4.0} t1={6.5} x={540} y={420} text={<>A SOCIEDADE <span style={{ color: PAL.yellow }}>CRIA BARREIRAS</span></>} size={46} />
      </div> : null}
      {/* C: CIF */}
      {cIn > 0 && cOut < 1 ? <div style={{ position: 'absolute', inset: 0, opacity: cIn * (1 - cOut) }}>
        <Chip t={t} t0={7.9} t1={15.3} x={540} y={250} text={<>OMS • <span style={{ color: PAL.yellow }}>Organização Mundial da Saúde</span></>} size={36} />
        {t < 10.6 ? <div style={{ position: 'absolute', left: 540 - 230, top: 560, width: 460, height: 460, borderRadius: 230, background: '#FFFFFF', border: `10px solid ${PAL.deep}`, boxShadow: `0 16px 0 ${PAL.deep}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
          transform: `scale(${f(clamp(outBack((t - 7.95) / 0.5), 0, 1.2) * (1 - ss((t - 10.25) / 0.3)))}) rotate(${f(Math.sin(t * 2) * 3)}deg)` }}>
          <div style={{ transform: `rotate(${f(t * 40)}deg)` }}><Icon name="globe" color="#1D7CC4" size={200} /></div>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 96, color: '#1D7CC4', lineHeight: 1 }}>OMS</div>
        </div> : null}
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
          <g transform={`translate(540 800) rotate(${f(t * 25)}) scale(${f(clamp(ring, 0, 1.2))})`}>
            <circle r={300} fill="none" stroke="#FFFFFF" strokeWidth={10} strokeDasharray="40 26" opacity={0.6} />
            {[0, 120, 240].map((a) => <path key={a} d="M0 -312 L24 -300 L0 -288 Z" fill="#FFFFFF" transform={`rotate(${a + 40})`} />)}
          </g>
          {ring > 0 ? <g transform={`translate(540 800) scale(${f(ring)})`}>
            <circle r={150} fill="#FFFFFF" stroke={PAL.deep} strokeWidth={10} />
            <circle r={128} fill={PAL.navy} />
            <text y={34} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={104} fill={PAL.yellow}>CIF</text>
          </g> : null}
          {nodes.map(([t0, label, icon, x, y, c], i) => {
            const k = node(t0);
            if (k <= 0) return null;
            return <g key={i} transform={`translate(${x} ${y}) scale(${f(k)})`}>
              <circle r={112} fill={c} stroke={PAL.deep} strokeWidth={10} />
              <g transform="translate(-52 -56)"><Icon name={icon} size={104} /></g>
            </g>;
          })}
        </svg>
        {ring > 0.3 ? <div style={{ position: 'absolute', left: 120, right: 120, top: 1205, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 30, color: '#fff', opacity: clamp((t - 10.9) / 0.4) }}>Classificação Internacional de Funcionalidade, Incapacidade e Saúde</div> : null}
        {nodes.map(([t0, label, , x, y], i) => <Chip key={i} t={t} t0={t0 + 0.1} t1={15.3} x={x} y={y + 140} text={label} bg="#FFFFFF" color={PAL.navy} size={34} />)}
      </div> : null}
      {/* D: Convenção da ONU */}
      {dIn > 0 ? <div style={{ position: 'absolute', inset: 0, opacity: dIn }}>
        <Card t={t} t0={15.5} t1={99} x={540} y={lerp(640, 560, sm((t - 19.4) / 0.5))} w={760} h={600} from="up">
          <div style={{ background: '#1D4FC4', height: 170, display: 'flex', alignItems: 'center', gap: 22, padding: '0 34px' }}>
            <div style={{ width: 120, height: 120, borderRadius: 60, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="globe" color="#1D4FC4" size={92} /></div>
            <div style={{ fontFamily: FONT, color: '#fff' }}><div style={{ fontWeight: 900, fontSize: 64, lineHeight: 1 }}>ONU</div><div style={{ fontWeight: 700, fontSize: 28 }}>Convenção • 2006</div></div>
          </div>
          <div style={{ padding: '26px 34px', fontFamily: FONT, fontWeight: 800, fontSize: 34, color: PAL.navy, lineHeight: 1.2 }}>Direitos das Pessoas com Deficiência</div>
          {[[17.7, 'DIREITOS', 'check', PAL.green], [18.5, 'OPORTUNIDADES', 'star', PAL.orange]].map(([t0, txt, ic, c], i) => {
            const k = outBack((t - (t0 as number)) / 0.4);
            return <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 22, padding: '10px 34px', transform: `translateX(${f((1 - clamp(k)) * -600)}px)`, opacity: clamp(k * 2) }}>
              <div style={{ width: 84, height: 84, borderRadius: 22, background: c as string, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `5px solid ${PAL.deep}` }}><Icon name={ic as string} size={56} /></div>
              <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 52, color: PAL.navy }}>{txt}</div>
            </div>;
          })}
        </Card>
        {allIn > 0 ? <>
          <Chip t={t} t0={19.6} t1={99} x={540} y={980} text={<>PARA <span style={{ color: PAL.yellow }}>TODOS!</span></>} size={64} rot={-3} />
          <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
            <g transform={`translate(0 ${f((1 - clamp(allIn)) * 500)})`}>
              <FrontKid rig={GIRL} pose={kidPose(t, { x: 230, y: 1345, scale: GIRL_S * 0.62, phase: 1, actions: [{ kind: 'wave', side: 'L', t0: 19.75, t1: 21.5 }], ex: expr(t, { smile: [[0, 0.9]], open: [[0, 0.8]] }), skirt: true })} id="s2g" />
              <FrontKid rig={GABRIEL} pose={kidPose(t, { x: 850, y: 1345, scale: GAB_S * 0.62, actions: [{ kind: 'wave', side: 'R', t0: 19.7, t1: 21.5 }], ex: expr(t, { smile: [[0, 0.9]], open: [[0, 0.8]] }) })} id="s2k" />
              <Theo pose={theoRoll(t, () => 470, { scale: 0.29, y: 1345, ex: expr(t, { smile: [[0, 0.9]], open: [[0, 0.8]] }) })} id="s2t" />
            </g>
          </svg>
        </> : null}
        <Confetti t={t} t0={19.75} ox={540} oy={1100} />
      </div> : null}
    </div>
  );
};
