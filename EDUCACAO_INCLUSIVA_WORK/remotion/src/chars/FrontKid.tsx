// Front-view standing kid puppet (Gabriel, Desbravadora) built from the vectorized model sheet.
import React from 'react';
import { Traced, PartData } from './Traced';
import { Eye, Brow, Mouth, Expr, EyeSpec, BrowSpec, MouthSpec } from './Face';
import { f, shape } from '../lib/paths';
import { capsuleD } from '../lib/limb';

export type ArmPose = { sh: number; el: number; wr: number; open?: number };   // degrees (positive = clockwise on screen)
export type KidPose = {
  x: number; y: number; scale: number;
  bob: number; lean: number; head: number; headDy?: number;
  armL: ArmPose; armR: ArmPose;
  legL: { dx: number; dy: number; rot: number }; legR: { dx: number; dy: number; rot: number };
  expr: Expr; skirt?: number;
};
export type KidRig = {
  data: { parts: Record<string, PartData> };
  root: [number, number];      // feet centre on the sheet
  hip: [number, number];       // lean pivot
  skin: string; skinShade: string; pupil: string; brow: string; lid: string;
  eyes: EyeSpec[]; brows: BrowSpec[]; mouth: MouthSpec;
  openHand: (side: 'L' | 'R') => React.ReactNode;     // open palm drawn in the wrist's frame
  jointR: number;
  hipsPart: string;            // 'hips' or 'skirt'
  arms: { L: ArmSpec; R: ArmSpec };
  cloth: Cloth;
};

const P = (part: PartData) => part.pivot as number[];

export type ArmSpec = {
  S: number[]; E: number[]; W: number[]; r: [number, number, number];
  sleeve: number[][];            // closed outline in rest pose (points [x, y, corner?])
  hem: number[][];               // two points of the cuff line
  patch: { kind: 'tri'; pts: number[][] } | { kind: 'world'; c: number[]; r: number };
};
export type Cloth = { shirt: string; shirtShade: string; shirtLine: string; skinLine: string };

const TriPatch: React.FC<{ p: number[][] }> = ({ p }) => {
  const c = [(p[0][0] + p[1][0] + p[2][0]) / 3, (p[0][1] + p[1][1] + p[2][1]) / 3];
  const sc = (k: number) => p.map(([x, y]) => [c[0] + (x - c[0]) * k, c[1] + (y - c[1]) * k]);
  const d = (q: number[][]) => `M${q.map((v) => `${f(v[0])} ${f(v[1])}`).join(' L')} Z`;
  return <g strokeLinejoin="round"><path d={d(p)} fill="#D6382B" stroke="#9E2318" strokeWidth={2.5} /><path d={d(sc(0.72))} fill="#F6B21E" stroke="#F28C28" strokeWidth={2} /><path d={d(sc(0.4))} fill="#FFFFFF" /></g>;
};
const WorldPatch: React.FC<{ c: number[]; r: number }> = ({ c, r }) => (
  <g>
    <circle cx={c[0]} cy={c[1]} r={r} fill="#F28C28" stroke="#9E2318" strokeWidth={2} />
    <circle cx={c[0]} cy={c[1]} r={r * 0.8} fill="#D6382B" />
    <circle cx={c[0]} cy={c[1]} r={r * 0.66} fill="#2F86C9" />
    <path d={shape([[c[0] - r * 0.4, c[1] - r * 0.3], [c[0] + r * 0.05, c[1] - r * 0.5], [c[0] + r * 0.2, c[1] - r * 0.1], [c[0] - r * 0.05, c[1] + r * 0.25], [c[0] - r * 0.35, c[1] + r * 0.1]])} fill="#58B04A" />
    <path d={shape([[c[0] + r * 0.22, c[1] + r * 0.12], [c[0] + r * 0.5, c[1] + r * 0.05], [c[0] + r * 0.36, c[1] + r * 0.45]])} fill="#58B04A" />
  </g>
);

/** fully drawn arm: skin limb (one silhouette), traced hand or open palm, sleeve with insignia on top */
const Arm: React.FC<{ rig: KidRig; side: 'L' | 'R'; p: ArmPose; id: string }> = ({ rig, side, p, id }) => {
  const A = rig.arms[side], H = rig.data.parts['arm' + side + 'H'], cl = rig.cloth;
  const open = p.open || 0;
  const upper = capsuleD(A.S, A.E, A.r[0], A.r[1]), fore = capsuleD(A.E, A.W, A.r[1], A.r[2] * 1.02);
  const sl = shape(A.sleeve);
  const sx = A.S[0] > rig.hip[0] ? 1 : -1;     // outer side of this arm
  return (
    <g transform={`rotate(${f(p.sh)} ${A.S[0]} ${A.S[1]})`}>
      <path d={upper} fill="none" stroke={cl.skinLine} strokeWidth={3.2} />
      <g transform={`rotate(${f(p.el)} ${A.E[0]} ${A.E[1]})`}>
        <g transform={`rotate(${f(p.wr)} ${A.W[0]} ${A.W[1]})`}>
          <g opacity={1 - open}><Traced part={H} /></g>
          {open > 0 ? <g opacity={open}>{rig.openHand(side)}</g> : null}
        </g>
        <path d={fore} fill={rig.skin} stroke={cl.skinLine} strokeWidth={3.2} />
        <defs><clipPath id={`${id}-f${side}`}><path d={fore} /></clipPath></defs>
        <g clipPath={`url(#${id}-f${side})`}><path d={capsuleD([A.E[0] + sx * A.r[1] * 0.75, A.E[1]], [A.W[0] + sx * A.r[2] * 0.7, A.W[1]], A.r[1] * 0.45, A.r[2] * 0.4)} fill={rig.skinShade} opacity={0.75} /></g>
      </g>
      <path d={upper} fill={rig.skin} />
      <defs><clipPath id={`${id}-u${side}`}><path d={upper} /></clipPath><clipPath id={`${id}-s${side}`}><path d={sl} /></clipPath></defs>
      <g clipPath={`url(#${id}-u${side})`}><path d={capsuleD([A.S[0] + sx * A.r[0] * 0.75, A.S[1]], [A.E[0] + sx * A.r[1] * 0.75, A.E[1]], A.r[0] * 0.45, A.r[1] * 0.45)} fill={rig.skinShade} opacity={0.75} /></g>
      <path d={sl} fill={cl.shirt} stroke={cl.shirtLine} strokeWidth={3} strokeLinejoin="round" />
      <g clipPath={`url(#${id}-s${side})`}>
        <path d={`M${f(A.hem[0][0])} ${f(A.hem[0][1] - 4)} L${f(A.hem[1][0])} ${f(A.hem[1][1] - 4)} L${f(A.hem[1][0])} ${f(A.hem[1][1] + 40)} L${f(A.hem[0][0])} ${f(A.hem[0][1] + 40)} Z`} fill={cl.shirtShade} />
        <path d={`M${f(A.hem[0][0])} ${f(A.hem[0][1] - 4)} L${f(A.hem[1][0])} ${f(A.hem[1][1] - 4)}`} stroke={cl.shirtLine} strokeWidth={2.4} />
        <ellipse cx={A.S[0] + sx * A.r[0] * 1.1} cy={(A.S[1] + A.hem[0][1]) / 2} rx={A.r[0] * 0.7} ry={(A.hem[0][1] - A.S[1]) * 0.7} fill={cl.shirtShade} opacity={0.55} />
      </g>
      {A.patch.kind === 'tri' ? <TriPatch p={A.patch.pts} /> : <WorldPatch c={A.patch.c} r={A.patch.r} />}
    </g>
  );
};

export const FrontKid: React.FC<{ rig: KidRig; pose: KidPose; id: string }> = ({ rig, pose, id }) => {
  const parts = rig.data.parts;
  const head = P(parts.head);
  const x = pose.expr;
  const leg = (name: 'legL' | 'legR', l: { dx: number; dy: number; rot: number }) => {
    const pv = P(parts[name]);
    return <g transform={`translate(${f(l.dx)} ${f(l.dy)}) rotate(${f(l.rot)} ${pv[0]} ${pv[1]})`}><Traced part={parts[name]} /></g>;
  };
  return (
    <g transform={`translate(${f(pose.x)} ${f(pose.y)}) scale(${pose.scale}) translate(${-rig.root[0]} ${-rig.root[1]})`}>
      {leg('legL', pose.legL)}
      {leg('legR', pose.legR)}
      <g transform={`translate(0 ${f(pose.bob)}) rotate(${f(pose.lean)} ${rig.hip[0]} ${rig.hip[1]})`}>
        <g transform={pose.skirt ? `skewX(${f(pose.skirt)})` : undefined} style={{ transformOrigin: `${rig.hip[0]}px ${rig.hip[1]}px` }}>
          <Traced part={parts[rig.hipsPart]} />
        </g>
        <Traced part={parts.torso} />
        {(['L', 'R'] as const).map((sd) => { const A = rig.arms[sd]; return <ellipse key={sd} cx={A.S[0]} cy={A.S[1] + A.r[0] * 0.2} rx={A.r[0] * 1.15} ry={A.r[0] * 1.05} fill={rig.cloth.shirt} />; })}
        {pose.armR.sh > -60 ? <Arm rig={rig} side="R" p={pose.armR} id={id} /> : null}
        {pose.armL.sh < 60 ? <Arm rig={rig} side="L" p={pose.armL} id={id} /> : null}
        <g transform={`translate(0 ${f(pose.headDy || 0)}) rotate(${f(pose.head)} ${head[0]} ${head[1]})`}>
          <Traced part={parts.head} />
          {rig.brows.map((b, i) => <Brow key={i} s={b} x={x} color={rig.brow} />)}
          {rig.eyes.map((e, i) => <Eye key={i} e={e} x={x} skin={rig.skin} pupil={rig.pupil} lid={rig.lid} id={`${id}-eye${i}`} />)}
          <Mouth s={rig.mouth} x={x} id={`${id}-mouth`} />
        </g>
        {/* a raised arm passes in front of the hair */}
        {pose.armR.sh <= -60 ? <Arm rig={rig} side="R" p={pose.armR} id={id} /> : null}
        {pose.armL.sh >= 60 ? <Arm rig={rig} side="L" p={pose.armL} id={id} /> : null}
      </g>
    </g>
  );
};

export const restArm: ArmPose = { sh: 0, el: 0, wr: 0, open: 0 };
