// Front-view standing kid puppet (Gabriel, Desbravadora) built from the vectorized model sheet.
import React from 'react';
import { Traced, PartData } from './Traced';
import { Eye, Brow, Mouth, Expr, EyeSpec, BrowSpec, MouthSpec } from './Face';
import { f } from '../lib/paths';

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
  jointR: number;              // radius of elbow/wrist joint patches
  hipsPart: string;            // 'hips' or 'skirt'
};

const P = (part: PartData) => part.pivot as number[];

const Arm: React.FC<{ rig: KidRig; side: 'L' | 'R'; p: ArmPose }> = ({ rig, side, p }) => {
  const U = rig.data.parts['arm' + side + 'U'], F = rig.data.parts['arm' + side + 'F'], H = rig.data.parts['arm' + side + 'H'];
  const pu = P(U), pf = P(F), ph = P(H);
  const open = p.open || 0;
  return (
    <g transform={`rotate(${f(p.sh)} ${pu[0]} ${pu[1]})`}>
      <circle cx={pf[0]} cy={pf[1]} r={rig.jointR} fill={rig.skin} />
      <g transform={`rotate(${f(p.el)} ${pf[0]} ${pf[1]})`}>
        <circle cx={ph[0]} cy={ph[1]} r={rig.jointR * 0.9} fill={rig.skin} />
        <Traced part={F} />
        <g transform={`rotate(${f(p.wr)} ${ph[0]} ${ph[1]})`}>
          <g opacity={1 - open}><Traced part={H} /></g>
          {open > 0 ? <g opacity={open}>{rig.openHand(side)}</g> : null}
        </g>
      </g>
      <Traced part={U} />
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
        {pose.armR.sh > -60 ? <Arm rig={rig} side="R" p={pose.armR} /> : null}
        {pose.armL.sh < 60 ? <Arm rig={rig} side="L" p={pose.armL} /> : null}
        <g transform={`translate(0 ${f(pose.headDy || 0)}) rotate(${f(pose.head)} ${head[0]} ${head[1]})`}>
          <Traced part={parts.head} />
          {rig.brows.map((b, i) => <Brow key={i} s={b} x={x} color={rig.brow} />)}
          {rig.eyes.map((e, i) => <Eye key={i} e={e} x={x} skin={rig.skin} pupil={rig.pupil} lid={rig.lid} id={`${id}-eye${i}`} />)}
          <Mouth s={rig.mouth} x={x} id={`${id}-mouth`} />
        </g>
        {/* a raised arm passes in front of the hair */}
        {pose.armR.sh <= -60 ? <Arm rig={rig} side="R" p={pose.armR} /> : null}
        {pose.armL.sh >= 60 ? <Arm rig={rig} side="L" p={pose.armL} /> : null}
      </g>
    </g>
  );
};

export const restArm: ArmPose = { sh: 0, el: 0, wr: 0, open: 0 };
