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

// ---- episódio completo: contorno 1:10m, estados (Natural Earth admin-1 via datamaps, MIT) e malha de pontos ----
{
  const t10 = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-10m.json', 'utf8'));
  const b10 = feature(t10, t10.objects.countries).features.find((f) => f.id === '076');
  const pol = b10.geometry.type === 'MultiPolygon' ? b10.geometry.coordinates : [b10.geometry.coordinates];
  const anel = pol.map((p) => p[0]).sort((a, b) => area(b) - area(a))[0];
  fs.writeFileSync('src/data/brasil10.json', JSON.stringify({ fonte: 'Natural Earth 1:10m (domínio público) via world-atlas 2.0.2', pontos: anel.map(([a, b]) => [+a.toFixed(3), +b.toFixed(3)]) }));
  const tb = JSON.parse(fs.readFileSync('node_modules/datamaps/src/js/data/bra.topo.json', 'utf8'));
  const est = feature(tb, tb.objects.bra).features.map((f) => {
    const ps = f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [f.geometry.coordinates];
    // reduz vértices (passo mínimo de 0,03°) — suficiente para a escala do vídeo
    const aneis = ps.map((p) => { const out = []; for (const q of p[0]) { const l = out.at(-1); if (!l || Math.hypot(q[0] - l[0], q[1] - l[1]) > 0.03) out.push([+q[0].toFixed(3), +q[1].toFixed(3)]); } return out; }).filter((r) => r.length > 8);
    return { uf: f.id.replace('BR.', ''), nome: f.properties.name, aneis };
  });
  fs.writeFileSync('src/data/estados.json', JSON.stringify({ fonte: 'Natural Earth admin-1 (domínio público) via datamaps 0.5.10 (MIT)', estados: est }));
  // malha de pontos dentro do contorno (passo 0,9°): símbolo de expansão, não representa cidades
  const dentro = (x, y) => { let c = false; for (let i = 0, j = anel.length - 1; i < anel.length; j = i++) { const [xi, yi] = anel[i], [xj, yj] = anel[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
  const malha = []; for (let la = 5; la > -34; la -= 0.9) for (let lo = -74; lo < -34; lo += 0.9 / Math.cos((15 * Math.PI) / 180)) if (dentro(lo, la)) malha.push([+lo.toFixed(2), +la.toFixed(2)]);
  fs.writeFileSync('src/data/malha.json', JSON.stringify(malha));
  console.log('10m', anel.length, 'estados', est.length, est.reduce((s, e) => s + e.aneis.reduce((a, r) => a + r.length, 0), 0), 'malha', malha.length);
}
