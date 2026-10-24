// CENA 5 (69,97–88,87): Convenção Interamericana (OEA, Cidade da Guatemala, 7/6/1999);
// igualdade, participação, respeito; atividade: conhecer, debater, preparar um resumo.
import React from 'react';
import { MotionBG, Chip, Icon, Burst, Card, Stamp, PAL, FONT, rnd } from '../fx';
import { FrontKid } from '../../chars/FrontKid';
import { GABRIEL, GIRL } from '../../chars/rigs';
import { Theo } from '../../chars/Theo';
import { kidPose, theoRoll, expr, GAB_S, GIRL_S } from '../acting';
import { ss, sm, outBack } from '../../lib/anim';
import { clamp, lerp, f } from '../../lib/paths';
import GEO from '../geo.json';

const COLORS = [PAL.royal, PAL.green, PAL.orange, PAL.turq, PAL.yellow, '#E5484D', '#7B4FD0'];

export const S05: React.FC<{ t: number }> = ({ t }) => {
  // 1999 em contador
  const yrK = clamp((t - 0.15) / 1.1), year = Math.round(lerp(1990, 1999, sm(yrK)));
  const aOut = ss((t - 2.3) / 0.35);
  const mIn = ss((t - 2.3) / 0.35), mOut = ss((t - 8.6) / 0.35);
  const vIn = ss((t - 8.6) / 0.35), vOut = ss((t - 12.6) / 0.35);
  const sIn = ss((t - 12.6) / 0.4);
  const sign = sm((t - 5.3) / 1.1);
  const am = GEO.americas as { name: string; iso: string; d: string; c: number[] }[];
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <MotionBG t={t} c1={t < 8.6 ? '#1D4FC4' : t < 12.6 ? '#0E8C9C' : '#3A2F9E'} c2={PAL.deep} />
      {/* 1999 */}
      {aOut < 1 ? <div style={{ position: 'absolute', inset: 0, opacity: 1 - aOut, transform: `scale(${f(1 + 0.3 * aOut)})` }}>
        <div style={{ position: 'absolute', left: 190, top: 430, width: 700, height: 640, background: '#FFFFFF', borderRadius: 40, border: `8px solid ${PAL.deep}`, boxShadow: `0 16px 0 ${PAL.deep}`, transform: `scale(${f(clamp(outBack((t - 0.05) / 0.45), 0, 1.2))}) rotate(-3deg)`, overflow: 'hidden' }}>
          <div style={{ background: PAL.red, height: 130, display: 'flex', justifyContent: 'center', gap: 160, alignItems: 'center' }}>{[0, 1].map((i) => <div key={i} style={{ width: 34, height: 34, borderRadius: 17, background: PAL.deep }} />)}</div>
          <div style={{ textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 210, color: PAL.navy, marginTop: 40, transform: `translateY(${f(Math.sin(yrK * Math.PI * 9) * 6 * (1 - yrK))}px)` }}>{year}</div>
          <div style={{ textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 48, color: PAL.red, opacity: clamp((t - 1.3) / 0.3) }}>7 DE JUNHO</div>
        </div>
        <Burst t={t} t0={1.25} x={540} y={720} r={360} />
      </div> : null}
      {/* Américas + documento */}
      {mIn > 0 && mOut < 1 ? <div style={{ position: 'absolute', inset: 0, opacity: mIn * (1 - mOut) }}>
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
          <g transform={`translate(540 850) scale(${f(lerp(0.9, 1, sm((t - 2.3) / 2)) - 0.26 * sm((t - 4.2) / 0.6))}) translate(-540 -850) translate(${f(-330 * sm((t - 4.2) / 0.6))} 0)`}>
            {am.map((c, i) => {
              const k = clamp((t - 2.9 - (rnd(i) * 0.9)) / 0.35);
              return <path key={c.iso + i} d={c.d} fill={k > 0 ? COLORS[i % COLORS.length] : 'rgba(255,255,255,0.25)'} stroke={PAL.deep} strokeWidth={3} strokeLinejoin="round" opacity={0.35 + 0.65 * k} transform={`translate(${c.c[0]} ${c.c[1]}) scale(${f(1 + 0.12 * Math.sin(clamp(k) * Math.PI))}) translate(${-c.c[0]} ${-c.c[1]})`} />;
            })}
          </g>
        </svg>
        <Chip t={t} t0={3.0} t1={99} x={540} y={300} text={<>PAÍSES DAS <span style={{ color: PAL.yellow }}>AMÉRICAS</span></>} size={52} rot={-2} />
        <Card t={t} t0={4.25} t1={99} x={800} y={880} w={430} h={580} rot={4} from="right">
          <div style={{ background: PAL.navy, color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 30, padding: '20px 24px', lineHeight: 1.15 }}>CONVENÇÃO INTERAMERICANA</div>
          <div style={{ padding: '18px 24px', fontFamily: FONT, fontWeight: 700, fontSize: 24, color: PAL.navy, lineHeight: 1.3 }}>para a eliminação de todas as formas de discriminação contra as pessoas com deficiência</div>
          {[0, 1, 2, 3].map((i) => <div key={i} style={{ margin: '10px 24px', height: 12, borderRadius: 6, background: '#D9DEEA', width: `${70 + rnd(i) * 25}%` }} />)}
          <svg width={430} height={110} style={{ position: 'absolute', left: 24, bottom: 54 }}>
            <path d="M10 70 C40 20 60 90 90 50 C110 20 130 80 160 50 C190 20 200 70 230 60 C260 50 280 40 320 55" fill="none" stroke={PAL.royal} strokeWidth={6} strokeLinecap="round" strokeDasharray={420} strokeDashoffset={420 * (1 - sign)} />
            <line x1={10} y1={88} x2={410} y2={88} stroke={PAL.deep} strokeWidth={3} />
          </svg>
          <div style={{ position: 'absolute', left: 24, bottom: 18, fontFamily: FONT, fontWeight: 700, fontSize: 20, color: '#6B6F86' }}>OEA • Cidade da Guatemala • 7/6/1999</div>
        </Card>
        <Stamp t={t} t0={6.1} t1={99} x={700} y={1250} text="CONTRA A DISCRIMINAÇÃO" color={PAL.green} rot={-6} size={36} />
      </div> : null}
      {/* valores */}
      {vIn > 0 && vOut < 1 ? <div style={{ position: 'absolute', inset: 0, opacity: vIn * (1 - vOut) }}>
        <Chip t={t} t0={8.7} t1={99} x={540} y={300} text={<>A CONVENÇÃO <span style={{ color: PAL.yellow }}>DEFENDE</span></>} size={52} rot={-2} />
        {[[9.7, 'IGUALDADE', 'scale', PAL.royal, 220], [10.95, 'PARTICIPAÇÃO', 'people', '#3FA34D', 540], [12.1, 'RESPEITO', 'heart', PAL.orange, 860]].map(([t0, lab, ic, c, x], i) => {
          const k = sm((t - (t0 as number)) / 0.5), h = 640 * k;
          return <div key={i} style={{ position: 'absolute', left: (x as number) - 140, top: 1230 - h, width: 280, height: h, background: c as string, border: `6px solid ${PAL.deep}`, borderRadius: '30px 30px 8px 8px', boxShadow: `0 10px 0 ${PAL.deep}`, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 30, gap: 18, overflow: 'hidden' }}>
            <div style={{ width: 150, height: 150, borderRadius: 75, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${f(clamp(outBack((t - (t0 as number) - 0.25) / 0.4), 0, 1.3))})` }}><Icon name={ic as string} color={c as string} size={100} /></div>
            <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: i === 1 ? 31 : 36, color: '#fff' }}>{lab}</div>
          </div>;
        })}
        {[9.7, 10.95, 12.1].map((t0, i) => <Burst key={i} t={t} t0={t0 + 0.4} x={[220, 540, 860][i]} y={700} />)}
      </div> : null}
      {/* conheça, debata, resuma */}
      {sIn > 0 ? <div style={{ position: 'absolute', inset: 0, opacity: sIn }}>
        {[[12.7, '1', 'CONHEÇA', 'doc', PAL.royal], [14.85, '2', 'DEBATA', 'chat', '#3FA34D'], [16.4, '3', 'RESUMA', 'idea', PAL.orange]].map(([t0, n, lab, ic, c], i) => {
          const k = outBack((t - (t0 as number)) / 0.45);
          if (k <= 0) return null;
          const active = t >= (t0 as number) && t < ([14.85, 16.4, 99][i]);
          return <div key={i} style={{ position: 'absolute', left: 60, right: 60, top: 250 + i * 190, height: 160, background: active ? '#FFFFFF' : 'rgba(255,255,255,0.88)', border: `6px solid ${PAL.deep}`, borderRadius: 30, boxShadow: `0 10px 0 ${PAL.deep}`, display: 'flex', alignItems: 'center', gap: 26, padding: '0 26px', transform: `translateX(${f((1 - clamp(k)) * (i % 2 ? 900 : -900))}px) scale(${f(active ? 1.03 : 0.97)})` }}>
            <div style={{ width: 110, height: 110, borderRadius: 55, background: c as string, color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `5px solid ${PAL.deep}` }}>{n}</div>
            <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 64, color: PAL.navy, flex: 1 }}>{lab}</div>
            <div style={{ width: 110, height: 110, borderRadius: 24, background: c as string, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={ic as string} size={72} /></div>
          </div>;
        })}
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
          <ellipse cx={540} cy={1330} rx={470} ry={40} fill="#000" opacity={0.15} />
          <FrontKid rig={GIRL} id="s5g" pose={kidPose(t, { x: 200, y: 1330, scale: GIRL_S * 0.62, phase: 1, skirt: true, actions: [{ kind: 'present', side: 'R', t0: 14.9, t1: 16.3, angle: -70 }], head: [[12.6, 0], [15.0, 6]], ex: expr(t, { smile: [[12.6, 0.8]], open: [[12.6, 0.4], [15.0, 0.75], [15.6, 0.3], [16.0, 0.7]], look: [[12.6, [0, 2]], [14.9, [7, 1]]] }) })} />
          <Theo pose={theoRoll(t, () => 430, { scale: 0.3, y: 1330, ex: expr(t, { smile: [[12.6, 0.8]], open: [[12.6, 0.3], [15.4, 0.7], [16.0, 0.2]] }), head: -3 })} id="s5t" />
          <FrontKid rig={GABRIEL} id="s5k" pose={kidPose(t, { x: 880, y: 1330, scale: GAB_S * 0.62, actions: [{ kind: 'present', side: 'L', t0: 12.8, t1: 14.8, angle: 60 }, { kind: 'think', side: 'R', t0: 16.5, t1: 19.5 }], head: [[12.6, 0], [15.0, -6]], ex: expr(t, { smile: [[12.6, 0.8], [16.5, 0.5]], open: [[12.6, 0.5], [15.2, 0.2], [15.5, 0.7]], look: [[12.6, [-6, 1]]] }) })} />
        </svg>
        {/* balões do debate */}
        {[0, 1, 2].map((i) => {
          const k = outBack((t - 15.0 - i * 0.3) / 0.35) * (1 - ss((t - 16.6) / 0.3));
          if (k <= 0) return null;
          return <div key={i} style={{ position: 'absolute', left: [150, 400, 760][i], top: 880 - (i % 2) * 40, transform: `scale(${f(k)})` }}><Icon name="chat" color="#FFFFFF" size={110} /></div>;
        })}
        {/* resumo sendo escrito */}
        {t > 16.4 ? <div style={{ position: 'absolute', left: 330, top: 805, width: 420, height: 200, background: '#FFF7E6', border: `6px solid ${PAL.deep}`, borderRadius: 22, transform: `rotate(-3deg) scale(${f(clamp(outBack((t - 16.45) / 0.4), 0, 1.2))})`, padding: 20 }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 32, color: PAL.navy }}>RESUMO</div>
          {[0, 1, 2, 3].map((i) => <div key={i} style={{ height: 10, borderRadius: 5, background: PAL.royal, marginTop: 18, width: `${clamp((t - 16.8 - i * 0.35) / 0.35) * (60 + rnd(i) * 35)}%` }} />)}
        </div> : null}
      </div> : null}
    </div>
  );
};
