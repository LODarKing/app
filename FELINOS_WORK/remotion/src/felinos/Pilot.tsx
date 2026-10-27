// PILOTO — Felinos: uma aventura selvagem! (cena 1, 0–10 s)
// Olhos no escuro → Pingo na mesa → salto pela lente → onça-pintada → tigre → leão → pegadas e título.
// Tudo é função pura do tempo t = frame / fps. Os tempos ficam em timing.json (também usados na mixagem).
import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig, continueRender, delayRender } from 'remotion';
import { PingoSit, PingoLeap, PingoHead, PingoPose, PC } from './Pingo';
import { BigCat } from './BigCat';
import { StudySet, RainforestBack, RainforestFront, AsiaBack, AsiaFront, SavannaBack, SavannaRock, SavannaFront } from './sets';
import { keys, ss, sm, outBack, blinkAt } from '../lib/anim';
import { lerp, clamp, f, ellipse, shape } from '../lib/paths';
import { Chip, PAL } from '../full/fx';
import { GlobalCaptions } from '../full/Captions';
import { Confetti, Flash } from '../hook/Hook';
import T from './timing.json';

export const PILOT_DUR = T.DUR;
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- fontes ----------
const fontHandle = typeof document !== 'undefined' ? delayRender('fonts') : 0;
if (typeof document !== 'undefined') {
  const faces = [new FontFace('Poppins', `url(${staticFile('Poppins-ExtraBold.ttf')})`, { weight: '800' }), new FontFace('Poppins', `url(${staticFile('Poppins-Bold.ttf')})`, { weight: '700' }), new FontFace('Poppins', `url(${staticFile('Poppins-Black.ttf')})`, { weight: '900' })];
  Promise.all(faces.map((ff) => ff.load())).then((l) => { l.forEach((ff) => (document as any).fonts.add(ff)); continueRender(fontHandle); }).catch(() => continueRender(fontHandle));
}

// =====================================================================================  PLANO A: olhos no escuro
const HEAD_S = 2.78, HEAD_C = [540, 921];          // olhos da cabeça do Pingo em (390, 860) e (690, 860)
const EYE_R = [38 * HEAD_S, 35 * HEAD_S];

const GlowEye: React.FC<{ cx: number; cy: number; open: number; pw: number; glow: number; id: string; t: number }> = ({ cx, cy, open, pw, glow, id, t }) => {
  const [rx, ry] = EYE_R, oy = Math.max(0.001, open);
  const fibers = [];
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2 + rnd(i) * 0.05, r0 = 0.3 + rnd(i + 3) * 0.12, r1 = 0.82 + rnd(i + 5) * 0.14;
    fibers.push(<path key={i} d={`M${f(Math.cos(a) * rx * r0)} ${f(Math.sin(a) * ry * r0)} L${f(Math.cos(a) * rx * r1)} ${f(Math.sin(a) * ry * r1)}`} stroke={i % 3 ? '#2F7A2E' : '#D9F78A'} strokeWidth={i % 3 ? 2.2 : 1.6} opacity={i % 3 ? 0.35 : 0.45} />);
  }
  return (
    <g transform={`translate(${f(cx)} ${f(cy)}) scale(1 ${f(oy)})`}>
      <defs>
        <clipPath id={`${id}c`}><path d={ellipse(0, 0, rx, ry)} /></clipPath>
        <radialGradient id={`${id}g`} cx="0.5" cy="0.55" r="0.62"><stop offset="0" stopColor="#E6FF8A" /><stop offset="0.35" stopColor="#9BDA4A" /><stop offset="0.75" stopColor="#4FA83A" /><stop offset="1" stopColor="#1F5E26" /></radialGradient>
        <radialGradient id={`${id}s`} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#F4FFB0" /><stop offset="0.6" stopColor="#B9F05A" /><stop offset="1" stopColor="#4FA83A" stopOpacity={0} /></radialGradient>
      </defs>
      <circle r={rx * 1.9} fill={`url(#${id}s)`} opacity={0.35 * glow} />
      <path d={ellipse(0, 0, rx, ry)} fill={`url(#${id}g)`} />
      <g clipPath={`url(#${id}c)`}>
        {fibers}
        <path d={ellipse(0, 0, pw + 6, ry * 0.95)} fill="#0E2A12" opacity={0.35} />
        <path d={ellipse(0, 0, pw, ry * 0.92)} fill="#07090A" />
        {/* brilho do tapetum lucidum (reflexo no escuro) */}
        <path d={ellipse(0, ry * 0.08, pw * 0.8, ry * 0.75)} fill={`url(#${id}s)`} opacity={0.75 * glow} />
        <ellipse cx={-rx * 0.32} cy={-ry * 0.4} rx={rx * 0.16} ry={ry * 0.13} fill="#FFFFFF" opacity={0.92} />
        <ellipse cx={rx * 0.28} cy={ry * 0.36} rx={rx * 0.06} ry={ry * 0.05} fill="#FFFFFF" opacity={0.7} />
        <path d={ellipse(0, -ry * 1.15, rx * 1.2, ry * 0.5)} fill="#000" opacity={0.25} />
      </g>
      <path d={ellipse(0, 0, rx, ry)} fill="none" stroke="#1A0E06" strokeWidth={7} />
    </g>
  );
};

const EyesShot: React.FC<{ t: number }> = ({ t }) => {
  const open = sm((t - T.EYES_OPEN) / 0.32) - 0.85 * Math.sin(clamp((t - 0.72) / 0.16) * Math.PI);  // abre, depois uma piscada
  const light = 0.55 * ss((t - T.LIGHT) / 0.5);
  const pw = lerp(lerp(44, 62, ss((t - 0.2) / 0.5)), 9, ss((t - T.LIGHT - 0.05) / 0.45));   // pupila se ajusta à luz
  const glow = 1 - ss((t - T.LIGHT) / 0.4);
  const k = clamp((t - T.PUSH0) / (T.CUT1 - T.PUSH0)), z = 1 + 13 * Math.pow(k, 2.3), m = sm(k);
  const px = 690, py = 860, Cx = lerp(px, 540, m), Cy = lerp(py, 930, m);
  let beat = 0; for (const h of T.HEART) beat = Math.max(beat, Math.exp(-Math.pow((t - h - 0.05) / 0.09, 2)));
  const motes = [];
  for (let i = 0; i < 36; i++) { const x = rnd(i) * 1080 + Math.sin(t * 0.6 + i) * 30, y = (rnd(i + 7) * 1920 - t * (20 + rnd(i + 2) * 30) + 1920) % 1920; motes.push(<circle key={i} cx={f(x)} cy={f(y)} r={1.5 + rnd(i + 4) * 2.5} fill="#E8F5C8" opacity={0.12 + 0.18 * rnd(i + 9)} />); }
  const pp: PingoPose = { x: 0, y: 0, s: 1, dilate: 0.2, blink: 0 };
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <rect width={1080} height={1920} fill="#050608" />
      <g transform={`translate(${f(Cx)} ${f(Cy)}) scale(${f(z)}) translate(${-px} ${-py})`}>
        <g transform={`translate(${HEAD_C[0]} ${HEAD_C[1]}) scale(${HEAD_S})`} opacity={light}><PingoHead p={pp} id="eh" /></g>
        <GlowEye cx={390} cy={860} open={open} pw={pw} glow={glow} id="ge1" t={t} />
        <GlowEye cx={690} cy={860} open={open} pw={pw} glow={glow} id="ge2" t={t} />
      </g>
      {motes}
      <rect width={1080} height={1920} fill="url(#vig)" opacity={0.7 + 0.3 * beat} />
      <defs><radialGradient id="vig" cx="0.5" cy="0.45" r="0.75"><stop offset="0.55" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.95} /></radialGradient></defs>
    </svg>
  );
};

// =====================================================================================  PLANO B: Pingo na mesa
const PINGO = { x: 540, y: 1335, s: 1.42 };
function pingoPose(t: number): PingoPose {
  const crouch = ss((t - T.CROUCH) / 0.32);
  const wig = crouch * Math.sin((t - T.CROUCH) * 30) * ss((t - T.CROUCH - 0.18) / 0.1);
  const twitch = Math.exp(-Math.pow((t - T.BOING) / 0.06, 2));
  return {
    ...PINGO,
    tilt: keys(t, [[1.8, -3], [T.TILT, 0], [T.TILT + 0.28, 15], [3.62, 15], [3.86, 2], [4.4, 0]], outBack as any) + 1.5 * Math.sin(t * 2.1),
    blink: Math.max(blinkAt(t, [2.12]), keys(t, [[T.SLOWBLINK, 0], [T.SLOWBLINK + 0.24, 1], [T.SLOWBLINK + 0.4, 1], [T.SLOWBLINK + 0.64, 0]])),
    dilate: keys(t, [[1.8, 0.2], [T.CROUCH, 0.25], [T.CROUCH + 0.25, 1]]),
    look: keys<number[]>(t, [[1.8, [0, 0]], [T.CROUCH, [0, 0]], [T.CROUCH + 0.2, [0, -6]]]) as [number, number],
    earL: -18 * twitch + keys(t, [[T.CROUCH, 0], [T.CROUCH + 0.2, 8]]),
    earR: -24 * twitch + keys(t, [[T.CROUCH, 0], [T.CROUCH + 0.2, 8]]),
    crouch, wiggle: wig, tail: t * (1 + crouch * 2.5), headDy: 6 * Math.sin(t * 2.1) * (1 - crouch),
  };
}
const Hearts: React.FC<{ t: number; t0: number; x: number; y: number }> = ({ t, t0, x, y }) => {
  const k = (t - t0) / 1.0;
  if (k <= 0 || k >= 1) return null;
  const hs = [];
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (i - 2.5) * 0.45, r = 170 + 240 * sm(k), sc = (1.0 + rnd(i) * 0.7) * outBack(k * 3) * (1 - ss((k - 0.7) / 0.3));
    const hx = x + Math.cos(a) * r * 1.2, hy = y + Math.sin(a) * r * 0.8 - 40 * k;
    hs.push(<path key={i} transform={`translate(${f(hx)} ${f(hy)}) scale(${f(sc)}) rotate(${f((i - 2.5) * 10)})`} d="M0 30 C-34 6 -44 -12 -34 -26 C-24 -40 -6 -36 0 -20 C6 -36 24 -40 34 -26 C44 -12 34 6 0 30 Z" fill={i % 2 ? '#F06AA0' : '#FF9AC4'} stroke={PAL.deep} strokeWidth={5} />);
  }
  return <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>{hs}</svg>;
};

// salto pela lente: cresce em câmera lenta e escurece até virar silhueta
const LeapLayer: React.FC<{ t: number }> = ({ t }) => {
  const k = clamp((t - T.LEAP) / (T.COVER + 0.16 - T.LEAP));
  if (t < T.LEAP || k >= 1) return null;
  const s = PINGO.s * (1 + 9 * Math.pow(k, 2.6)), up = -2600 * ss((k - 0.72) / 0.28);
  const dark = 1 - 0.85 * ss((k - 0.35) / 0.35);
  const p: PingoPose = { x: 540, y: lerp(PINGO.y - 120, 1500, sm(k)) + up, s, dilate: 1, meow: 0, earL: -10, earR: -10, look: [0, -4] };
  return <div style={{ position: 'absolute', inset: 0, filter: `brightness(${f(dark)}) blur(${f(k * 3)}px)` }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920"><PingoLeap p={p} id="lp" stretch={1 + k} /></svg>
  </div>;
};

/** linhas radiais de velocidade (zoom) */
const ZoomLines: React.FC<{ t: number; a: number; cx?: number; cy?: number }> = ({ t, a, cx = 540, cy = 900 }) => {
  if (a <= 0.01) return null;
  const ls = [];
  for (let i = 0; i < 40; i++) {
    const ang = rnd(i) * Math.PI * 2, r0 = 380 + ((t * (1800 + rnd(i + 3) * 1200) + rnd(i + 5) * 900) % 900), len = 140 + rnd(i + 7) * 260;
    ls.push(<path key={i} d={`M${f(cx + Math.cos(ang) * r0)} ${f(cy + Math.sin(ang) * r0)} L${f(cx + Math.cos(ang) * (r0 + len))} ${f(cy + Math.sin(ang) * (r0 + len))}`} stroke="#FFFFFF" strokeWidth={4 + rnd(i + 2) * 6} strokeLinecap="round" opacity={0.5} />);
  }
  return <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: a }}>{ls}</svg>;
};

const TableShot: React.FC<{ t: number }> = ({ t }) => {
  const rev = sm((t - T.CUT1) / (T.REVEAL_END - T.CUT1));
  const leapK = ss((t - T.LEAP) / 0.45);
  const zoom = lerp(2.5, 1.0, rev) + 0.06 * ss((t - T.TILT) / 1.4) + 0.12 * leapK;
  const cy = lerp(PINGO.y - 470 * PINGO.s, 960, rev);
  const p = pingoPose(t);
  return <StudySet t={t} zoom={zoom} cx={540 + 4 * Math.sin(t * 0.8)} cy={cy + 3 * Math.sin(t)}>
    {t < T.LEAP + 0.02 ? <PingoSit p={p} id="ps" /> : null}
  </StudySet>;
};

// =====================================================================================  PLANOS D, E, F: os grandes felinos
const S_CAT = 1.42, GROUND = 1300, LIFT = -100;
const walkX = (t: number, t0: number, x0: number, T_CYC: number, stride: number, dir = 1) => x0 + dir * (stride / (0.6 * T_CYC)) * S_CAT * (t - t0);

const JaguarShot: React.FC<{ t: number }> = ({ t }) => {
  const t0 = T.COVER - 0.1, Tc = 0.95;
  const wx = walkX(t, t0, 420, Tc, 120), cam = 0.55 * (wx - 420);
  return <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
    <g transform={`translate(0 ${LIFT})`}>
      <RainforestBack t={t} cam={cam} />
      <BigCat kind="jaguar" pose={{ x: wx - cam, y: GROUND - LIFT, s: S_CAT, walk: (t - t0) / Tc, moving: 1, headRot: 4 + 3 * Math.sin(t * 3), blink: blinkAt(t, [5.6]) }} t={t} id="jg" />
      <RainforestFront t={t} cam={cam} />
    </g>
  </svg>;
};
const TigerShot: React.FC<{ t: number }> = ({ t }) => {
  const t0 = T.WHIP - 0.2, Tc = 1.0;
  const wx = walkX(t, t0, 720, Tc, 140, -1), cam = 0.5 * (wx - 720);
  return <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
    <g transform={`translate(0 ${LIFT})`}>
      <AsiaBack t={t} cam={cam} />
      <BigCat kind="tiger" pose={{ x: wx - cam, y: GROUND - LIFT, s: S_CAT, flip: true, walk: (t - t0) / Tc, moving: 1, headRot: 2 + 2 * Math.sin(t * 2.6), blink: blinkAt(t, [6.6]) }} t={t} id="tg" />
      <AsiaFront t={t} cam={cam} />
    </g>
  </svg>;
};
const LionShot: React.FC<{ t: number }> = ({ t }) => {
  const k = clamp((t - T.CUT4) / (T.CUT5 - T.CUT4));
  const zoom = 1 + 0.32 * sm(k) + 0.1 * ss((t - T.ROAR) / 0.3);
  const raise = sm((t - T.LION_RAISE) / 0.35);
  const jaw = sm((t - T.ROAR) / 0.12) * (1 - sm((t - T.ROAR_END) / 0.12));
  let shake = 0; { const d = t - T.ROAR; if (d > 0 && d < 0.55) shake = Math.sin(d * 75) * 12 * (1 - d / 0.55); }
  const fx = 770, fy = 930;   // foco da câmera: a cabeça do leão
  return <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
    <g transform={`translate(${f(shake)} ${f(shake * 0.5)})`}>
      <SavannaBack t={t} zoom={zoom} />
      <g transform={`translate(${fx} ${fy}) scale(${f(zoom)}) translate(${-fx} ${-fy})`}>
        <SavannaRock />
        <BigCat kind="lion" pose={{ x: 400, y: 1352, s: 1.5, walk: 0, moving: 0, headRot: lerp(22, -16, raise) + 2 * Math.sin(t * 1.6), jaw, blink: blinkAt(t, [7.05]) }} t={t} id="ln" />
      </g>
      <SavannaFront t={t} />
    </g>
  </svg>;
};

// =====================================================================================  PLANO G: pegadas e título
const PawPrint: React.FC<{ x: number; y: number; s: number; rot?: number; fill?: string; id?: string; inner?: React.ReactNode }> = ({ x, y, s, rot = 0, fill = PAL.orange, inner }) => (
  <g transform={`translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${f(s)})`}>
    <path d={shape([[-52, 40], [-40, 0], [0, -14], [40, 0], [52, 40], [30, 66], [0, 58], [-30, 66]])} fill={fill} stroke={PAL.deep} strokeWidth={9} strokeLinejoin="round" />
    {[[-66, -22, 18, 24], [-26, -60, 19, 26], [26, -60, 19, 26], [66, -22, 18, 24]].map(([cx, cy, rx, ry], i) => <path key={i} d={ellipse(cx, cy, rx, ry)} fill={fill} stroke={PAL.deep} strokeWidth={9} />)}
    <path d={ellipse(-18, 10, 14, 8)} fill="#FFFFFF" opacity={0.45} />
    {inner}
  </g>
);
const Rays: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  const n = 20, rays = [];
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2 + (t - t0) * 0.7, a1 = a0 + Math.PI / n;
    rays.push(<path key={i} d={`M540 860 L${f(540 + Math.cos(a0) * 1700)} ${f(860 + Math.sin(a0) * 1700)} L${f(540 + Math.cos(a1) * 1700)} ${f(860 + Math.sin(a1) * 1700)} Z`} fill={i % 2 ? PAL.royal : PAL.navy} />);
  }
  return <g>
    <rect width={1080} height={1920} fill={PAL.deep} />
    <defs><radialGradient id="rv"><stop offset="0" stopColor={PAL.orange} stopOpacity={0.85} /><stop offset="0.45" stopColor={PAL.royal} stopOpacity={0.2} /><stop offset="1" stopColor={PAL.deep} stopOpacity={0} /></radialGradient></defs>
    <g transform={`translate(540 860) scale(${f(0.7 + 0.4 * sm((t - t0) / 1.2))}) translate(-540 -860)`}>{rays}</g>
    <circle cx={540} cy={860} r={760} fill="url(#rv)" />
  </g>;
};
const PAWS = [[180, 1010, -18], [400, 880, 12], [640, 1000, -14], [880, 860, 16]];
const PAD = [[-52, 40], [-40, 0], [0, -14], [40, 0], [52, 40], [30, 66], [0, 58], [-30, 66]];
const SETTLED = (i: number) => [330 + i * 140, 470 + (i % 2 ? -18 : 18), i === 2 ? 0 : i % 2 ? 7 : -7];
const TitleShot: React.FC<{ t: number }> = ({ t }) => {
  const dk = clamp((t - T.DIVE) / (T.DUR - T.DIVE)), dz = 1 + 22 * Math.pow(dk, 2.2);
  const [px, py] = SETTLED(2), SC = 0.62, O = [px, py + 25 * SC];   // centro do coxim da pegada do meio
  const settle = sm((t - T.PAWS[3] - 0.17) / 0.24), fade = 1 - ss(dk / 0.35);
  const letters = 'FELINOS'.split('');
  const win = shape(PAD.map(([x, y]) => [O[0] + x * SC * dz * 0.86, O[1] + (y - 25) * SC * dz * 0.86]));
  return <div style={{ position: 'absolute', inset: 0 }}>
    <div style={{ position: 'absolute', inset: 0, transformOrigin: `${f(O[0])}px ${f(O[1])}px`, transform: `scale(${f(dz)})` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <Rays t={t} t0={T.CUT5} />
        {PAWS.map(([x, y, r], i) => {
          const k = (t - T.PAWS[i]) / 0.2;
          if (k <= 0) return null;
          const s = k < 1 ? lerp(2.2, 1.0, sm(k)) : 1 + 0.07 * Math.exp(-(t - T.PAWS[i] - 0.2) * 9) * Math.sin((t - T.PAWS[i]) * 40);
          // depois de pisar, as pegadas sobem e formam a fileira acima do título
          const [sx, sy, sr] = SETTLED(i);
          const tx = lerp(x, sx, settle), ty = lerp(y, sy, settle), sc = lerp(1.15, SC, settle) * s;
          return <g key={i} opacity={clamp(k * 3)}>
            {k < 2.5 ? <circle cx={x} cy={y} r={110 + 160 * clamp(k - 1)} fill="none" stroke="#FFFFFF" strokeWidth={10 * (1 - clamp((k - 1) / 1.5))} opacity={0.6 * (1 - clamp((k - 1) / 1.5))} /> : null}
            <PawPrint x={tx} y={ty} s={sc} rot={lerp(r, sr, settle)} />
          </g>;
        })}
      </svg>
      {/* título letra a letra */}
      <div style={{ position: 'absolute', inset: 0, opacity: fade }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center' }}>
        {letters.map((ch, i) => {
          const k = outBack((t - T.LETTERS - i * 0.04) / 0.3);
          return <span key={i} style={{ display: 'inline-block', fontFamily: 'Poppins', fontWeight: 900, fontSize: 196, lineHeight: 1, color: PAL.yellow,
            WebkitTextStroke: `18px ${PAL.deep}`, paintOrder: 'stroke fill', textShadow: `0 16px 0 ${PAL.deep}, 0 30px 46px rgba(0,0,0,.45)`,
            transform: `translateY(${f((1 - k) * 170)}px) rotate(${f((1 - k) * (i % 2 ? 18 : -18))}deg) scale(${f(Math.max(0, k))})`, opacity: clamp(k * 3) }}>{ch}</span>;
        })}
      </div>
      <Chip t={t} t0={T.SUB} t1={99} x={540} y={850} text={<>UMA AVENTURA <span style={{ color: PAL.yellow }}>SELVAGEM!</span></>} bg={PAL.navy} size={62} />
      <Chip t={t} t0={T.EN} t1={99} x={540} y={985} text="Especialidade EN-024" bg={PAL.turq} size={40} />
      <Chip t={t} t0={T.SERIES} t1={99} x={540} y={1090} text="SÉRIE ESPECIALIDADES DOS DESBRAVADORES" bg={PAL.yellow} color={PAL.navy} size={30} />
      </div>
    </div>
    {/* a câmera atravessa a pegada: o coxim vira uma janela para a próxima cena */}
    {dk > 0 ? <div style={{ position: 'absolute', inset: 0, clipPath: `path('${win}')` }}><StudySet t={t} zoom={lerp(1.7, 1.2, dk)} cx={540} cy={1000} /></div> : null}
  </div>;
};

// =====================================================================================  composição
export const Pilot: React.FC<{ subs?: boolean; audio?: boolean }> = ({ subs = true, audio = true }) => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  // transição em chicote (whip pan) entre onça e tigre
  const wk = clamp((t - T.WHIP) / 0.16), whip = sm(wk);
  const inJag = t >= T.COVER && t < T.WHIP + 0.16, inTig = t >= T.WHIP && t < T.CUT4;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {audio ? <Audio src={staticFile('piloto_felinos_mix.wav')} /> : null}
      {t < T.CUT1 ? <EyesShot t={t} /> : null}
      {t >= T.CUT1 && t < T.COVER ? <TableShot t={t} /> : null}
      {inJag ? <div style={{ position: 'absolute', inset: 0, transform: `translateX(${f(-1080 * whip)}px)`, filter: wk > 0 ? `blur(${f(14 * Math.sin(wk * Math.PI))}px)` : undefined }}><JaguarShot t={t} /></div> : null}
      {inTig ? <div style={{ position: 'absolute', inset: 0, transform: `translateX(${f(1080 * (1 - whip))}px)`, filter: wk < 1 ? `blur(${f(14 * Math.sin(wk * Math.PI))}px)` : undefined }}><TigerShot t={t} /></div> : null}
      {t >= T.CUT4 && t < T.CUT5 ? <LionShot t={t} /> : null}
      {t >= T.CUT5 ? <TitleShot t={t} /> : null}
      {/* camadas de efeito */}
      {t >= T.CUT1 && t < T.COVER ? <Hearts t={t} t0={T.HEARTS} x={540} y={PINGO.y - 470 * PINGO.s} /> : null}
      <ZoomLines t={t} a={ss((t - T.LEAP - 0.05) / 0.12) * (1 - ss((t - T.COVER) / 0.12))} />
      <LeapLayer t={t} />
      <Chip t={t} t0={T.JAG_CHIP} t1={T.WHIP - 0.05} x={540} y={330} text="ONÇA-PINTADA" bg={PAL.green} size={58} rot={-3} />
      <Chip t={t} t0={T.TIG_CHIP} t1={T.CUT4 - 0.08} x={540} y={330} text="TIGRE" bg={PAL.orange} size={64} rot={3} />
      <Chip t={t} t0={T.LION_CHIP} t1={T.CUT5 - 0.08} x={540} y={330} text="LEÃO" bg={PAL.red} size={64} rot={-3} />
      <Confetti t={t} t0={T.LETTERS + 0.1} ox={540} oy={900} />
      <Flash t={t} t0={T.CUT1} />
      <Flash t={t} t0={T.CUT4} />
      <Flash t={t} t0={T.CUT5} />
      {subs ? <GlobalCaptions t={t} /> : null}
    </AbsoluteFill>
  );
};
