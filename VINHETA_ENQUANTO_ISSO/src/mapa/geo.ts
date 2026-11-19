// Geometria do mapa de Amontada em coordenadas de "mundo" (= tela no enquadramento final).
// Contorno vetorizado de assets/mapa_amontada_referencia.png (tools/vetorizar_mapa.py);
// estradas e localidades redesenhadas à mão sobre a mesma referência (coordenadas em px da referência).
import contorno from './contorno.json';
import { P, dist, polyline } from '../lib/anim';

export const K = 2.6;                       // px de tela por px da referência
const [bx0, by0, bx1] = contorno.bbox_ref;
export const MAP_X0 = 540 - ((bx1 - bx0) * K) / 2, MAP_Y0 = 330;
export const W = (r: P): P => [MAP_X0 + (r[0] - bx0) * K, MAP_Y0 + (r[1] - by0) * K];

export const CITY: P = W([191.7, 378.3]);  // sede: onde a boca está (e onde fica o beijo)
export const LIP_SCALE = 0.42;              // escala dos lábios no mundo (400 un. → ~144 px)
export const lipToWorld = (l: P): P => [CITY[0] + LIP_SCALE * l[0], CITY[1] + LIP_SCALE * (l[1] - 10)];

const outline = (contorno.pontos as P[]).map(W);
export const OUTLINE_D = 'M' + outline.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L') + ' Z';

// o batom sai do canto da boca, pousa no ponto do contorno mais perto dela e desenha a borda nos dois sentidos
// (o sentido que sobe para o litoral leva o batom; o outro se desenha sozinho). Só o contorno — sem linhas internas.
export const CORNER = lipToWorld([198, 5]);
let i0 = 0;
outline.forEach((p, i) => { if (dist(p, CORNER) < dist(outline[i0], CORNER)) i0 = i; });
const loop = [...outline.slice(i0), ...outline.slice(0, i0)];
const fwd = [...loop, loop[0]], rev = [loop[0], ...loop.slice(1).reverse(), loop[0]];
const fwdGoesNorth = loop[8][1] < loop[0][1];
const plN = polyline(fwdGoesNorth ? fwd : rev), plS = polyline(fwdGoesNorth ? rev : fwd);
const cutAt = (pl: ReturnType<typeof polyline>, l: number): P[] => {
  const out: P[] = [];
  for (let i = 0; i < pl.pts.length && pl.acc[i] <= l; i++) out.push(pl.pts[i]);
  out.push(pl.at(l).p); return out;
};
export const TRAIL = polyline(cutAt(plN, plN.len * 0.5));   // com o batom
export const OTHER = polyline(cutAt(plS, plS.len * 0.5));   // sozinho
export const TRAIL_START: P = loop[0];
