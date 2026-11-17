// Câmera e transformação em função do tempo (pura).
// Até a esfera ficar pronta (E.globoPronto) vale a fórmula aprovada no piloto; depois, quadros-chave.
import { View, I3, rotY, project } from './morph';
import { D2R, invMercY, MID, NY, TK, rel } from './geo';
import { W } from './theme';
import { EV, E, seg, mix, easeInOut, lin } from './timeline';

export const LATC_FLAT = invMercY(1.18);
export const PANX_FLAT = 6.5 * D2R;
export const LATC_MID = MID.lat;            // ponto médio do círculo máximo (69,66° N)

function pilotView(t: number): View {
  const push = seg(t, 0, EV.recua, easeInOut);
  const back = seg(t, EV.recua, EV.recua + 2.6, easeInOut);
  const u = seg(t, EV.uIni, EV.uFim, easeInOut);
  const s = seg(t, EV.sIni, EV.sFim, easeInOut);
  let zoom = mix(1.06, 1.14, push);
  zoom = mix(zoom, 0.98, back);
  zoom = mix(zoom, 1.32, seg(t, EV.sIni + 1.0, EV.sFim, easeInOut));
  return { s, u, latC: LATC_FLAT, G: I3, zoom, panX: PANX_FLAT * (1 - s), panY: 0, roll: 0, cx: W / 2, cy: mix(770, 800, back) };
}

type K = { s: number; u: number; latC: number; zoom: number; cx: number; cy: number; panX: number; yaw: number; roll: number };
const flat = (zoom: number, cy = 790): K => ({ s: 0, u: 0, latC: LATC_FLAT, zoom, cx: W / 2, cy, panX: PANX_FLAT, yaw: 0, roll: 0 });
const globe = (latC: number, zoom: number, cy: number, yaw = 0, roll = 0): K => ({ s: 1, u: 1, latC, zoom, cx: W / 2, cy, panX: 0, yaw, roll });

// giro que deixa a rota ciano horizontal quando o globo está centrado no ponto médio do círculo máximo
export const ROLL_REVEAL = (() => {
  const base: View = { s: 1, u: 1, latC: LATC_MID, G: I3, zoom: 1, panX: 0, panY: 0, roll: 0, cx: 0, cy: 0 };
  const a = project(rel(NY.lon * D2R), NY.lat * D2R, base), b = project(rel(TK.lon * D2R), TK.lat * D2R, base);
  return Math.atan2(-(a.y - b.y), a.x - b.x);  // ângulo da reta NY–TK na tela, em sentido matemático
})();

function keys(): [number, K][] {
  return [
    [E.globoPronto, globe(LATC_FLAT, 1.32, 800)],
    [E.iguais, globe(36 * D2R, 1.5, 840)],                          // círculos vistos de frente: iguais
    [E.cena3, globe(30 * D2R, 1.55, 870, -0.15)],                    // plano do círculo máximo visível
    [E.desenrola, globe(40 * D2R, 1.5, 860, 0)],
    [E.plano2, flat(1.06)],                                           // de volta ao mapa: a curva "gigantesca"
    [E.globo2, flat(1.12, 780)],
    [E.globo2Fim, globe(LATC_MID, 1.7, 900, 0, -ROLL_REVEAL)],       // revelação: a curva vira reta
    [E.split, globe(LATC_MID, 1.7, 900, 0, -ROLL_REVEAL)],
    [E.splitFim, globe(LATC_MID, 1.7, 900, 0, -ROLL_REVEAL)],
    [E.cena5 + 1.2, globe(57 * D2R, 2.05, 960, 0, -ROLL_REVEAL * 0.5)],
    [E.cena6 - 0.6, globe(57 * D2R, 2.05, 960, 0.05, -ROLL_REVEAL * 0.5)],
    [E.desenrola2, globe(57 * D2R, 2.05, 960, 0, 0)],
    [E.plano3, flat(1.04)],
    [E.slogan + 0.6, flat(0.6, 600)],
  ];
}

export function viewAt(t: number): View {
  if (t <= E.globoPronto) return pilotView(t);
  const ks = keys();
  let i = 0;
  while (i < ks.length - 1 && t > ks[i + 1][0]) i++;
  const [t0, a] = ks[i];
  const [t1, b] = ks[Math.min(i + 1, ks.length - 1)];
  const k = t1 > t0 ? easeInOut(lin(t, t0, t1)) : 1;
  const m = (x: number, y: number) => x + (y - x) * k;
  // na transformação globo<->mapa, latitude verdadeira (u) acompanha a curvatura (s)
  const s = m(a.s, b.s), u = m(a.u, b.u);
  const yaw = m(a.yaw, b.yaw);
  return {
    s, u, latC: m(a.latC, b.latC),
    G: Math.abs(yaw) > 1e-6 && s > 0.97 ? rotY(yaw) : I3,
    zoom: m(a.zoom, b.zoom), panX: m(a.panX, b.panX), panY: 0,
    roll: m(a.roll, b.roll), cx: m(a.cx, b.cx), cy: m(a.cy, b.cy),
  };
}

// cena 4: mapa plano em cima, globo embaixo
export function splitK(t: number) {
  return seg(t, E.split, E.split + 0.7, easeInOut) * (1 - seg(t, E.splitFim - 0.6, E.splitFim, easeInOut));
}
export function splitViews(t: number, main: View) {
  const k = splitK(t);
  const top: View = { s: 0, u: 0, latC: LATC_FLAT, G: I3, zoom: 0.72, panX: PANX_FLAT, panY: 0, roll: 0, cx: W / 2, cy: mix(-420, 520, k) };
  const bottom: View = { ...main, cy: mix(main.cy, 1430, k), zoom: mix(main.zoom, 1.12, k) };
  const divide = mix(0, 930, k);
  return { k, top, bottom, divide };
}
