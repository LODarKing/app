// Cena 4 — ESCALA 1:25.000. No mapa (1 unidade do mundo = 1 m), 1 quadrícula = 250 m = 1 cm do mapa impresso.
// A régua mostra 1 cm = 250 m e 4 cm = 1.000 m; depois compara a distância no mapa (reta A–B) com o percurso pela trilha.
'use strict';
const A4 = (() => {
  const id = 's04', h = (t, tipo, g) => hit(id, t, tipo, g);
  return {
    pts: h(F(id, 'distância') - 0.1, 'pop'), escala: h(F(id, 'escala'), 'marca'), razao: h(F(id, '1'), 'marca'), cm: h(F(id, 'centímetro'), 'deslize'),
    m250: h(F(id, '250'), 'pop'), quatro: h(F(id, '4'), 'tique'), km: h(F(id, 'quilômetro'), 'marca'), atencao: h(F(id, 'atenção'), 'erro'),
    reta: h(F(id, 'distância', 1) - 0.2, 'traco'), trilha: h(F(id, 'necessariamente'), 'traco'), perc: h(F(id, 'percorrida'), 'pop'), fim: CENAS[id].dur,
  };
})();
const ESC = (() => {
  const T = MUNDO.trilhas, path = T.esq.slice().reverse().concat(T.dir.slice(1));
  const ac = [0]; for (let i = 1; i < path.length; i++) ac.push(ac[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]));
  let best = null;
  for (let i = 0; i < path.length; i++) {
    for (let j = i + 1; j < path.length; j++) {
      const d = Math.hypot(path[j][0] - path[i][0], path[j][1] - path[i][1]);
      if (d >= 1000) {
        // ajusta B exatamente a 1.000 m em linha reta (interpolando no segmento)
        const p0 = path[j - 1], d0 = Math.hypot(p0[0] - path[i][0], p0[1] - path[i][1]), k = (1000 - d0) / (d - d0);
        const B = [lerp(p0[0], path[j][0], k), lerp(p0[1], path[j][1], k)], L = ac[j - 1] + k * (ac[j] - ac[j - 1]) - ac[i];
        const ang = Math.abs(Math.atan2(B[1] - path[i][1], B[0] - path[i][0]));
        if (Math.min(ang, Math.PI - ang) < 0.45 && (!best || L > best.L)) best = { i, j, B, L };
        break;
      }
    }
  }
  const sub = path.slice(best.i, best.j).concat([best.B]);
  return { A: path[best.i], B: best.B, sub, L: best.L };
})();

function renderS04(ctx, t) {
  const a = A4, { A, B } = ESC;
  const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
  const cam = { cx: clamp(mx, -330, 330), cy: clamp(my + 60, -180, -20), z: 0.56, r: 0 };
  MUNDO.drawMapa(ctx, cam, { cotas: false });
  const PX_CM = 250 * cam.z; // 1 cm do mapa = 1 quadrícula = 250 m
  const [ax, ay] = MUNDO.proj(cam, A[0], A[1]), [bx, by] = MUNDO.proj(cam, B[0], B[1]);
  // percurso pela trilha
  const kt = eo3(prog(t, a.trilha, a.perc + 0.4));
  if (kt > 0) {
    const n = Math.floor(ESC.sub.length * kt);
    ctx.save(); MUNDO.applyCam(ctx, cam); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); for (let i = 0; i < n; i++) { const p = ESC.sub[i]; i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
    ctx.strokeStyle = PAL.preto; ctx.lineWidth = 22 / cam.z * 0.56; ctx.stroke(); ctx.strokeStyle = PAL.branco; ctx.lineWidth = 12 / cam.z * 0.56; ctx.stroke(); ctx.restore();
  }
  // reta A–B (distância no mapa)
  const kr = eo3(prog(t, a.reta, a.reta + 0.6));
  if (kr > 0) { ctx.strokeStyle = PAL.preto; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(lerp(ax, bx, kr), lerp(ay, by, kr)); ctx.stroke(); ctx.strokeStyle = PAL.amarelo; ctx.lineWidth = 8; ctx.stroke(); }
  // pontos A e B
  for (const [nm, x, y, d] of [['A', ax, ay, 0], ['B', bx, by, 0.12]]) {
    const k = pop(t, a.pts + d); if (k <= 0) continue;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.beginPath(); ctx.arc(0, 0, 30, 0, 7); ctx.fillStyle = PAL.preto; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = PAL.amarelo; ctx.stroke();
    txt(ctx, nm, 0, 2, 36, { cor: PAL.branco, align: 'center', base: 'middle', peso: 800 }); ctx.restore();
  }
  if (t > a.pts + 0.3 && t < a.cm) { const k = pop(t, a.pts + 0.3); ctx.save(); ctx.translate((ax + bx) / 2, (ay + by) / 2); ctx.scale(k, k); txt(ctx, '?', 0, 0, 120, { fam: FONT_T, peso: 800, cor: PAL.preto, align: 'center', base: 'middle' }); ctx.restore(); }

  // régua: primeiro horizontal embaixo; depois deita sobre a reta A–B
  const kin = eo5(prog(t, a.cm - 0.2, a.cm + 0.4));
  if (kin > 0) {
    const kal = eio(prog(t, a.reta + 0.3, a.reta + 1.1));
    const ang = Math.atan2(by - ay, bx - ax);
    const ox = lerp(lerp(-900, 130, kin), ax, kal), oy = lerp(1300, ay + 4, kal), rot = lerp(0, ang, kal);
    ctx.save(); ctx.translate(ox, oy); ctx.rotate(rot);
    const L = 5 * PX_CM, HH = 92;
    ctx.save(); ctx.translate(10, 14); rrect(ctx, -26, -HH, L + 52, HH, 10); ctx.fillStyle = 'rgba(20,30,20,0.25)'; ctx.fill(); ctx.restore();
    rrect(ctx, -26, -HH, L + 52, HH, 10); ctx.fillStyle = 'rgba(250,250,245,0.88)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = PAL.preto; ctx.stroke();
    // centímetros preenchidos (1 cm na fala "centímetro"; 1 a 4 em "4 centímetros")
    let cheios = t >= a.cm ? 1 : 0;
    if (t >= a.quatro) cheios = 1 + Math.min(3, Math.floor((t - a.quatro) / (COLCHEIA * 1.5)) + 1);
    if (kal > 0) cheios = 4;
    for (let c = 0; c < cheios; c++) { ctx.fillStyle = c % 2 ? '#E0B020' : PAL.amarelo; ctx.fillRect(c * PX_CM, -HH + 4, PX_CM, 30); }
    ctx.strokeStyle = PAL.preto;
    for (let mm = 0; mm <= 50; mm++) { const x = mm * PX_CM / 10, l = mm % 10 === 0 ? 40 : mm % 5 === 0 ? 26 : 16; ctx.lineWidth = mm % 10 === 0 ? 3 : 1.5; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, -l); ctx.stroke(); }
    for (let c = 0; c <= 5; c++) txt(ctx, String(c), c * PX_CM, -48, 30, { cor: PAL.preto, align: 'center', peso: 800 });
    txt(ctx, 'cm', L + 8, -10, 22, { cor: PAL.preto, peso: 700 });
    // metros acumulados acima de cada centímetro
    if (kal <= 0) for (let c = 1; c <= Math.min(cheios, 4); c++) {
      if (c > 1 && t < a.quatro) continue;
      const k = pop(t, c === 1 ? a.m250 : a.quatro + (c - 2) * COLCHEIA * 1.5); if (k <= 0) continue;
      ctx.save(); ctx.translate(c * PX_CM, -HH - 34); ctx.scale(k, k);
      txt(ctx, (c * 250).toLocaleString('pt-BR') + ' m', 0, 0, c === 4 ? 40 : 32, { cor: c === 4 ? PAL.preto : PAL.preto, align: 'center', peso: 800, contorno: PAL.areia });
      ctx.restore();
    }
    ctx.restore();
  }
  // textos grandes
  const out1 = a.atencao - 0.3;
  marca(ctx, t, 'ESCALA', 64, 250, 96, a.escala, { out: out1 });
  if (t > a.razao - 0.2 && t < out1 + 0.4) {
    marca(ctx, t, '1 : 25.000', 64, 420, 150, a.razao, { out: out1, fundo: PAL.branco });
    sobe(ctx, t, a.razao + 0.4, '1 cm no mapa = 25.000 cm no terreno', 70, 500, 34, { cor: PAL.preto, peso: 800, contorno: PAL.areia, out: out1 });
  }
  marca(ctx, t, '1 cm = 250 m', 64, 640, 110, a.m250, { out: a.km - 0.3 });
  marca(ctx, t, '4 cm = 1 km', 64, 640, 110, a.km, { out: out1 });
  marca(ctx, t, 'ATENÇÃO', 64, 250, 96, a.atencao, { fundo: PAL.preto, cor: PAL.amarelo });
  if (kr > 0) { sobe(ctx, t, a.reta + 0.2, 'NO MAPA: 4 cm = 1 km', 70, 1100, 52, { cor: PAL.preto, peso: 800, contorno: PAL.areia }); sobe(ctx, t, a.reta + 0.35, 'distância em linha reta', 70, 1150, 34, { cor: PAL.preto, peso: 700, contorno: PAL.areia }); }
  if (t > a.perc - 0.1) {
    const km = (ESC.L / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    sobe(ctx, t, a.perc, `PELA TRILHA: ≈ ${km} km`, 70, 1240, 52, { cor: PAL.preto, peso: 800, contorno: PAL.branco });
    sobe(ctx, t, a.perc + 0.15, 'e ainda há subidas e descidas', 70, 1290, 34, { cor: PAL.preto, peso: 700, contorno: PAL.areia });
  }
}
RENDER.s04 = renderS04;
