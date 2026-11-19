// Geometria do mapa de Amontada em coordenadas de "mundo" (= tela no enquadramento final).
// Contorno vetorizado de assets/mapa_amontada_referencia.png (tools/vetorizar_mapa.py);
// estradas e localidades redesenhadas à mão sobre a mesma referência (coordenadas em px da referência).
import contorno from './contorno.json';
import { P, cubic, dist, polyline } from '../lib/anim';

export const K = 2.6;                       // px de tela por px da referência
const [bx0, by0, bx1] = contorno.bbox_ref;
export const MAP_X0 = 540 - ((bx1 - bx0) * K) / 2, MAP_Y0 = 330;
export const W = (r: P): P => [MAP_X0 + (r[0] - bx0) * K, MAP_Y0 + (r[1] - by0) * K];

export const CITY: P = W([191.7, 378.3]);  // sede: onde a boca está (e onde fica o beijo)
export const LIP_SCALE = 0.42;              // escala dos lábios no mundo (400 un. → ~144 px)
export const lipToWorld = (l: P): P => [CITY[0] + LIP_SCALE * l[0], CITY[1] + LIP_SCALE * (l[1] - 10)];

const outline = (contorno.pontos as P[]).map(W);
export const OUTLINE_D = 'M' + outline.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L') + ' Z';

// estrada sede → Pica-pau → Aracatiara → Pau d'Arco → Icaraí → Moitas (o batom segue por ela até a praia)
const ROAD: P[] = [[193, 328], [200, 310], [205, 297], [227, 284], [240, 273], [253, 260], [268, 243], [280, 230], [285, 213], [286, 196], [283, 187], [267, 174]].map((r) => W(r as P));

// contorno começa no ponto mais perto de Moitas e corre nos dois sentidos (oeste com o batom, leste sozinho)
let i0 = 0;
outline.forEach((p, i) => { if (dist(p, ROAD[ROAD.length - 1]) < dist(outline[i0], ROAD[ROAD.length - 1])) i0 = i; });
const loop = [...outline.slice(i0), ...outline.slice(0, i0)];
const fwdIsWest = loop[6][0] < loop[0][0];
const dirA = fwdIsWest ? loop : [loop[0], ...loop.slice(1).reverse()];
const dirB = fwdIsWest ? [loop[0], ...loop.slice(1).reverse()] : loop;
const plA = polyline([...dirA, dirA[0]]);
const half = plA.len * 0.56;                // o lado oeste (do batom) leva um pouco mais
const westPts: P[] = [], eastPts: P[] = [];
for (let i = 0; i < plA.pts.length && plA.acc[i] <= half; i++) westPts.push(plA.pts[i]);
westPts.push(plA.at(half).p);
const meet = westPts[westPts.length - 1];
for (const p of dirB) { eastPts.push(p); if (dist(p, meet) < 3) break; }
eastPts.push(meet);

// conexão: canto direito da boca → sobe e encontra a estrada em Pica-pau
const corner = lipToWorld([198, 5]);
const conn = cubic(corner, [corner[0] + 90, corner[1] - 10], [ROAD[0][0] + 60, ROAD[0][1] + 40], ROAD[0], 20);
export const TRAIL = polyline([...conn, ...ROAD.slice(1), ...westPts]);
export const TRAIL_ROAD_END = polyline([...conn, ...ROAD.slice(1)]).len;
export const EAST = polyline(eastPts);

// detalhes que aparecem depois do beijo (estradas secundárias e localidades)
export const SECONDARY = [
  [[143, 327], [148, 345], [165, 363], [183, 376], [192, 379], [215, 392], [237, 403]],
  [[178, 379], [170, 388], [163, 405], [158, 420], [152, 432]],
  [[198, 366], [215, 350], [237, 334], [256, 333]],
  [[270, 245], [290, 252], [310, 251], [331, 244]],
  [[191, 372], [189, 355], [193, 330]],
].map((r) => polyline((r as P[]).map(W)));
export const PLACES: P[] = [[266, 174], [285, 188], [344, 219], [270, 242], [224, 265], [227, 285], [180, 295], [241, 314], [194, 329], [149, 345], [158, 409]].map((r) => W(r as P));
