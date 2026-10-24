// Atuação reutilizável: Theo empurrando a cadeira por um trajeto qualquer; amigos com respiração,
// piscadas, acenos, apontar, gesto de mão aberta e expressões por "chaves" no tempo.
import { KidPose, ArmPose } from '../chars/FrontKid';
import { TheoPose, AXLE, GRIP_R, R_TIRE } from '../chars/Theo';
import { Expr } from '../chars/Face';
import { keys, ss, sm, outBack, blinkAt } from '../lib/anim';
import { clamp, lerp } from '../lib/paths';

export const THEO_S = 0.45, GAB_S = 0.468, GIRL_S = 0.298;

export type ExprKeys = { smile?: [number, number][]; open?: [number, number][]; worry?: [number, number][]; browUp?: [number, number][]; look?: [number, number[]][]; blinks?: number[] };
export function expr(t: number, k: ExprKeys, base: Partial<Expr> = {}): Expr {
  return {
    smile: k.smile ? keys(t, k.smile) : base.smile ?? 0.75,
    open: k.open ? keys(t, k.open) : base.open ?? 0.4,
    worry: k.worry ? keys(t, k.worry) : base.worry ?? 0,
    browUp: k.browUp ? keys(t, k.browUp) : base.browUp ?? 0,
    look: (k.look ? keys<number[]>(t, k.look) : base.look ?? [0, 0]) as [number, number],
    blink: blinkAt(t, k.blinks ?? [0.9, 3.4, 6.1, 8.8, 11.9, 14.6, 17.3, 19.9]),
  };
}

/** Theo empurrando: x(t) em px de cena; mãos presas ao aro no impulso, recuperação em arco */
export function theoRoll(t: number, xAt: (t: number) => number, opts: { scale?: number; y?: number; head?: number; lean?: number; ex: Expr; contact?: number; cycle?: number; phase?: number; restA?: number }): TheoPose {
  const s = opts.scale ?? THEO_S, RW = R_TIRE * s;
  const x = xAt(t), x0 = xAt(-100);
  const rot = (x - x0) / RW;
  const CONTACT = opts.contact ?? 1.08, CYCLE = opts.cycle ?? 2.6, A_GRAB = -1.955;
  const v = (xAt(t + 0.02) - xAt(t - 0.02)) / 0.04;
  const moving = Math.abs(v) > 4;
  let grip: [number, number];
  const rim = (a: number): [number, number] => [AXLE[0] + Math.cos(a) * GRIP_R, AXLE[1] + Math.sin(a) * GRIP_R];
  if (!moving) grip = rim(opts.restA ?? -1.3);
  else {
    const ph = ((rot + (opts.phase ?? 0)) % CYCLE + CYCLE) % CYCLE;
    if (ph < CONTACT) grip = rim(A_GRAB + ph);
    else {
      const k = (ph - CONTACT) / (CYCLE - CONTACT), a = lerp(A_GRAB + CONTACT, A_GRAB, ss(k));
      const p = rim(a), lift = 44 * Math.sin(k * Math.PI);
      grip = [p[0] - lift * 0.35, p[1] - lift];
    }
  }
  const pushK = moving ? 1 : 0;
  return { x, y: opts.y ?? 0, scale: s, wheel: rot, lean: (opts.lean ?? 2) + 3 * pushK, head: opts.head ?? 0, grip, expr: opts.ex };
}

/** braço levantado acenando (lado da tela) com antecipação e overshoot */
export function waveArm(t: number, t0: number, t1: number, side: 'L' | 'R', phase = 0): { w: number; arm: ArmPose } {
  const up = outBack((t - t0 - 0.08) / 0.42), down = ss((t - (t1 - 0.4)) / 0.4);
  const antic = Math.sin(clamp((t - t0) / 0.12) * Math.PI) * 0.06;
  const w = clamp(up * (1 - down) - antic, -0.1, 1.1);
  const m = side === 'L' ? 1 : -1;
  return { w, arm: { sh: m * lerp(2, 146 + 4 * Math.sin(t * 11 + phase - 1.2), w), el: m * lerp(0, 16 + 22 * Math.sin(t * 11 + phase), w), wr: m * lerp(0, -6 + 12 * Math.sin(t * 11 + phase - 0.8), w), open: clamp((w - 0.3) / 0.4) } };
}
/** apontar/apresentar com a mão aberta (braço do lado da tela) */
export function presentArm(t: number, t0: number, t1: number, side: 'L' | 'R', angle = 70, phase = 0): { w: number; arm: ArmPose } {
  const w = outBack((t - t0) / 0.45) * (1 - ss((t - (t1 - 0.3)) / 0.3));
  const m = side === 'L' ? 1 : -1;
  return { w, arm: { sh: m * lerp(2, angle + 3 * Math.sin(t * 2.2 + phase), w), el: m * lerp(0, -28, w), wr: m * lerp(0, -16, w), open: clamp(w * 1.6) } };
}
/** mão no queixo (pensando) — braço do lado da tela */
export function thinkArm(t: number, t0: number, t1: number, side: 'L' | 'R'): { w: number; arm: ArmPose } {
  const w = sm((t - t0) / 0.4) * (1 - sm((t - (t1 - 0.35)) / 0.35));
  const m = side === 'L' ? 1 : -1;
  return { w, arm: { sh: m * lerp(2, -18, w), el: m * lerp(0, -150, w), wr: m * lerp(0, 10, w), open: 0 } };
}
const blendArm = (a: ArmPose, b: ArmPose, w: number): ArmPose => ({ sh: lerp(a.sh, b.sh, w), el: lerp(a.el, b.el, w), wr: lerp(a.wr, b.wr, w), open: lerp(a.open || 0, b.open || 0, w) });

export type ArmAction = { kind: 'wave' | 'present' | 'think'; side: 'L' | 'R'; t0: number; t1: number; angle?: number };
/** pose de um amigo em pé: posição, escala, ações dos braços, inclinação/cabeça e expressão */
export function kidPose(t: number, o: { x: number; y: number; scale: number; phase?: number; actions?: ArmAction[]; head?: [number, number][]; lean?: [number, number][]; ex: Expr; skirt?: boolean; hop?: number[]; bobAmp?: number }): KidPose {
  const ph = o.phase ?? 0, breath = Math.sin(t * 2.1 + ph);
  let armL: ArmPose = { sh: 2 + 1.5 * breath, el: 0, wr: 0, open: 0 }, armR: ArmPose = { sh: -2 - 1.5 * breath, el: 0, wr: 0, open: 0 };
  for (const a of o.actions || []) {
    const r = a.kind === 'wave' ? waveArm(t, a.t0, a.t1, a.side, ph) : a.kind === 'present' ? presentArm(t, a.t0, a.t1, a.side, a.angle ?? 70, ph) : thinkArm(t, a.t0, a.t1, a.side);
    if (a.side === 'L') armL = blendArm(armL, r.arm, clamp(r.w)); else armR = blendArm(armR, r.arm, clamp(r.w));
  }
  let hopY = 0;
  for (const h of o.hop || []) { const k = (t - h) / 0.45; if (k > 0 && k < 1) hopY = Math.min(hopY, -Math.sin(k * Math.PI) * 60); }
  return {
    x: o.x, y: o.y + hopY * o.scale * 2, scale: o.scale, bob: 3 * breath, lean: (o.lean ? keys(t, o.lean) : 0) + 0.8 * Math.sin(t * 1.2 + ph),
    head: (o.head ? keys(t, o.head) : 0) + 1.2 * Math.sin(t * 1.7 + ph), armL, armR,
    legL: { dx: 0, dy: 0, rot: 0 }, legR: { dx: 0, dy: 0, rot: 0 }, expr: o.ex, skirt: o.skirt ? 1.2 * Math.sin(t * 2.2 + ph) : 0,
  };
}
