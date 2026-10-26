// Pingo, o gato guia: gato doméstico laranja, listras discretas, peito branco, olhos verdes.
// Vista frontal sentado (com agachar para o salto) e pose de salto em direção à câmera.
// Coordenadas locais: origem no centro da base (onde ele se apoia), y para baixo, escala 1 ≈ 560 px de altura.
import React from 'react';
import { shape, curve, ellipse, f, lerp, clamp } from '../lib/paths';
import { capsuleD } from '../lib/limb';

export const PC = {
  fur: '#F39A3D', furHi: '#FFB867', shade: '#D9772A', stripe: '#C15E1C', white: '#FFF8EE', whiteShade: '#EADBC8',
  line: '#5A2E12', ear: '#F6A4A0', nose: '#EE7A86', iris: '#6CC24A', irisDark: '#2F8A3A', pupil: '#16130F', pad: '#F59AA4', mouth: '#8A2B2B', tongue: '#F27C8A',
};
const LW = 6;
const st = { stroke: PC.line, strokeWidth: LW, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

export type PingoPose = {
  x: number; y: number; s: number;
  tilt?: number;              // inclinação da cabeça (graus)
  blink?: number;             // 0 aberto, 1 fechado
  dilate?: number;            // 0 pupila em fenda, 1 pupila redonda e grande
  look?: [number, number];    // deslocamento do olhar
  earL?: number; earR?: number;   // giro das orelhas (graus; negativo = para trás)
  crouch?: number;            // 0 sentado, 1 agachado para saltar
  wiggle?: number;            // rebolado antes do salto
  meow?: number;              // boca aberta
  tail?: number;              // fase da cauda (segundos)
  headDy?: number;
};

/** cabeça (centro em 0,0) */
export const PingoHead: React.FC<{ p: PingoPose; id: string }> = ({ p, id }) => {
  const blink = clamp(p.blink ?? 0), dil = clamp(p.dilate ?? 0.3), [lx, ly] = p.look ?? [0, 0], meow = clamp(p.meow ?? 0);
  const head = shape([[-128, 8], [-122, -50], [-88, -96], [0, -110], [88, -96], [122, -50], [128, 8], [152, 36, 1], [116, 58], [62, 86], [0, 94], [-62, 86], [-116, 58], [-152, 36, 1]]);
  const ear = (side: number, rot: number) => {
    const o = shape([[side * 112, -40], [side * 122, -168, 1], [side * 30, -98]].map(([x, y, c]) => [x, y, c ?? 0]));
    const i = shape([[side * 100, -60], [side * 112, -142, 1], [side * 52, -100]].map(([x, y, c]) => [x, y, c ?? 0]));
    return <g transform={`rotate(${f(rot * side)} ${side * 80} -80)`}>
      <path d={o} fill={PC.fur} {...st} />
      <path d={i} fill={PC.ear} />
      <path d={curve([[side * 104, -70], [side * 96, -110], [side * 108, -138]])} stroke={PC.furHi} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.9} />
    </g>;
  };
  const eye = (side: number) => {
    const cx = side * 54, cy = -22, rx = 38, ry = 35;
    const pr = lerp(5, 23, dil), pry = lerp(29, 24, dil);
    const cid = `${id}e${side}`;
    return <g>
      <defs><clipPath id={cid}><path d={ellipse(cx, cy, rx, ry)} /></clipPath>
        <radialGradient id={`${cid}g`} cx="0.5" cy="0.6" r="0.6"><stop offset="0" stopColor="#B7F06A" /><stop offset="0.55" stopColor={PC.iris} /><stop offset="1" stopColor={PC.irisDark} /></radialGradient></defs>
      <path d={ellipse(cx, cy, rx, ry)} fill={`url(#${cid}g)`} />
      <g clipPath={`url(#${cid})`}>
        <path d={ellipse(cx + lx, cy + ly, pr, pry)} fill={PC.pupil} />
        <circle cx={cx + lx - 12} cy={cy + ly - 14} r={9} fill="#FFFFFF" />
        <circle cx={cx + lx + 10} cy={cy + ly + 12} r={4} fill="#FFFFFF" opacity={0.85} />
        {/* pálpebra superior */}
        <rect x={cx - rx - 4} y={cy - ry - 4} width={rx * 2 + 8} height={(ry * 2 + 8) * blink} fill={PC.fur} />
        {blink > 0.02 ? <path d={`M${cx - rx} ${f(cy - ry - 4 + (ry * 2 + 8) * blink)} L${cx + rx} ${f(cy - ry - 4 + (ry * 2 + 8) * blink)}`} stroke={PC.line} strokeWidth={6} /> : null}
      </g>
      <path d={ellipse(cx, cy, rx, ry)} fill="none" {...st} strokeWidth={5.5} />
      {blink > 0.9 ? <path d={curve([[cx - rx + 4, cy + 4], [cx, cy + 12], [cx + rx - 4, cy + 4]])} fill="none" {...st} strokeWidth={6} /> : null}
    </g>;
  };
  const mouthOpen = meow > 0.02;
  return (
    <g>
      {ear(-1, p.earL ?? 0)}{ear(1, p.earR ?? 0)}
      <path d={head} fill={PC.fur} {...st} />
      {/* luz e sombra suaves */}
      <defs><clipPath id={`${id}hc`}><path d={head} /></clipPath></defs>
      <g clipPath={`url(#${id}hc)`}>
        <path d={ellipse(-40, -70, 70, 34)} fill={PC.furHi} opacity={0.55} />
        <path d={shape([[-160, 50], [0, 70], [160, 50], [160, 120], [-160, 120]])} fill={PC.shade} opacity={0.5} />
        {/* listras discretas: "M" na testa e bochechas */}
        {[-24, 0, 24].map((x, i) => <path key={i} d={curve([[x * 1.1, -106], [x * 0.95, -82], [x * 0.8, -62]])} stroke={PC.stripe} strokeWidth={i === 1 ? 12 : 10} fill="none" strokeLinecap="round" />)}
        {[-1, 1].map((sd) => <g key={sd}>
          <path d={curve([[sd * 160, 10], [sd * 130, 14], [sd * 108, 22]])} stroke={PC.stripe} strokeWidth={9} fill="none" strokeLinecap="round" />
          <path d={curve([[sd * 160, 38], [sd * 134, 38], [sd * 114, 44]])} stroke={PC.stripe} strokeWidth={8} fill="none" strokeLinecap="round" />
        </g>)}
      </g>
      {/* focinho branco */}
      <path d={shape([[-62, 40], [-40, 16], [0, 22], [40, 16], [62, 40], [44, 70], [0, 82], [-44, 70]])} fill={PC.white} />
      {eye(-1)}{eye(1)}
      {/* nariz e boca */}
      <path d={shape([[-14, 24, 1], [14, 24, 1], [0, 38, 1]])} fill={PC.nose} stroke={PC.line} strokeWidth={3.5} strokeLinejoin="round" />
      {mouthOpen ? <g>
        <path d={shape([[-22, 46], [0, 42], [22, 46], [16, 46 + 34 * meow], [0, 50 + 40 * meow], [-16, 46 + 34 * meow]])} fill={PC.mouth} {...st} strokeWidth={4} />
        <path d={ellipse(0, 46 + 30 * meow, 12, 8 * meow + 2)} fill={PC.tongue} />
      </g> : null}
      <path d={`M0 38 L0 46 M0 46 Q-12 58 -28 47 M0 46 Q12 58 28 47`} fill="none" {...st} strokeWidth={4} />
      {/* bigodes */}
      {[-1, 1].map((sd) => [0, 1, 2].map((k) => <path key={`${sd}${k}`} d={curve([[sd * 50, 44 + k * 7], [sd * 120, 30 + k * 16], [sd * 190, 20 + k * 30]])} stroke="#FFFFFF" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.95} />))}
      {[-1, 1].map((sd) => [0, 1, 2].map((k) => <circle key={`d${sd}${k}`} cx={sd * (26 + k * 9)} cy={52 + (k % 2) * 6} r={2.6} fill={PC.stripe} />))}
    </g>
  );
};

/** Pingo sentado (vista frontal) */
export const PingoSit: React.FC<{ p: PingoPose; id?: string }> = ({ p, id = 'pg' }) => {
  const c = clamp(p.crouch ?? 0), tt = p.tail ?? 0, wig = p.wiggle ?? 0;
  const sy = lerp(1, 0.78, c), sx = lerp(1, 1.12, c);
  // cauda: enrola pela frente das patas, ponta balança
  const tw = Math.sin(tt * 2.4) * 18, tw2 = Math.sin(tt * 2.4 - 0.9) * 26;
  const tail = curve([[96, -40], [150, -20], [140, 6], [60, 14], [-40, 12], [-110 + tw, -6 + tw2 * 0.3], [-136 + tw2, -46 + tw2 * 0.2]]);
  const body = shape([[-96, -16], [-112, -118], [-92, -226], [-56, -300], [0, -318], [56, -300], [92, -226], [112, -118], [96, -16], [0, 0]]);
  return (
    <g transform={`translate(${f(p.x)} ${f(p.y)}) scale(${f(p.s)})`}>
      <ellipse cx={0} cy={4} rx={150} ry={20} fill="#000" opacity={0.18} />
      <g transform={`translate(${f(wig * 10)} 0) scale(${f(sx)} ${f(sy)})`}>
        {/* coxas (ancas) atrás */}
        {[-1, 1].map((sd) => <path key={sd} d={ellipse(sd * 92, -70, 66, 78)} fill={PC.shade} {...st} />)}
        <path d={body} fill={PC.fur} {...st} />
        <defs><clipPath id={`${id}bc`}><path d={body} /></clipPath></defs>
        <g clipPath={`url(#${id}bc)`}>
          <path d={ellipse(-50, -230, 40, 70)} fill={PC.furHi} opacity={0.45} />
          {[-1, 1].map((sd) => [0, 1, 2].map((k) => <path key={`${sd}${k}`} d={curve([[sd * 120, -250 + k * 56], [sd * 92, -238 + k * 56], [sd * 74, -222 + k * 56]])} stroke={PC.stripe} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.85} />))}
        </g>
        {/* peito branco */}
        <path d={shape([[-58, -300], [0, -326], [58, -300], [50, -190], [0, -120], [-50, -190]])} fill={PC.white} />
        <path d={curve([[-22, -250], [0, -240], [22, -250]])} stroke={PC.whiteShade} strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d={curve([[-26, -210], [0, -198], [26, -210]])} stroke={PC.whiteShade} strokeWidth={6} fill="none" strokeLinecap="round" />
        {/* patas dianteiras */}
        {[-1, 1].map((sd) => <g key={sd}>
          <path d={capsuleD([sd * 40, -236], [sd * 42, -24], 30, 26)} fill={PC.fur} {...st} />
          <path d={curve([[sd * 26, -150], [sd * 30, -120]])} stroke={PC.stripe} strokeWidth={8} strokeLinecap="round" fill="none" />
          <path d={curve([[sd * 58, -120], [sd * 56, -96]])} stroke={PC.stripe} strokeWidth={8} strokeLinecap="round" fill="none" />
          <path d={ellipse(sd * 44, -16, 36, 22)} fill={PC.white} {...st} />
          <path d={`M${sd * 32} -24 L${sd * 32} -6 M${sd * 46} -26 L${sd * 46} -4 M${sd * 60} -24 L${sd * 60} -8`} stroke={PC.line} strokeWidth={3.5} strokeLinecap="round" opacity={0.7} />
        </g>)}
        {/* cauda listrada */}
        <path d={tail} stroke={PC.line} strokeWidth={46} fill="none" strokeLinecap="round" />
        <path d={tail} stroke={PC.fur} strokeWidth={34} fill="none" strokeLinecap="round" />
        <path d={tail} stroke={PC.stripe} strokeWidth={34} fill="none" strokeDasharray="14 34" strokeDashoffset={-20} opacity={0.75} />
      </g>
      <g transform={`translate(0 ${f(lerp(-412, -330, c) + (p.headDy ?? 0))}) rotate(${f(p.tilt ?? 0)})`}>
        <PingoHead p={p} id={id} />
      </g>
    </g>
  );
};

/** Pingo saltando na direção da câmera: patas abertas, almofadinhas à mostra */
export const PingoLeap: React.FC<{ p: PingoPose; id?: string; stretch?: number }> = ({ p, id = 'pl', stretch = 1 }) => {
  const paw = (sd: number) => {
    const x = sd * 150, y = -40;
    return <g>
      <path d={capsuleD([sd * 70, -140], [x, y], 34, 40)} fill={PC.fur} {...st} />
      <path d={ellipse(x, y + 10, 62, 54)} fill={PC.white} {...st} />
      {/* almofadinhas (coxins) */}
      <path d={shape([[x - 26, y + 22], [x, y + 6], [x + 26, y + 22], [x + 20, y + 44], [x, y + 50], [x - 20, y + 44]])} fill={PC.pad} />
      {[-36, -13, 13, 36].map((dx, i) => <path key={i} d={ellipse(x + dx, y - 16 - (i === 1 || i === 2 ? 10 : 0), 11, 13)} fill={PC.pad} />)}
    </g>;
  };
  return (
    <g transform={`translate(${f(p.x)} ${f(p.y)}) scale(${f(p.s)})`}>
      {/* patas traseiras esticadas para trás (pequenas, ao fundo) */}
      {[-1, 1].map((sd) => <path key={sd} d={capsuleD([sd * 50, -60], [sd * 80, 130 * stretch], 34, 22)} fill={PC.shade} {...st} />)}
      <path d={ellipse(0, -60, 130, 120)} fill={PC.fur} {...st} />
      <path d={shape([[-60, -150], [0, -170], [60, -150], [40, -40], [0, 0], [-40, -40]])} fill={PC.white} />
      <g transform={`translate(0 -230) rotate(${f(p.tilt ?? 0)})`}><PingoHead p={p} id={id} /></g>
      {paw(-1)}{paw(1)}
    </g>
  );
};
