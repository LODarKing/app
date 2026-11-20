// Extrai o contorno do Brasil (Natural Earth 1:50m, domínio público, via world-atlas) e salva lon/lat
// do maior polígono, reamostrado a N pontos com o primeiro ponto no litoral mais próximo de Porto Alegre.
// uso: node tools/geo.mjs
import fs from 'node:fs';
import { feature } from 'topojson-client';
const topo = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-50m.json', 'utf8'));
const br = feature(topo, topo.objects.countries).features.find((f) => f.id === '076');
const polys = br.geometry.type === 'MultiPolygon' ? br.geometry.coordinates : [br.geometry.coordinates];
const lat0 = -15;
const proj = ([lo, la]) => [lo * Math.cos((lat0 * Math.PI) / 180), -la];
const area = (r) => { let a = 0; for (let i = 0; i < r.length - 1; i++) { const [x1, y1] = proj(r[i]), [x2, y2] = proj(r[i + 1]); a += x1 * y2 - x2 * y1; } return Math.abs(a / 2); };
const ring = polys.map((p) => p[0]).sort((a, b) => area(b) - area(a))[0];
const POA = [-51.2177, -30.0346];
let k0 = 0, best = 1e9;
ring.forEach((p, i) => { const d = Math.hypot(...[0, 1].map((j) => proj(p)[j] - proj(POA)[j])); if (d < best) { best = d; k0 = i; } });
const r = [...ring.slice(k0, -1), ...ring.slice(0, k0), ring[k0]];
const P = r.map(proj); const L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
const N = 600, out = [];
for (let s = 0; s <= N; s++) {
  const d = (L.at(-1) * s) / N; let i = 1; while (i < L.length - 1 && L[i] < d) i++;
  const u = (d - L[i - 1]) / (L[i] - L[i - 1] || 1);
  out.push([+(r[i - 1][0] + (r[i][0] - r[i - 1][0]) * u).toFixed(4), +(r[i - 1][1] + (r[i][1] - r[i - 1][1]) * u).toFixed(4)]);
}
fs.writeFileSync('src/data/brasil.json', JSON.stringify({ fonte: 'Natural Earth 1:50m (domínio público) via world-atlas 2.0.2', lat0, pontos: out }));
console.log('pontos', out.length, 'início', out[0], 'vértices originais', ring.length);
