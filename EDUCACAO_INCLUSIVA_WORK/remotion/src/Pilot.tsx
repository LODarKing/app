// PILOTO — first 10.6 s of scene 1 ("Imagine chegar ao seu clube ... Hoje, vamos descobrir").
// Everything is a pure function of time t = frame / fps.
import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig, continueRender, delayRender } from 'remotion';
import { FrontKid, KidPose, ArmPose } from './chars/FrontKid';
import { GABRIEL, GIRL } from './chars/rigs';
import { Theo, AXLE, GRIP_R, R_TIRE } from './chars/Theo';
import { Expr } from './chars/Face';
import { SetBack, SetFront, Cam, camT, stairsProfile, groundAt, PORCH_Y } from './scene/Clubhouse';
import { keys, ss, sm, outBack, blinkAt } from './lib/anim';
import { lerp, clamp, f } from './lib/paths';
import { TIMING } from './timing';

export const PILOT_DUR = 10.6;

// ---------- fonts ----------
const fontHandle = typeof document !== 'undefined' ? delayRender('fonts') : 0;
if (typeof document !== 'undefined') {
  const faces = [new FontFace('Poppins', `url(${staticFile('Poppins-ExtraBold.ttf')})`, { weight: '800' }), new FontFace('Poppins', `url(${staticFile('Poppins-Bold.ttf')})`, { weight: '700' })];
  Promise.all(faces.map((ff) => ff.load())).then((l) => { l.forEach((ff) => (document as any).fonts.add(ff)); continueRender(fontHandle); }).catch(() => continueRender(fontHandle));
}

// ---------- Theo ----------
const { AXLE_START, AXLE_STOP, T_STOP, THEO_SCALE, CONTACT, CYCLE, A_GRAB } = TIMING;
const RW = R_TIRE * THEO_SCALE;
const theoX = (t: number) => { const k = clamp(t / T_STOP); return AXLE_START + (AXLE_STOP - AXLE_START) * (1 - Math.pow(1 - k, 2.2)); };
const TOTAL_ROT = (AXLE_STOP - AXLE_START) / RW;
const PHI = ((0.7 - (TOTAL_ROT % CYCLE)) % CYCLE + CYCLE) % CYCLE;   // the last push ends holding the rim
const rimPt = (a: number): [number, number] => [AXLE[0] + Math.cos(a) * GRIP_R, AXLE[1] + Math.sin(a) * GRIP_R];

function theoPose(t: number) {
  const x = theoX(t), rot = (x - AXLE_START) / RW;
  const ph = ((rot + PHI) % CYCLE + CYCLE) % CYCLE;
  let grip: [number, number];
  if (ph < CONTACT) grip = rimPt(A_GRAB + ph);
  else {
    const k = (ph - CONTACT) / (CYCLE - CONTACT), a = lerp(A_GRAB + CONTACT, A_GRAB, ss(k));
    const p = rimPt(a), lift = 44 * Math.sin(k * Math.PI);
    grip = [p[0] - lift * 0.35, p[1] - lift];
  }
  const pushing = t < T_STOP && ph < CONTACT ? Math.sin((ph / CONTACT) * Math.PI) : 0;
  const lean = 2 + 4.5 * pushing + 2.5 * ss((t - 4.0) / 0.4) * (1 - ss((t - 4.9) / 0.5)) - 3 * ss((t - 4.7) / 0.8);
  const head = keys(t, [[0, -1], [1.7, -3], [2.2, -5], [3.2, -1], [4.5, 1], [5.0, -9], [6.4, -11], [7.2, -12], [8.6, -11], [9.2, -7], [10.6, -6]]) + 0.6 * Math.sin(t * 2.3)
    + 4 * Math.sin(clamp((t - 1.9) / 0.5) * Math.PI) ;   // little nod hello
  const expr: Expr = {
    smile: keys(t, [[0, 0.7], [4.4, 0.75], [5.1, 0.2], [5.8, -0.35], [8.6, -0.4], [9.6, 0.1], [10.4, 0.45]]),
    open: keys(t, [[0, 0.55], [2.0, 0.8], [3.0, 0.6], [4.6, 0.5], [5.3, 0.12], [6.0, 0.03], [8.8, 0.03], [10.0, 0.25]]),
    worry: keys(t, [[0, 0], [5.0, 0], [5.8, 0.85], [8.6, 0.9], [9.8, 0.3], [10.6, 0.1]]),
    browUp: keys(t, [[0, 2], [5.0, 3], [5.8, 8], [8.6, 9], [10.6, 4]]),
    look: keys<number[]>(t, [[0, [1, 0]], [4.6, [2, 0]], [5.2, [3, -6]], [8.7, [3, -7]], [9.3, [4, -9]], [10.6, [4, -8]]]) as [number, number],
    blink: blinkAt(t, [1.2, 3.6, 6.3, 8.95]),
  };
  return { x, y: 0, scale: THEO_SCALE, wheel: rot, lean, head, grip, expr };
}

// ---------- the friends (front view, on the porch) ----------
const leg0 = { dx: 0, dy: 0, rot: 0 };
type Walk = { t0: number; x0: number; x1: number; dur: number; stride: number };
function walkState(t: number, w: Walk) {
  const k = clamp((t - w.t0) / w.dur);
  const e = k <= 0 ? 0 : k >= 1 ? 1 : (k < 0.15 ? 0.5 * Math.pow(k / 0.15, 2) * 0.15 : k > 0.85 ? 1 - 0.5 * Math.pow((1 - k) / 0.15, 2) * 0.15 : k);
  const x = lerp(w.x0, w.x1, e);
  const moving = k > 0 && k < 1 ? 1 : 0;
  const cyc = (t - w.t0) / w.stride;   // one step per stride
  return { x, moving, cyc };
}
function smoothGround(x: number) {   // eased step-downs (about 36 px wide)
  let y = 0, wsum = 0;
  for (let i = -3; i <= 3; i++) { const wt = 1 - Math.abs(i) / 4; y += groundAt(x + i * 12) * wt; wsum += wt; }
  return y / wsum;
}
function kidPose(t: number, base: { x: number; scale: number; walk: Walk; phase: number; wave: [number, number]; rig: 'g' | 'd'; waveSide: 'L' | 'R' }): KidPose {
  const ws = walkState(t, base.walk);
  const x = base.x + (ws.x - base.walk.x0);
  const y = smoothGround(x);
  const s = base.scale;
  const step = ws.moving ? Math.sin(ws.cyc * Math.PI) : 0;
  const lift = Math.abs(step);
  const legL = { dx: 0, dy: ws.moving ? -Math.max(0, step) * 28 : 0, rot: ws.moving ? -4 * Math.max(0, step) : 0 };
  const legR = { dx: 0, dy: ws.moving ? -Math.max(0, -step) * 28 : 0, rot: ws.moving ? 4 * Math.max(0, -step) : 0 };
  const breath = Math.sin(t * 2.1 + base.phase);
  const bob = 3 * breath - 14 * lift * ws.moving;
  // waving with the screen-left arm
  const w = ss((t - base.wave[0]) / 0.35) * (1 - ss((t - (base.wave[1] - 0.35)) / 0.35));
  // waving arm (mirrored angles for the screen-right arm)
  const m = base.waveSide === 'L' ? 1 : -1;
  const waving: ArmPose = {
    sh: m * lerp(2 + 1.5 * breath, 138, w) + (ws.moving ? 8 * step : 0),
    el: m * lerp(0, 28 + 20 * Math.sin(t * 11 + base.phase), w),
    wr: m * lerp(0, -10 + 8 * Math.sin(t * 11 + base.phase - 0.7), w),
    open: clamp((w - 0.3) / 0.4),
  };
  const other: ArmPose = { sh: -m * (2 + 1.5 * breath) - (ws.moving ? 8 * step : 0), el: ws.moving ? -6 * m : 0, wr: 0, open: 0 };
  const armL = m === 1 ? waving : other, armR = m === 1 ? other : waving;
  const lean = keys(t, [[0, 0], [4.8, 0], [5.6, -1.5], [8.7, -1.5], [9.0, 0]]) + 0.8 * Math.sin(t * 1.2 + base.phase) + (ws.moving ? -3 : 0);
  const g = base.rig === 'g';
  const head = keys(t, [[0, g ? -3 : 3], [1.0, -2], [2.9, -4], [4.8, -2], [5.6, -6], [7.1, -6], [7.5, g ? -8 : 8], [8.6, g ? -8 : 8], [9.0, -4], [10.6, -5]]) + 1.2 * Math.sin(t * 1.7 + base.phase);
  const look = keys<number[]>(t, [[0, [g ? -6 : 6, 0]], [0.9, [-6, 1]], [4.6, [-6, 2]], [5.4, [-5, 7]], [7.2, [-5, 7]], [7.6, [g ? -7 : 7, 1]], [8.6, [g ? -7 : 7, 1]], [8.9, [-6, 3]], [10.6, [-7, 3]]]) as [number, number];
  const expr: Expr = {
    smile: keys(t, [[0, 0.8], [4.9, 0.75], [5.7, -0.3], [8.7, -0.3], [9.2, 0.45], [10.6, 0.6]]),
    open: keys(t, [[0, 0.45], [1.2, 0.85], [3.0, 0.55], [4.9, 0.35], [5.7, 0.02], [8.7, 0.02], [9.2, 0.35], [10.6, 0.3]]),
    worry: keys(t, [[0, 0], [5.0, 0], [5.7, 0.85], [8.6, 0.8], [9.2, 0.1]]),
    browUp: keys(t, [[0, 0], [1.2, 5], [3.0, 1], [5.0, 1], [5.7, 6], [8.6, 6], [9.2, 2]]),
    look, blink: blinkAt(t, g ? [0.7, 3.3, 5.45, 7.9, 10.2] : [1.0, 4.1, 6.0, 8.4, 10.4]),
  };
  return { x, y, scale: s, bob, lean, head, armL, armR, legL: ws.moving ? legL : leg0, legR: ws.moving ? legR : leg0, expr, skirt: base.rig === 'd' ? 1.2 * Math.sin(t * 2.2) + (ws.moving ? 3 * step : 0) : 0 };
}
const GIRL_B = { x: 665, scale: TIMING.GIRL_SCALE, walk: { t0: 8.95, x0: 665, x1: 400, dur: 1.65, stride: 0.33 }, phase: 1.3, wave: [1.45, 3.05] as [number, number], rig: 'd' as const, waveSide: 'L' as const };
const GAB_B = { x: 785, scale: TIMING.GAB_SCALE, walk: { t0: 9.5, x0: 785, x1: 650, dur: 1.1, stride: 0.33 }, phase: 0, wave: [1.15, 2.9] as [number, number], rig: 'g' as const, waveSide: 'R' as const };

// ---------- camera ----------
function camAt(t: number): Cam {
  const c = keys<number[]>(t, [
    [0, [430, -440, 0.93]], [3.6, [420, -415, 0.96]], [4.6, [385, -392, 0.98]], [6.7, [380, -382, 1.01]],
    [7.2, [110, -330, 1.55]], [8.65, [105, -335, 1.6]], [9.45, [360, -440, 1.08]], [10.6, [380, -450, 1.04]],
  ]);
  return { x: c[0] + 5 * Math.sin(t * 0.7) + 2 * Math.sin(t * 1.9), y: c[1] + 4 * Math.sin(t * 0.9 + 1) + 2 * Math.sin(t * 2.3), zoom: c[2] };
}

const CUES: [number, number, React.ReactNode][] = [
  [0.164, 2.51, <>Imagine chegar ao<br />seu clube, cheio de</>],
  [2.53, 4.61, <>vontade de <span style={{ color: '#FFEB00' }}>participar,</span><br />mas encontrar</>],
  [4.63, 7.07, <>uma <span style={{ color: '#FFEB00' }}>barreira</span> que<br />impede você de entrar.</>],
  [7.09, 8.75, <>Será que isso é <span style={{ color: '#FFEB00' }}>inclusão?</span></>],
  [8.77, PILOT_DUR + 1, <>Hoje, vamos<br />descobrir…</>],
];

export const Pilot: React.FC<{ subs?: boolean }> = ({ subs = true }) => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const cam = camAt(t);
  const tp = theoPose(t), gp = kidPose(t, GAB_B), dp = kidPose(t, GIRL_B);
  const bar = ss((t - 5.0) / 0.25) * (1 - ss((t - 6.85) / 0.35));
  const pulse = 0.55 + 0.45 * Math.max(Math.exp(-Math.pow((t - 5.1) / 0.25, 2)), Math.exp(-Math.pow((t - 5.78) / 0.25, 2)));
  const q = outBack((t - 7.14) / 0.45) * (1 - ss((t - 8.55) / 0.3));
  const shadow = (x: number, y: number, w: number) => <ellipse cx={x} cy={y + 4} rx={w} ry={w * 0.14} fill="#2A2410" opacity={0.28} filter="url(#blur8)" />;
  return (
    <AbsoluteFill style={{ background: '#D4F1FB' }}>
      <Audio src={staticFile('piloto_mix.wav')} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <SetBack cam={cam} t={t} />
        <g transform={camT(cam, 1)}>
          {shadow(dp.x, dp.y, 70)}{shadow(gp.x, gp.y, 78)}{shadow(tp.x + 70, 0, 150)}
          <FrontKid rig={GABRIEL} pose={gp} id="gab" />
          <FrontKid rig={GIRL} pose={dp} id="girl" />
          <Theo pose={tp} id="theo" />
          {/* the barrier: the stairs are highlighted, never the person */}
          {bar > 0.001 ? <g opacity={bar}>
            <path d={stairsProfile()} fill="none" stroke="#FF6A3D" strokeWidth={26} opacity={0.35 * pulse} filter="url(#blur8)" strokeLinejoin="round" />
            <path d={stairsProfile()} fill="none" stroke="#FF5A3C" strokeWidth={9} opacity={0.6 + 0.4 * pulse} strokeLinejoin="round" />
          </g> : null}
          {q > 0.001 ? <g transform={`translate(${f(250 + 6 * Math.sin(t * 2))} ${f(-560 - 10 * Math.sin(t * 2.6))}) rotate(${f(7 * Math.sin(t * 3.1) * q)}) scale(${f(q)})`}>
            <circle r={150} fill="#FFF3A0" opacity={0.45} filter="url(#blur20)" />
            <text y={62} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={200} fill="#FFEB00" stroke="#211C55" strokeWidth={16} paintOrder="stroke" strokeLinejoin="round">?</text>
          </g> : null}
        </g>
        <SetFront cam={cam} t={t} />
      </svg>
      {subs ? <div style={{ position: 'absolute', left: 60, width: 960, top: 1400, height: 170 }}>
        {CUES.map(([s, e, node], i) => {
          const a = ss((t - s) / 0.16) * (1 - ss((t - (e - 0.12)) / 0.12));
          if (a <= 0) return null;
          return <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: '50%', transform: `translateY(calc(-50% + ${f((1 - ss((t - s) / 0.16)) * 14)}px))`, textAlign: 'center', opacity: a,
            fontFamily: 'Poppins', fontWeight: 700, fontSize: 52, lineHeight: 1.22, color: '#fff', WebkitTextStroke: '11px #190C3C', paintOrder: 'stroke fill', textShadow: '0 5px 12px rgba(0,0,0,.35)', whiteSpace: 'nowrap' } as React.CSSProperties}>{node}</div>;
        })}
      </div> : null}
    </AbsoluteFill>
  );
};
