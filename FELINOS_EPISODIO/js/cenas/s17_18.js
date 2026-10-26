// Cena 17 — Daniel na cova dos leões (Dn 6:16–23): a mais emocional; sem humor; anjo respeitoso, sem efeitos fantasiosos.
// Cena 18 — Um novo olhar para a criação (encerramento) + créditos.
'use strict';
(() => {
  const GOLD = '#FFE2A8', MOON = '#C8D4F0';
  function s17(ctx, t, E) {
    const td = on2s(t);
    if (t < E.lara) { danielStory(ctx, t, E); return; }   // Daniel (historias.js)
    {   // Lara, suavemente, à mesa com o Diário dourado
      const td2 = td, tb = talkBeats('lara', t + SCENE_T0), out = sm((t - E.outro) / 3);
      mesaShot(ctx, t, { cam: { z: lerp(1.6, 1.2, out), fx: lerp(400, 545, out), fy: lerp(1010, 1080, out) }, book: { open: 1, gold: 0.8 }, warm: 0.7,
        lara: { x: 282, y: 868, s: 0.74, t: td2, mouth: voiceL('lara', t), smile: 0.8, look: [6, 6], turn: 0.25, tilt: 5 + 2 * tb.nod, brow: 0.2, blink: blinkAt(td2, [E.lara + 2.4]), armR: { a1: 80, a2: 60, open: 0.6 } },
        miguel: { x: 806, y: 872, s: 0.74, t: td2, look: [-8, 6], turn: -0.3, smile: 0.7, blink: blinkAt(td2, [E.lara + 3.0]) },
        pingo: { x: 878, y: 1468, s: 0.5, tail: td2 * 0.5, look: [-6, 2], dilate: 0.4, blink: keys(td2, [[E.lara + 3.4, 0], [E.lara + 3.6, 0.9], [E.lara + 4.2, 0.9], [E.lara + 4.4, 0]]) } });
    }
    vignette(ctx, '20,14,30', 0.35);
  }
  // ======================================================== CENA 18 — encerramento
  function s18(ctx, t, E) {
    const td = on2s(t);
    if (t < E.ident) {
      const up = sm((t - E.rise) / 3.5), tm = talkBeats('miguel', t + SCENE_T0), wake = ss((td - E.stretch) / 0.5), yawn = bell(td, E.meow, 0.35);
      mesaShot(ctx, t, { cam: { z: lerp(1.5, 0.9, up), fx: lerp(700, 545, up), fy: lerp(1150, 900, up) }, book: { open: 1 - sm((t - E.close) / 1.0) }, warm: 0.8, cushion: true,
        lara: { x: 282, y: 868, s: 0.74, t: td, smile: 1, look: [7, 6], turn: 0.3, happy: up > 0.5 ? 1 : 0, blink: blinkAt(td, [3.0, 9.6]), armR: up > 0.3 ? { a1: lerp(84, 20, ss((td - 12) / 0.4)), a2: lerp(100, -70, ss((td - 12) / 0.4)), open: 1 } : undefined },
        miguel: { x: 806, y: 872, s: 0.74, t: td, mouth: voiceL('miguel', t), smile: 1, look: [4, 9], turn: 0.1, tilt: 4 + 2 * tm.nod, brow: 0.3 + 0.4 * tm.brow, blink: blinkAt(td, [5.2]), armL: up > 0.3 ? { a1: lerp(100, 160, ss((td - 12.3) / 0.4)), a2: lerp(80, -110, ss((td - 12.3) / 0.4)), open: 1 } : undefined },
        pingo: { x: 860, y: 1470, s: 0.5, crouch: 1 - wake * 0.9, blink: lerp(1, 0, wake) * (1 - yawn) + yawn * 0.8, meow: yawn, tail: td * (0.3 + wake), headDy: -20 * yawn, dilate: 0.4, look: [-4, -4 * wake], earL: -10 * yawn, earR: -10 * yawn } });
      if (up > 0.2) { ctx.save(); ctx.globalAlpha = (up - 0.2) / 0.8 * 0.8; ctx.fillStyle = linear(ctx, 0, 0, 0, 900, [[0, 'rgba(110,80,140,0.6)'], [1, 'rgba(255,190,140,0)']]); ctx.fillRect(0, 0, W, 900); ctx.restore(); cloudsDrift(ctx, t, { y0: 80, y1: 400, n: 3, speed: 14, wrap: 1900, x0: -500, alpha: up }); }
      for (let i = 0; i < 3; i++) { const k = (t - E.rise - 2 - i * 0.6) * 0.25; if (k > 0 && k < 1) { ctx.save(); ctx.translate(-80 + k * 1300, 420 - i * 60 + 20 * Math.sin(k * 20)); ctx.strokeStyle = '#3B2A45'; ctx.lineWidth = 6; ctx.lineCap = 'round'; const f = Math.sin(td * 12 + i) * 14; ctx.beginPath(); ctx.moveTo(-26, f); ctx.quadraticCurveTo(-12, -8, 0, 0); ctx.quadraticCurveTo(12, -8, 26, f); ctx.stroke(); ctx.restore(); } }
    } else {   // identidade de encerramento com a insígnia oficial; o Pingo atravessa e deixa uma pegada
      ctx.fillStyle = '#F3E8D8'; ctx.fillRect(0, 0, W, H); ctx.drawImage(BOOK.pageNotes(), 0, 0, 1, 1, 0, 0, 1, 1);
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(cachedPainted('s18paper', 1080, 1920, (g, w, h) => { g.fillStyle = '#F3E8D8'; g.fillRect(0, 0, w, h); }, 41, 0.5), 0, 0); ctx.restore();
      const pk = clamp((t - E.paw) / 1.6), px = lerp(-200, 1250, pk);
      for (let i = 0; i < 6; i++) { const x = 40 + i * 190, k = (px - x) / 120; if (k > 0) { ctx.save(); ctx.translate(x, 1690 + (i % 2) * 70); ctx.rotate(Math.PI / 2 + 0.1); ctx.scale(0.36, 0.36); ctx.globalAlpha = i === 5 ? 1 : clamp(1 - (t - E.paw - i * 0.27 - 0.6) / 0.8); pawPrint(ctx, ACCENT, 0, 7 + i); ctx.restore(); } }
      if (pk > 0 && pk < 1) drawBigCat(ctx, 'pingo', { x: px, y: 1640, s: 0.5, walk: td * 1.4, moving: 1, tail: td }, td, {});
      const fo = clamp((t - (E.paw + 1.6)) / 0.4); if (fo > 0) { ctx.fillStyle = `rgba(42,30,48,${fo})`; ctx.fillRect(0, 0, W, H); }
    }
    vignette(ctx, '40,20,40', 0.25);
  }
  function ui18(ctx, t, E) {
    if (t < E.ident || t > E.paw + 2.0) return;
    const fo = 1 - clamp((t - (E.paw + 1.6)) / 0.4); ctx.save(); ctx.globalAlpha = fo;
    const ins = document.getElementById('insignia'), ik = (t - E.ident - 0.2) / 0.15; if (ik > 0) { const s = ik < 1 ? lerp(1.8, 1, easeIn(ik)) : 1; ctx.save(); ctx.translate(540, 560); ctx.scale(s, s); ctx.beginPath(); ctx.arc(0, 0, 200, 0, 6.283); ctx.clip(); ctx.drawImage(ins, -210, -210, 420, 420); ctx.restore(); }
    const em = document.getElementById('emblema'), ek = (t - E.ident - 0.5) / 0.15; if (ek > 0) { const s = ek < 1 ? lerp(1.8, 1, easeIn(ek)) : 1; ctx.save(); ctx.translate(880, 330); ctx.rotate(0.06); ctx.scale(s, s); ctx.drawImage(em, -70, -71, 140, 143); ctx.restore(); }
    const line = (txt, y, t0, font, col) => { const n = Math.ceil(clamp((t - t0) / 0.5) * txt.length); if (n <= 0) return; ctx.font = font; ctx.textAlign = 'center'; ctx.fillStyle = col; ctx.fillText(txt.slice(0, n), 540, y); };
    line('ESPECIALIDADE DE FELINOS', 880, E.ident + 0.6, '900 64px InterUI', PLUM);
    line('DISTRITO DE DESBRAVADORES', 970, E.ident + 1.0, '800 44px InterUI', '#7A3E52'); line('DE AMONTADA', 1030, E.ident + 1.3, '800 44px InterUI', '#7A3E52');
    handTitle(ctx, t, E.ident + 1.7, 'Explorar. Aprender. Preservar.', 540, 1200, { size: 84, color: ACCENT, align: 'center', rot: -0.03 });
    ctx.restore();
  }
  // ======================================================== CRÉDITOS
  function cred(ctx, t, E) {
    ctx.fillStyle = '#2A1E30'; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalAlpha = 0.5; ctx.drawImage(cachedPainted('credbg', 1080, 1920, (g, w, h) => { g.fillStyle = linear(g, 0, 0, 0, h, [[0, '#3B2A45'], [1, '#5A3A50']]); g.fillRect(0, 0, w, h); }, 42, 0.8), 0, 0); ctx.restore();
    motes(ctx, t, [0, 0, W, H], { n: 20, seed: 97, color: '255,226,170', alpha: 0.5 });
    drawPingo(ctx, { x: 860, y: 1780, s: 0.4, tail: on2s(t), blink: blinkAt(on2s(t), [2.2, 5.6]), look: [-6, -4], tilt: 6, dilate: 0.4 });
    const fo = clamp((t - E.out) / 0.5); if (fo > 0) { ctx.fillStyle = `rgba(0,0,0,${fo})`; ctx.fillRect(0, 0, W, H); }
  }
  function credUi(ctx, t, E) {
    const a = 1 - clamp((t - E.out) / 0.5); ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center';
    handTitle(ctx, t, 0.2, 'Créditos', 540, 330, { size: 120, color: ACCENT, align: 'center', rot: -0.03 });
    const L = [['NARRAÇÃO', 'Italo Marinho'], ['LARA', 'voz de Isabella Meneses'], ['MIGUEL', 'voz de Abner Araújo']];
    L.forEach(([role, name], i) => { const k = clamp((t - E.lines[i]) / 0.35); if (k <= 0) return; const y = 560 + i * 210; ctx.save(); ctx.globalAlpha = a * k; ctx.translate(0, (1 - easeOut(k)) * 30); ctx.font = '800 40px InterUI'; ctx.fillStyle = '#C9A0B8'; ctx.fillText(role, 540, y); ctx.font = '900 66px InterUI'; ctx.fillStyle = CREAM; ctx.fillText(name, 540, y + 78); ctx.restore(); });
    const k = clamp((t - E.lines[3]) / 0.4); if (k > 0) { ctx.save(); ctx.globalAlpha = a * k; ctx.font = '700 40px InterUI'; ctx.fillStyle = '#E8D8E0'; ctx.fillText('Isabella e Abner fazem parte do', 540, 1240); ctx.font = '900 48px InterUI'; ctx.fillStyle = ACCENT; ctx.fillText('Clube de Desbravadores', 540, 1310); ctx.fillText('Edwardo Schimidt', 540, 1372); ctx.restore(); }
    ctx.restore();
  }
  CENAS.s17 = { draw: s17, ui: (ctx, t, E) => { if (t >= E.morning - 0.2 && t < E.lara) bibleRef(ctx, t, E.morning + 0.6, E.lara - 0.3, 'Daniel 6:16–23'); }, capY: (t, E) => (t < E.lara ? 640 : 1390), sfx: (E) => [] };
  CENAS.s18 = { draw: s18, ui: ui18, sfx: (E) => [['miau!', E.meow + 0.1, 0.6, 760, 1050, 140, 0.1]], capY: (t, E) => (t >= E.ident ? null : 1390) };
  CENAS.cred = { draw: cred, ui: credUi };
})();
