// Personagem egípcio em recorte articulado (cut-out): tronco, saiote, cabeça, braços (braço, antebraço, mão)
// e pernas (coxa, canela, pé com IK). Pivôs: cintura, pescoço, ombros, cotovelos, punhos, quadris, joelhos, tornozelos.
// Altura de referência: 820 px com escala 1. Voltado para a direita. Pose por parâmetros (função pura do tempo).
//   pose = { apontar: 0..1, alvo: [x,y] (mundo), olhar: [-1..1, -1..1], piscar: 0..1, resp: fase, cabeca: rad, peso: -1..1 }
// Devolve a ponta do dedo (coordenadas do mundo) para a seta de tinta.
function egipcio(x, y, s, pose) {
  const P = Object.assign({ apontar: 0, alvo: [x + 400, y - 700], olhar: [0, 0], piscar: 0, resp: 0, cabeca: 0, peso: 0 }, pose);
  const pele = C.pele, peleTras = shade(C.pele, -0.16);
  const res = {};
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const cin = [P.peso * 6, -486 + Math.sin(P.resp) * 1.5];          // cintura (sobe e desce com a respiração)
  // ---------- pernas (IK): pés fixos no chão, perna de trás (esquerda) avançada, como no cânone egípcio
  const perna = (hx, pxe, cor, dobra) => {
    const hip = [cin[0] + hx, cin[1] + 30], tor = [pxe, -24];
    const jo = ik2(hip[0], hip[1], tor[0], tor[1], 226, 214, dobra);
    membro(hip[0], hip[1], jo[0], jo[1], 30, 21, cor, { bojo: 0.1 });
    membro(jo[0], jo[1], tor[0], tor[1], 21, 13, cor, { bojo: 0.22 });
    pivo(tor[0], tor[1], 0, 1, 1, () => peca(VET.pe, cor, { lw: 3.4 }));
  };
  perna(10, 74, peleTras, 1);            // perna do lado de lá (mais escura), à frente
  // ---------- braço de trás (segura um rolo de papiro), atrás do tronco
  const ombroT = [cin[0] - 66, cin[1] - 168], aT = Math.PI / 2 + 0.14 + Math.sin(P.resp * 0.5) * 0.02;
  const coT = [ombroT[0] + Math.cos(aT) * 166, ombroT[1] + Math.sin(aT) * 166], aT2 = aT - 0.32;
  const puT = [coT[0] + Math.cos(aT2) * 148, coT[1] + Math.sin(aT2) * 148];
  membro(ombroT[0], ombroT[1], coT[0], coT[1], 22, 17, peleTras);
  membro(coT[0], coT[1], puT[0], puT[1], 17, 12, peleTras);
  pivo(puT[0], puT[1], aT2 - Math.PI / 2, 1, 1, () => {
    pivo(0, 14, 0.2, 1, 1, () => { peca('M -16 -44 L 16 -44 L 16 44 L -16 44 Z', C.linho, { lw: 3 }); ctx.strokeStyle = C.tinta; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, -44, 16, 5, 0, 0, 7); ctx.stroke(); });
    peca(VET.maoFechada, peleTras, { lw: 3 });
  });
  perna(-8, -58, pele, 1);               // perna do lado de cá
  // ---------- saiote de linho (shendyt) com cinto e pregas
  pivo(cin[0], cin[1], P.peso * 0.01, 1, 1, () => {
    peca(VET.saiote, C.linho, { lw: 3.6 });
    peca(VET.saioteAba, shade(C.linho, -0.06), { lw: 2.6, sombra: 0 });
    ctx.strokeStyle = rgba(C.tinta, 0.55); ctx.lineWidth = 1.8;
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-30 + i * 10, 14); ctx.quadraticCurveTo(-10 + i * 18, 90, 4 + i * 16, 166); ctx.stroke(); }
    peca('M -46 -10 L 46 -10 L 47 12 L -46 12 Z', C.ocre, { lw: 3, sombra: 0 });
    peca('M 2 -10 L 16 -10 L 16 12 L 2 12 Z', C.lapis, { lw: 2, sombra: 0 });
  });
  // ---------- tronco (ombros de frente) + colar largo (wesekh)
  const ry = 1 + Math.sin(P.resp) * 0.006;
  pivo(cin[0], cin[1], -0.02 * P.apontar, 1, ry, () => {
    peca(VET.tronco, pele, { lw: 3.8 });
    ctx.save(); ctx.clip(P2(VET.tronco));
    const cores = [C.lapis, C.ouro, C.turquesa, C.terracota, C.lapis];
    for (let i = cores.length - 1; i >= 0; i--) {
      const rx = 36 + 13 * (i + 1);
      ctx.beginPath(); ctx.ellipse(2, -204, rx, rx * 0.62, 0, 0, Math.PI); ctx.lineTo(2 - rx, -204); ctx.closePath();
      ctx.fillStyle = cores[i]; ctx.fill(); ctx.strokeStyle = C.tinta; ctx.lineWidth = 2.4; ctx.stroke();
    }
    for (let k = 0; k <= 14; k++) { const a = Math.PI * k / 14, rx = 36 + 13 * 5; ctx.fillStyle = k % 2 ? C.turquesa : C.ouro; ctx.beginPath(); ctx.ellipse(2 + Math.cos(a) * rx * 1.02, -204 + Math.sin(a) * rx * 0.62 * 1.04, 4.5, 7, a - Math.PI / 2, 0, 7); ctx.fill(); ctx.stroke(); }
    ctx.restore();
    ctx.strokeStyle = C.tinta; ctx.lineWidth = 3.8; ctx.stroke(P2(VET.tronco));
  });
  // ---------- cabeça (de perfil, olho de frente)
  const pesc = [cin[0] + 1, cin[1] - 222 * ry];
  pivo(pesc[0], pesc[1], P.cabeca, 1, 1, () => {
    peca(VET.rosto, pele, { lw: 3.6 });
    peca(VET.orelha, shade(pele, -0.08), { lw: 2.6, sombra: 0 });
    peca(VET.peruca, C.cabelo, { lw: 3, tex: 0.2 });
    // listras da peruca e faixa
    ctx.save(); ctx.clip(P2(VET.peruca)); ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.lineWidth = 2;
    for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(-58 + i * 9, -130); ctx.lineTo(-62 + i * 9, 10); ctx.stroke(); }
    ctx.restore();
    ctx.strokeStyle = C.ocre; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(36, -106); ctx.quadraticCurveTo(-8, -124, -54, -96); ctx.stroke();
    ctx.strokeStyle = C.tinta; ctx.lineWidth = 1.6; ctx.stroke();
    // olho amendoado com kohl; pupila que se mexe; pálpebra que pisca
    pivo(31, -79, 0, 1, Math.max(0.08, 1 - P.piscar), () => {
      ctx.translate(-31, 79);
      ctx.fillStyle = '#F6F0E2'; ctx.fill(P2(VET.olho));
      ctx.save(); ctx.clip(P2(VET.olho)); ctx.fillStyle = C.cabelo; ctx.beginPath(); ctx.arc(32 + P.olhar[0] * 3.5, -79.5 + P.olhar[1] * 2.2, 4.6, 0, 7); ctx.fill(); ctx.restore();
      ctx.strokeStyle = C.tinta; ctx.lineWidth = 2.6; ctx.stroke(P2(VET.olho));
    });
    ctx.strokeStyle = C.tinta; ctx.lineCap = 'round';
    ctx.lineWidth = 3.2; ctx.beginPath(); ctx.moveTo(41, -79); ctx.lineTo(13, -77); ctx.stroke();           // traço de kohl
    ctx.lineWidth = 3.6; ctx.beginPath(); ctx.moveTo(19, -88); ctx.quadraticCurveTo(32, -95, 44, -88); ctx.stroke(); // sobrancelha
    ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(43, -46); ctx.lineTo(50, -46); ctx.stroke();           // boca
  });
  // ---------- braço da frente: aponta para o alvo (FK com atraso do antebraço e da mão)
  const ombro = [cin[0] + 74, cin[1] - 170 * ry];
  const alvoL = { x: (P.alvo[0] - x) / s, y: (P.alvo[1] - y) / s };       // alvo nas coordenadas do personagem
  const dirAlvo = Math.atan2(alvoL.y - ombro[1], alvoL.x - ombro[0]);
  const k = clamp(P.apontar, 0, 1.2), repouso = Math.PI / 2 - 0.06;
  const a1 = lerp(repouso, dirAlvo + 0.1, k), a2 = lerp(repouso - 0.08, dirAlvo - 0.02, clamp(P.apontarAnte ?? k, 0, 1.2));
  const co = [ombro[0] + Math.cos(a1) * 168, ombro[1] + Math.sin(a1) * 168], pu = [co[0] + Math.cos(a2) * 150, co[1] + Math.sin(a2) * 150];
  membro(ombro[0], ombro[1], co[0], co[1], 23, 18, pele);
  membro(co[0], co[1], pu[0], pu[1], 18, 13, pele);
  const a3 = a2 + lerp(0.25, -0.05, clamp(P.apontarMao ?? k, 0, 1));
  pivo(pu[0], pu[1], a3, 1, 1, () => { peca(VET.polegar, pele, { lw: 2.6 }); peca(VET.maoAponta, pele, { lw: 2.8 }); });
  const ponta = [pu[0] + Math.cos(a3) * 68 - Math.sin(a3) * -7, pu[1] + Math.sin(a3) * 68 + Math.cos(a3) * -7];
  ctx.restore();
  res.dedo = [x + ponta[0] * s, y + ponta[1] * s]; return res;
}
