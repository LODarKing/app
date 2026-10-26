// Parametric facial features drawn to match the model sheets (eyes, brows, mouth), so the
// traced faces can blink, look around and change expression.
import React from 'react';
import { f, lerp, clamp } from '../lib/paths';

export type Expr = { blink: number; look: [number, number]; smile: number; open: number; worry: number; browUp: number };
export const EXPR0: Expr = { blink: 0, look: [0, 0], smile: 0.8, open: 0.7, worry: 0, browUp: 0 };

export type EyeSpec = { cx: number; cy: number; rx: number; ry: number; px: number; py: number; prx: number; pry: number; hl: [number, number, number] };
export const Eye: React.FC<{ e: EyeSpec; x: Expr; skin: string; pupil: string; lid: string; id: string; lash?: string }> = ({ e, x, skin, pupil, lid, id, lash }) => {
  const b = clamp(x.blink);
  const lx = x.look[0], ly = x.look[1];
  const lidH = b * (e.ry * 2 + 6);
  return (
    <g>
      <defs><clipPath id={id}><ellipse cx={e.cx} cy={e.cy} rx={e.rx} ry={e.ry} /></clipPath></defs>
      <ellipse cx={e.cx} cy={e.cy} rx={e.rx} ry={e.ry} fill="#FFFFFF" />
      <g clipPath={`url(#${id})`}>
        <ellipse cx={e.px + lx} cy={e.py + ly} rx={e.prx} ry={e.pry} fill={pupil} />
        <ellipse cx={e.px + lx} cy={e.py + ly + e.pry * 0.55} rx={e.prx * 0.8} ry={e.pry * 0.4} fill="#FFFFFF" opacity={0.08} />
        <circle cx={e.hl[0] + lx} cy={e.hl[1] + ly} r={e.hl[2]} fill="#FFFFFF" />
        <circle cx={e.px + lx + e.prx * 0.35} cy={e.py + ly + e.pry * 0.5} r={e.hl[2] * 0.4} fill="#FFFFFF" opacity={0.75} />
        <rect x={e.cx - e.rx - 4} y={e.cy - e.ry - 4} width={e.rx * 2 + 8} height={lidH} fill={skin} />
      </g>
      {b > 0.55 ? <path d={`M${f(e.cx - e.rx * 0.95)} ${f(e.cy - e.ry - 3 + lidH)} Q${f(e.cx)} ${f(e.cy - e.ry + lidH + 7)} ${f(e.cx + e.rx * 0.95)} ${f(e.cy - e.ry - 3 + lidH)}`} stroke={lid} strokeWidth={e.rx * 0.28} strokeLinecap="round" fill="none" /> : null}
      {lash && b < 0.55 ? <path d={`M${f(e.cx - e.rx * 0.92)} ${f(e.cy - e.ry * 0.35)} Q${f(e.cx - e.rx * 0.6)} ${f(e.cy - e.ry * 1.02)} ${f(e.cx)} ${f(e.cy - e.ry * 1.0)}`} stroke={lash} strokeWidth={2.2} fill="none" strokeLinecap="round" opacity={0.5} /> : null}
    </g>
  );
};

export type BrowSpec = { a: [number, number]; m: [number, number]; b: [number, number]; w: number; inner: 'a' | 'b' };
export const Brow: React.FC<{ s: BrowSpec; x: Expr; color: string }> = ({ s, x, color }) => {
  const up = x.browUp, wi = 9 * x.worry, wo = -4 * x.worry;
  const ya = s.a[1] - up - (s.inner === 'a' ? wi : wo), yb = s.b[1] - up - (s.inner === 'b' ? wi : wo);
  const ym = s.m[1] - up - 2 * x.worry;
  const d = `M${f(s.a[0])} ${f(ya)} Q${f(2 * s.m[0] - (s.a[0] + s.b[0]) / 2)} ${f(2 * ym - (ya + yb) / 2)} ${f(s.b[0])} ${f(yb)}`;
  return <path d={d} stroke={color} strokeWidth={s.w} strokeLinecap="round" fill="none" />;
};

export type MouthSpec = { cx: number; cy: number; w: number; depth: number; dark: string; tongue: string; line: string; tilt?: number };
/** front-view open smile: corners rise with smile, depth with open; closed mouth = curved line */
export const Mouth: React.FC<{ s: MouthSpec; x: Expr; id: string }> = ({ s, x, id }) => {
  const open = clamp(x.open), sm = x.smile;
  const w = s.w * lerp(0.62, 1, clamp(open * 1.4 + Math.max(0, sm) * 0.3));
  const tl = s.tilt || 0;
  const L = [s.cx - w / 2, s.cy - 7 * sm + tl], Rr = [s.cx + w / 2, s.cy - 7 * sm - tl];
  const sag = 6 * Math.max(0, sm) - 4 * Math.max(0, -sm);
  const depth = 3 + s.depth * open;
  if (open < 0.08) {
    const d = `M${f(L[0])} ${f(L[1])} Q${f(s.cx)} ${f(s.cy + 10 * sm + 2)} ${f(Rr[0])} ${f(Rr[1])}`;
    return <path d={d} stroke={s.line} strokeWidth={5} strokeLinecap="round" fill="none" />;
  }
  const top = `M${f(L[0])} ${f(L[1])} Q${f(s.cx)} ${f(s.cy + sag)} ${f(Rr[0])} ${f(Rr[1])}`;
  const bot = `C${f(Rr[0] - 2)} ${f(Rr[1] + depth * 0.95)} ${f(s.cx + w * 0.28)} ${f(s.cy + sag + depth * 1.05)} ${f(s.cx)} ${f(s.cy + sag + depth)} C${f(s.cx - w * 0.28)} ${f(s.cy + sag + depth * 1.05)} ${f(L[0] + 2)} ${f(L[1] + depth * 0.95)} ${f(L[0])} ${f(L[1])} Z`;
  const d = top + ' ' + bot;
  return (
    <g>
      <defs><clipPath id={id}><path d={d} /></clipPath></defs>
      <path d={d} fill={s.dark} />
      <g clipPath={`url(#${id})`}>
        <ellipse cx={s.cx + 2} cy={s.cy + sag + depth * 1.02} rx={w * 0.36} ry={Math.max(4, depth * 0.48)} fill={s.tongue} />
        <path d={`M${f(L[0])} ${f(L[1] - 1)} Q${f(s.cx)} ${f(s.cy + sag - 1)} ${f(Rr[0])} ${f(Rr[1] - 1)}`} stroke="#FFFFFF" strokeOpacity={0.9} strokeWidth={0} fill="none" />
      </g>
      <path d={d} fill="none" stroke={s.line} strokeWidth={2} strokeOpacity={0.5} />
    </g>
  );
};
