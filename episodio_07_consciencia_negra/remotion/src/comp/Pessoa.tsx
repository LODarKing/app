import React from 'react';

/* Figura editorial plana, de frente, SEM rosto (estilo de ilustração editorial; evita caricatura).
 * Proporções fixas em função da altura H; braços definidos por cotovelo e mão relativos ao ombro (em unidades de H). */
export type Cabelo = 'afro' | 'curto' | 'coque' | 'trancas' | 'locs' | 'raspado';
export type PessoaProps = {
  x: number; y: number; H: number; pele: string; cabelo: Cabelo; corCabelo?: string;
  blusa: string; calca?: string; saia?: string; toga?: string; capelo?: boolean; mangaLonga?: boolean;
  bracoE?: [number, number, number, number]; bracoD?: [number, number, number, number];
  frente?: (maoE: [number, number], maoD: [number, number]) => React.ReactNode; // objeto segurado à frente do corpo
};
const sombra = (c: string, k: number) => {
  const v = [1, 3, 5].map((i) => Math.round(parseInt(c.slice(i, i + 2), 16) * k));
  return `rgb(${v.join(',')})`;
};

export const Pessoa: React.FC<PessoaProps> = (p) => {
  const { x, y, H: u, pele, cabelo, corCabelo = '#15100C', blusa } = p;
  const cy = y - 0.885 * u, r = 0.068 * u, ys = y - 0.77 * u, yw = y - 0.47 * u;
  const bE = p.bracoE ?? [-0.03, 0.15, -0.035, 0.29], bD = p.bracoD ?? [0.03, 0.15, 0.035, 0.29];
  const ombroE: [number, number] = [x - 0.1 * u, ys + 0.025 * u], ombroD: [number, number] = [x + 0.1 * u, ys + 0.025 * u];
  const pt = (o: [number, number], dx: number, dy: number): [number, number] => [o[0] + dx * u, o[1] + dy * u];
  const cE = pt(ombroE, bE[0], bE[1]), mE = pt(ombroE, bE[2], bE[3]), cD = pt(ombroD, bD[0], bD[1]), mD = pt(ombroD, bD[2], bD[3]);
  const braco = (o: [number, number], c: [number, number], m: [number, number], k: string) => {
    const manga = p.mangaLonga || p.toga ? 0.85 : 0.55;
    const mx = o[0] + (c[0] - o[0]) * manga, my = o[1] + (c[1] - o[1]) * manga;
    const roupa = p.toga ?? blusa;
    const fim = p.mangaLonga || p.toga ? [c[0] + (m[0] - c[0]) * 0.7, c[1] + (m[1] - c[1]) * 0.7] : [mx, my];
    return (
      <g key={k}>
        <polyline points={`${o[0]},${o[1]} ${c[0]},${c[1]} ${m[0]},${m[1]}`} fill="none" stroke={pele} strokeWidth={0.05 * u} strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={p.mangaLonga || p.toga ? `${o[0]},${o[1]} ${c[0]},${c[1]} ${fim[0]},${fim[1]}` : `${o[0]},${o[1]} ${fim[0]},${fim[1]}`} fill="none" stroke={roupa} strokeWidth={0.062 * u} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={m[0]} cy={m[1]} r={0.03 * u} fill={pele} />
      </g>
    );
  };
  const cap = (h = 0.035) => <path d={`M${x - 0.074 * u},${cy + 0.006 * u} A${0.074 * u},${0.074 * u} 0 0 1 ${x + 0.074 * u},${cy + 0.006 * u} Q${x},${cy - h * u} ${x - 0.074 * u},${cy + 0.006 * u}Z`} fill={corCabelo} />;
  return (
    <g>
      {/* cabelo atrás da cabeça */}
      {cabelo === 'afro' && <circle cx={x} cy={cy - 0.025 * u} r={0.108 * u} fill={corCabelo} />}
      {cabelo === 'trancas' && <rect x={x - 0.088 * u} y={cy - 0.03 * u} width={0.176 * u} height={0.2 * u} rx={0.06 * u} fill={corCabelo} />}
      {cabelo === 'locs' && [-0.07, -0.045, -0.02, 0.02, 0.045, 0.07].map((d, i) => (
        <line key={i} x1={x + d * u} y1={cy - 0.04 * u} x2={x + d * 1.35 * u} y2={cy + (0.15 + (i % 2) * 0.03) * u} stroke={corCabelo} strokeWidth={0.032 * u} strokeLinecap="round" />
      ))}
      {/* pernas / saia / toga */}
      {p.toga ? (
        <path d={`M${x - 0.11 * u},${ys + 0.02 * u} L${x + 0.11 * u},${ys + 0.02 * u} L${x + 0.16 * u},${y - 0.04 * u} L${x - 0.16 * u},${y - 0.04 * u}Z`} fill={p.toga} />
      ) : p.saia ? (
        <g>
          {[-1, 1].map((s) => <rect key={s} x={x + s * 0.045 * u - 0.022 * u} y={y - 0.22 * u} width={0.044 * u} height={0.2 * u} fill={pele} />)}
          <path d={`M${x - 0.09 * u},${yw} L${x + 0.09 * u},${yw} L${x + 0.16 * u},${y - 0.2 * u} L${x - 0.16 * u},${y - 0.2 * u}Z`} fill={p.saia} />
        </g>
      ) : (
        [-1, 1].map((s) => (
          <path key={s} d={`M${x + s * 0.092 * u},${yw} L${x + s * 0.004 * u},${yw} L${x + s * 0.016 * u},${y - 0.03 * u} L${x + s * 0.078 * u},${y - 0.03 * u}Z`} fill={s > 0 ? sombra(p.calca ?? '#24324F', 0.82) : p.calca ?? '#24324F'} />
        ))
      )}
      {[-1, 1].map((s) => <ellipse key={'p' + s} cx={x + s * 0.05 * u} cy={y - 0.018 * u} rx={0.048 * u} ry={0.02 * u} fill="#0B0E15" />)}
      {/* tronco */}
      {!p.toga && (
        <g>
          <path d={`M${x - 0.115 * u},${ys + 0.035 * u} Q${x - 0.115 * u},${ys} ${x - 0.075 * u},${ys} L${x + 0.075 * u},${ys} Q${x + 0.115 * u},${ys} ${x + 0.115 * u},${ys + 0.035 * u} L${x + 0.09 * u},${yw} L${x - 0.09 * u},${yw}Z`} fill={blusa} />
          <path d={`M${x + 0.02 * u},${ys} L${x + 0.075 * u},${ys} Q${x + 0.115 * u},${ys} ${x + 0.115 * u},${ys + 0.035 * u} L${x + 0.09 * u},${yw} L${x + 0.03 * u},${yw}Z`} fill="#000" opacity={0.12} />
        </g>
      )}
      {p.toga && <path d={`M${x - 0.035 * u},${ys + 0.01 * u} L${x},${ys + 0.08 * u} L${x + 0.035 * u},${ys + 0.01 * u}Z`} fill={blusa} />}
      {/* pescoço e cabeça (sem rosto) */}
      <rect x={x - 0.024 * u} y={cy + r - 0.01 * u} width={0.048 * u} height={0.07 * u} fill={sombra(pele, 0.85)} />
      <circle cx={x} cy={cy} r={r} fill={pele} />
      {(cabelo === 'curto' || cabelo === 'coque' || cabelo === 'trancas' || cabelo === 'locs') && cap()}
      {cabelo === 'raspado' && cap(0.012)}
      {cabelo === 'coque' && <circle cx={x} cy={cy - 0.088 * u} r={0.042 * u} fill={corCabelo} />}
      {p.capelo && (
        <g>
          <rect x={x - 0.068 * u} y={cy - 0.085 * u} width={0.136 * u} height={0.04 * u} fill="#0B0E15" />
          <path d={`M${x - 0.13 * u},${cy - 0.085 * u} L${x},${cy - 0.12 * u} L${x + 0.13 * u},${cy - 0.085 * u} L${x},${cy - 0.05 * u}Z`} fill="#11151F" />
          <polyline points={`${x},${cy - 0.085 * u} ${x + 0.1 * u},${cy - 0.075 * u} ${x + 0.1 * u},${cy - 0.02 * u}`} fill="none" stroke="#C8A45D" strokeWidth={0.008 * u} />
        </g>
      )}
      {/* braços e objeto à frente */}
      {braco(ombroE, cE, mE, 'e')}
      {braco(ombroD, cD, mD, 'd')}
      {p.frente && p.frente(mE, mD)}
    </g>
  );
};
