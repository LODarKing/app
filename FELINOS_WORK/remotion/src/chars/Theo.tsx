// THEO — profile puppet in his manual wheelchair. Body/chair vectorized from the model sheet;
// the rear wheel and caster are drawn parametrically so they can roll; face features are animatable.
import React from 'react';
import { Traced, PartData } from './Traced';
import { Expr } from './Face';
import { f, lerp, clamp, shape } from '../lib/paths';
import { solve2, deg } from '../lib/anim';
import data from './data/theo.json';

const parts = (data as any).parts as Record<string, PartData>;
export const AXLE = [448, 930], R_TIRE = 222, R_RIM = 196, CASTER = [752, 1104], R_CASTER = 57, GROUND = 1152;
const SHOULDER = [452, 486], ELBOW = [400, 668], GRIP = [515, 778], HIP = [520, 690], NECK = [552, 395];
const L1 = Math.hypot(ELBOW[0] - SHOULDER[0], ELBOW[1] - SHOULDER[1]), L2 = Math.hypot(GRIP[0] - ELBOW[0], GRIP[1] - ELBOW[1]);
const A1R = Math.atan2(ELBOW[1] - SHOULDER[1], ELBOW[0] - SHOULDER[0]), A2R = Math.atan2(GRIP[1] - ELBOW[1], GRIP[0] - ELBOW[0]);
export const GRIP_R = Math.hypot(GRIP[0] - AXLE[0], GRIP[1] - AXLE[1]);

/** clean vector insignia (the traced ones are too soft at this size) */
const Tri: React.FC<{ p: number[][] }> = ({ p }) => {
  const c = [(p[0][0] + p[1][0] + p[2][0]) / 3, (p[0][1] + p[1][1] + p[2][1]) / 3];
  const sc = (k: number) => p.map(([x, y]) => [c[0] + (x - c[0]) * k, c[1] + (y - c[1]) * k]);
  const d = (q: number[][]) => `M${q.map((v) => `${f(v[0])} ${f(v[1])}`).join(' L')} Z`;
  return <g strokeLinejoin="round">
    <path d={d(p)} fill="#D6382B" stroke="#9E2318" strokeWidth={2.5} />
    <path d={d(sc(0.74))} fill="#FED52C" stroke="#F28C28" strokeWidth={2} />
    <path d={d(sc(0.42))} fill="#FFFFFF" />
  </g>;
};
const Chest: React.FC = () => (
  <g>
    <path d="M546 568 L600 566 L601 626 Q600 636 590 636 L556 637 Q546 637 546 627 Z" fill="#EFDCB9" stroke="#C9B08A" strokeWidth={2.6} />
    <path d="M545 566 L601 564 L601 588 Q574 592 545 589 Z" fill="#E3CDA6" stroke="#C9B08A" strokeWidth={2.6} strokeLinejoin="round" />
    <circle cx={573} cy={580} r={4.5} fill="#9C8460" />
    <rect x={543} y={515} width={48} height={18} rx={5} fill="#254A34" />
    <rect x={543} y={526} width={48} height={7} rx={3} fill="#1B3826" />
    <circle cx={552} cy={503} r={5.5} fill="#E9B23A" /><circle cx={566} cy={502} r={5.5} fill="#E9B23A" />
    <Tri p={[[574, 469], [628, 467], [601, 515]]} />
  </g>
);

export type TheoPose = { x: number; y: number; scale: number; wheel: number; lean: number; head: number; grip: [number, number]; expr: Expr };

function mouthD(open: number, smile: number) {
  const bx = 626, fx = 674, by = 324 - 5 * smile, fy = 331 - 8 * smile;
  const drop = 3 + 34 * open, mx = (bx + fx) / 2, my = (by + fy) / 2, topSag = -1.5 + 3 * Math.max(0, -smile);
  return `M${f(bx)} ${f(by)} C${f(bx + 14)} ${f(by + topSag)} ${f(fx - 14)} ${f(fy + topSag)} ${f(fx)} ${f(fy)} C${f(fx - 2)} ${f(fy + drop * 0.9)} ${f(mx + 8)} ${f(my + drop * 1.25)} ${f(mx - 4)} ${f(my + drop * 1.1)} C${f(bx + 6)} ${f(by + drop)} ${f(bx - 2)} ${f(by + drop * 0.45)} ${f(bx)} ${f(by)} Z`;
}
function browD(raise: number, worry: number) {
  const y0 = 220 - raise + 6 * worry, y1 = 200 - raise - 8 * worry;
  return `M589 ${f(y0)} Q${f(608)} ${f(Math.min(y0, y1) - 16)} ${f(633)} ${f(y1)}`;
}

const Wheel: React.FC<{ rot: number }> = ({ rot }) => {
  const [cx, cy] = AXLE;
  const spokes = [];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2, a2 = a + 0.36 * (i % 2 ? 1 : -1);
    spokes.push(<line key={i} x1={f(cx + Math.cos(a) * 34)} y1={f(cy + Math.sin(a) * 34)} x2={f(cx + Math.cos(a2) * (R_RIM - 26))} y2={f(cy + Math.sin(a2) * (R_RIM - 26))} stroke="#E9ECEF" strokeWidth={5} strokeLinecap="round" />);
  }
  return (
    <g>
      <g transform={`rotate(${f(deg(rot))} ${cx} ${cy})`}>
        <circle cx={cx} cy={cy} r={R_TIRE - 14} fill="none" stroke="#2A2A2C" strokeWidth={28} />
        <circle cx={cx} cy={cy} r={R_TIRE - 4} fill="none" stroke="#3E3F42" strokeWidth={5} opacity={0.8} />
        <circle cx={cx} cy={cy} r={R_RIM - 12} fill="none" stroke="#CDD1D6" strokeWidth={26} />
        <circle cx={cx} cy={cy} r={R_RIM - 22} fill="none" stroke="#A9B0B8" strokeWidth={6} />
        <circle cx={cx} cy={cy} r={R_RIM - 1} fill="none" stroke="#F4F6F8" strokeWidth={3} />
        {spokes}
        <circle cx={cx} cy={cy} r={40} fill="#232425" />
        <circle cx={cx - 6} cy={cy - 6} r={28} fill="#3A3B3D" opacity={0.6} />
        <circle cx={cx} cy={cy} r={11} fill="#A3AAB2" />
        <circle cx={cx + 90} cy={cy - 120} r={7} fill="#3A3B3D" opacity={0.0} />
      </g>
      <path d={`M${cx - R_TIRE + 6} ${cy} A${R_TIRE - 6} ${R_TIRE - 6} 0 0 1 ${cx} ${cy - R_TIRE + 6}`} stroke="#FFFFFF" strokeOpacity={0.12} strokeWidth={6} fill="none" />
    </g>
  );
};

const Caster: React.FC<{ rot: number }> = ({ rot }) => {
  const [cx, cy] = CASTER;
  return (
    <g>
      <rect x={cx - 6} y={cy - 74} width={12} height={74} rx={5} fill="#CDD1D6" />
      <g transform={`rotate(${f(deg(rot))} ${cx} ${cy})`}>
        <circle cx={cx} cy={cy} r={R_CASTER} fill="#2A2A2C" />
        <circle cx={cx} cy={cy} r={R_CASTER - 22} fill="#9AA1A8" />
        <circle cx={cx} cy={cy} r={R_CASTER - 30} fill="#5B6168" />
        <rect x={cx - 3} y={cy - R_CASTER + 4} width={6} height={14} rx={3} fill="#3E3F42" />
      </g>
      <circle cx={cx} cy={cy} r={10} fill="#D9DDE1" />
    </g>
  );
};

export const Theo: React.FC<{ pose: TheoPose; id: string }> = ({ pose, id }) => {
  const x = pose.expr;
  // IK: grip target (sheet coords) -> shoulder/elbow rotations, shoulder carried by the torso lean
  const lean = pose.lean * Math.PI / 180, c = Math.cos(lean), s = Math.sin(lean);
  const sx = HIP[0] + (SHOULDER[0] - HIP[0]) * c - (SHOULDER[1] - HIP[1]) * s, sy = HIP[1] + (SHOULDER[0] - HIP[0]) * s + (SHOULDER[1] - HIP[1]) * c;
  const sol = solve2(sx, sy, pose.grip[0], pose.grip[1], L1, L2, 1);
  const up = deg(sol.a1 - A1R) - pose.lean, fo = deg((sol.a2 - sol.a1) - (A2R - A1R));
  const leanT = `rotate(${f(pose.lean)} ${HIP[0]} ${HIP[1]})`;
  const armT = `${leanT} rotate(${f(up)} ${SHOULDER[0]} ${SHOULDER[1]})`;
  const blink = clamp(x.blink);
  const open = clamp(x.open);
  return (
    <g transform={`translate(${f(pose.x)} ${f(pose.y)}) scale(${pose.scale}) translate(${-AXLE[0]} ${-GROUND})`}>
      <Traced part={parts.chairBack} />
      {/* seat sling / side panel seen through the spokes */}
      <path d={shape([[372, 690], [772, 688], [776, 716], [742, 790], [722, 905, 1], [372, 905, 1]])} fill="#232425" />
      <path d={shape([[380, 700], [700, 700], [690, 760], [380, 770]])} fill="#2D2E30" opacity={0.7} />
      <g transform={leanT}>
        <Traced part={parts.torso} />
        <Chest />
        <g transform={`rotate(${f(pose.head)} ${NECK[0]} ${NECK[1]})`}>
          <Traced part={parts.head} />
          {/* eye */}
          <defs><clipPath id={`${id}-eye`}><ellipse cx={621} cy={259} rx={21} ry={28} /></clipPath></defs>
          <ellipse cx={621} cy={259} rx={21} ry={28} fill="#FFFFFF" />
          <g clipPath={`url(#${id}-eye)`}>
            <ellipse cx={629 + x.look[0]} cy={265 + x.look[1]} rx={12} ry={20} fill="#4D301B" />
            <circle cx={633 + x.look[0]} cy={254 + x.look[1]} r={4.5} fill="#FFFFFF" />
            <rect x={596} y={228} width={52} height={blink * 62} fill="#FEC585" />
          </g>
          {blink > 0.55 ? <path d={`M600 ${f(229 + blink * 56)} Q621 ${f(236 + blink * 56)} 642 ${f(229 + blink * 56)}`} stroke="#B56F3E" strokeWidth={5} strokeLinecap="round" fill="none" /> : null}
          <path d={browD(x.browUp, x.worry)} stroke="#3D2F24" strokeWidth={9} strokeLinecap="round" fill="none" />
          {open < 0.08
            ? <path d={`M628 ${f(326 - 5 * x.smile)} Q650 ${f(332 + 6 * x.smile)} 672 ${f(330 - 7 * x.smile)}`} stroke="#5E1C1C" strokeWidth={5} strokeLinecap="round" fill="none" />
            : <g>
                <defs><clipPath id={`${id}-m`}><path d={mouthD(open, x.smile)} /></clipPath></defs>
                <path d={mouthD(open, x.smile)} fill="#822827" />
                <g clipPath={`url(#${id}-m)`}><ellipse cx={652} cy={f(334 - 6 * x.smile + 34 * open)} rx={22} ry={f(8 + 10 * open)} fill="#DC665F" /></g>
              </g>}
        </g>
      </g>
      <Traced part={parts.chair} />
      <g transform={armT}><Traced part={parts.armUpper} /><Tri p={[[430, 484], [493, 505], [434, 547]]} /></g>
      <Wheel rot={pose.wheel} />
      <g transform={`${armT} rotate(${f(fo)} ${ELBOW[0]} ${ELBOW[1]})`}>
        <circle cx={ELBOW[0]} cy={ELBOW[1]} r={24} fill="#FEC585" />
        <Traced part={parts.armFore} />
      </g>
      <Caster rot={pose.wheel * R_TIRE / R_CASTER} />
    </g>
  );
};
export const THEO_GRIP_REST = GRIP;
