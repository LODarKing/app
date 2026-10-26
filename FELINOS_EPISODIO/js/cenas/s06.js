// Cena 06 — Dentes de um carnívoro (requisito 4: alimentação e dentição). Sem caça nem violência: só a adaptação anatômica.
// Pingo comendo ração (o leão em seu ambiente ao fundo) -> tela dividida: mandíbula do gato e do leão -> caninos -> carniceiros como tesoura
// -> Miguel e Lara -> Pingo limpa o focinho (a pata revela os bigodes).
'use strict';
(() => {
  const kitchen = () => cachedPainted('s06kitchen', 1080, 1920, (g, w, h) => {
    g.fillStyle = '#E9C9A8'; g.fillRect(0, 0, w, h);
    for (let y = 900; y < 1300; y += 60) for (let x = (y / 60) % 2 ? 0 : 30; x < w; x += 60) { g.fillStyle = (x / 60 + y / 60) % 3 ? '#F2DCC0' : '#E6CDB0'; g.fillRect(x + 2, y + 2, 56, 56); }
    g.fillStyle = '#B88A6E'; g.fillRect(0, 1300, w, 30);
    for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#C89A78' : '#BC8E6E'; g.fillRect(0, 1330 + i * 76, w, 72); }
    // janela (o leão aparece nela depois)
    g.fillStyle = '#8A6A5A'; g.fillRect(560, 230, 440, 560); g.fillStyle = '#F6C9A0'; g.fillRect(586, 256, 388, 508);
    g.fillStyle = '#8A6A5A'; g.fillRect(774, 256, 14, 508); g.fillRect(586, 504, 388, 14);
    // prateleira com potes
    g.fillStyle = '#8A6A5A'; g.fillRect(60, 520, 380, 20); [[110, '#7E9C82'], [200, '#E2A86A'], [300, '#C98A9A'], [380, '#9AB0C8']].forEach(([x, c], i) => { g.fillStyle = c; g.beginPath(); g.roundRect(x - 34, 420 - i % 2 * 20, 68, 100 + i % 2 * 20, 12); g.fill(); });
  }, 22, 0.55);
  /** savana com leão ao entardecer (pintura), usada na janela que cresce */
  function savannaView(g, t, w, h) {
    g.fillStyle = linear(g, 0, 0, 0, h, [[0, '#7E5A8E'], [0.5, '#EE9F8E'], [0.7, '#F6C9A0'], [1, '#C98A7A']]); g.fillRect(0, 0, w, h);
    g.fillStyle = '#FFF0D2'; g.beginPath(); g.arc(w * 0.62, h * 0.62, 90, 0, 6.283); g.fill();
    g.fillStyle = '#9A5E7A'; g.beginPath(); trace(g, smooth([[0, h * 0.7], [w * 0.4, h * 0.67], [w, h * 0.7], [w, h], [0, h]])); g.fill();
    const [lc, lg] = layer('s06lion'); drawBigCat(lg, 'lion', { x: w * 0.28, y: h * 0.74, s: 0.5, headRot: -8 + 4 * Math.sin(t * 0.8), tail: t }, t, { dark: 'rgba(60,25,55,0.85)', rim: '#FFD7A6', rimDx: -5, rimDy: -5 }); g.drawImage(lc, 0, 0);
  }
  function bowl(ctx, x, y, s, eaten = 0) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = 'rgba(60,30,40,0.25)'; ctx.beginPath(); ctx.ellipse(10, 40, 200, 26, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#C9566A'; ctx.beginPath(); ctx.moveTo(-190, -40); ctx.lineTo(190, -40); ctx.lineTo(150, 40); ctx.lineTo(-150, 40); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#A8445A'; ctx.beginPath(); ctx.ellipse(0, -40, 190, 34, 0, 0, 6.283); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, -40, 172, 26, 0, 0, 6.283); ctx.clip(); for (let i = 0; i < 40 * (1 - eaten); i++) { ctx.fillStyle = i % 2 ? '#9A6A3E' : '#B8824E'; ctx.beginPath(); ctx.ellipse(-150 + rnd(101, i) * 300, -46 + rnd(102, i) * 16, 14, 10, rnd(103, i) * 3, 0, 6.283); ctx.fill(); } ctx.restore();
    ctx.fillStyle = '#F2D2D8'; ctx.save(); ctx.translate(0, 4); ctx.scale(0.35, 0.35); pawPrint(ctx, '#F2D2D8', 0, 9); ctx.restore();
    ctx.restore();
  }
  function shotEat(ctx, t) {
    const td = on2s(t), win = sm((t - 2.0) / 2.5);
    ctx.drawImage(kitchen(), 0, 0);
    // a janela mostra a savana com o leão e cresce, virando o fundo
    const [vc, vg] = layer('s06view'); savannaView(vg, t, W, H);
    const wx = lerp(586, 40, win), wy = lerp(256, 120, win), ww = lerp(388, W - 80, win), wh = lerp(508, 820, win);
    ctx.save(); ctx.fillStyle = '#8A6A5A'; ctx.fillRect(wx - 18, wy - 18, ww + 36, wh + 36); ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip(); ctx.drawImage(vc, 0, H * 0.32, W, H * 0.62, wx, wy, ww, wh); ctx.restore();
    sunRays(ctx, t, { x: 700, y: 200, ang: -0.5, len: 1400, n: 3, width: 110, color: '255,210,170', alpha: 0.2 });
    // Pingo comendo (cabeça abaixa e mastiga em ritmo)
    const chew = Math.abs(Math.sin(td * 7)), up = bell(td, 4.6, 0.4);
    bowl(ctx, 540, 1500, 1.0, clamp(t / 9) * 0.6);
    drawPingo(ctx, { x: 540, y: 1430, s: 0.85, tilt: 0, headDy: lerp(70, 0, up) + 6 * chew * (1 - up), blink: lerp(0.85, blinkAt(td, [4.9]), up), dilate: 0.3, tail: td, meow: 0.15 * chew * (1 - up), earL: -4 * chew, earR: -4 * chew });
    leafShadows(ctx, t, [0, 1000, W, 920], { alpha: 0.08, seed: 15 });
  }
  /** mandíbula em perfil (crânio estilizado): caninos, carniceiros (lâminas), abertura da boca; hl = destaque */
  function jaw(ctx, x, y, s, open, hl, big) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const bone = '#F3EADC', boneS = '#D9CCB8', ink = '#5A4048';
    // crânio (parte de cima)
    const sk = flat(ctx, [[-300, -40], [-280, -170], [-160, -250], [20, -250], [170, -200], [300, -110], [380, -60], [400, -20], [300, 0], [-120, 10], [-280, 20]], bone, 6); ctx.strokeStyle = '#1E1828'; ctx.lineWidth = 6; ctx.beginPath(); trace(ctx, sk); ctx.stroke();
    clipTo(ctx, sk, () => { ctx.fillStyle = boneS; ctx.beginPath(); ctx.ellipse(-60, -40, 260, 60, 0, 0, 6.283); ctx.fill(); });
    ctx.fillStyle = '#2A2234'; ctx.beginPath(); ctx.ellipse(60, -150, 70, 56, -0.1, 0, 6.283); ctx.fill();   // órbita
    // dentes de cima: incisivos, canino longo, pré-molares, carniceiro (lâmina)
    const tooth = (pts, isHl) => { ctx.fillStyle = '#FFFDF6'; ctx.beginPath(); trace(ctx, smooth(pts, true, 3)); ctx.fill(); ctx.strokeStyle = isHl ? ACCENT : ink; ctx.lineWidth = isHl ? 12 : 4; ctx.stroke(); };
    const cl = big ? 140 : 110;
    tooth([[380, -16], [392, -16], [394, 20], [384, 22]], 0); tooth([[360, -14], [372, -14], [374, 22], [362, 24]], 0);
    tooth([[300, -6], [338, -6], [326, cl - 50], [316, cl - 30]], hl === 'canine');
    tooth([[200, -2], [250, -2], [240, 36], [226, 50], [212, 36]], 0);
    tooth([[60, 0], [170, 0], [160, 30], [130, 70], [110, 40], [80, 66], [62, 30]], hl === 'carn');
    // mandíbula (articulada atrás)
    ctx.save(); ctx.translate(-240, 10); ctx.rotate(open * 0.32);
    const md = flat(ctx, [[-60, -10], [40, -6], [600, 0], [630, 40], [560, 90], [100, 110], [-30, 90], [-80, 30]], bone, 6); ctx.strokeStyle = '#1E1828'; ctx.lineWidth = 6; ctx.beginPath(); trace(ctx, md); ctx.stroke();
    ctx.fillStyle = boneS; ctx.beginPath(); ctx.ellipse(250, 70, 280, 22, 0, 0, 6.283); ctx.fill();
    tooth([[600, 4], [612, 4], [612, -30], [602, -32]], 0);
    tooth([[530, 4], [560, 4], [552, -cl + 60], [542, -cl + 40]], hl === 'canine');
    tooth([[300, 4], [410, 4], [400, -34], [374, -70], [352, -30], [320, -60], [302, -26]], hl === 'carn');
    ctx.restore();
    ctx.restore();
  }
  function shotJaws(ctx, t) {
    const td = on2s(t), k = sm((t - P.split) / 0.5);
    ctx.fillStyle = '#3A3150'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(220,200,230,0.12)'; ctx.lineWidth = 2; for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    const hl = t >= P.carnassial ? 'carn' : t >= P.canines ? 'canine' : null;
    const open = t >= P.carnassial ? 0.5 * Math.max(0, Math.sin((td - P.carnassial) * Math.PI * 1.25)) : 0.35;
    ctx.save(); ctx.globalAlpha = k; jaw(ctx, 480 - 200 * (1 - k), 470, 0.9, open, hl, false); jaw(ctx, 450 + 200 * (1 - k), 1010, 1.15, open, hl, true); ctx.restore();
    ctx.fillStyle = 'rgba(246,238,228,0.5)'; ctx.fillRect(60, 735, W - 120, 6);
    if (t >= P.carnassial) { const sc = Math.sin((td - P.carnassial) * Math.PI * 2.5) * 0.35; ctx.save(); ctx.translate(920, 780); ctx.strokeStyle = CREAM; ctx.lineWidth = 10; ctx.lineCap = 'round'; [-1, 1].forEach((sd) => { ctx.save(); ctx.rotate(sd * (0.35 + sc)); ctx.beginPath(); ctx.moveTo(-60, 0); ctx.lineTo(60, 0); ctx.stroke(); ctx.beginPath(); ctx.arc(-80, sd * 12, 22, 0, 6.283); ctx.stroke(); ctx.restore(); }); ctx.restore(); }
  }
  function shotKids(ctx, t) {
    const td = on2s(t), tm = talkBeats('miguel', t + SCENE_T0), tl = talkBeats('lara', t + SCENE_T0);
    ctx.save(); ctx.translate(-200, -140); ctx.scale(1.15, 1.15); ctx.drawImage(kitchen(), 0, 0); ctx.restore();
    const L = { dir: [1, -0.5], key: 'rgba(255,215,170,0.3)', shade: 'rgba(70,35,95,0.38)', rim: 'rgba(255,226,186,1)', rimW: 7, rimA: 0.8 };
    drawPerson(ctx, 'miguel', { x: 760, y: 1040, s: 0.86, t: td, mouth: voiceL('miguel', t), look: [-6, 4], turn: -0.35, tilt: -3 + 2 * tm.nod, brow: 0.3 + 0.6 * tm.brow, smile: 0.7, blink: blinkAt(td, [P.kids + 1.3]), armR: { a1: lerp(84, 30, ss((td - P.kids - 0.6) / 0.3)), a2: lerp(100, -50, ss((td - P.kids - 0.6) / 0.3)), open: 1 }, light: L });
    const yes = ss((td - 23.0) / 0.25);
    drawPerson(ctx, 'lara', { x: 300, y: 1060, s: 0.86, t: td, mouth: voiceL('lara', t), look: [7, 3], turn: 0.35, tilt: 3 + 6 * tl.nod, smile: 1, happy: bell(td, 24.0, 0.35) > 0.5 ? 1 : 0, blink: blinkAt(td, [P.kids + 2.2]), armR: { a1: lerp(84, 40, yes), a2: lerp(100, -20, yes), open: 1, point: yes }, light: L });
    bowl(ctx, 560, 1650, 0.7, 0.9);
    drawPingo(ctx, { x: 560, y: 1640, s: 0.5, headDy: 30 * (1 - ss((td - 21) / 0.3)), blink: blinkAt(td, [22.4]), tail: td, look: [0, -4] });
  }
  function shotClean(ctx, t) {
    const td = on2s(t), k = clamp((td - P.clean) / 1.2), z = lerp(1.6, 2.4, sm(k));
    ctx.drawImage(kitchen(), 0, 0);
    ctx.save(); ctx.translate(540, 1000); ctx.scale(z, z); ctx.translate(-540, -1060);
    drawPingo(ctx, tp(ctx, { x: 540, y: 1430, s: 0.85, blink: 0.9, tail: td, tilt: -8 * Math.sin(td * 6) }));
    // a pata passa sobre o focinho (lambendo e limpando)
    const swipe = Math.sin(clamp(k * 1.4) * Math.PI * 2), px = 540 + 60 * swipe, py = 1430 - 0.85 * 420 + 30;
    const S = tp(ctx, { x: px, y: py, s: 0.85 });
    ctx.restore();
    ctx.save(); ctx.translate(S.x, S.y); ctx.scale(S.s, S.s); const leg = flat(ctx, limb([[-60 - 60 * swipe, 330], [-70 - 30 * swipe, 170], [0, 0]], [40, 36, 34]), PG.fur, 4); clipTo(ctx, leg, () => { ctx.fillStyle = PG.stripe; [90, 200].forEach((y) => { ctx.fillRect(-160, y, 300, 16); }); }); flat(ctx, ell(0, -6, 52, 40, 12), PG.white, 4); ctx.fillStyle = '#E58C9C'; [-24, 0, 24].forEach((dx) => { ctx.beginPath(); ctx.ellipse(dx, -24, 9, 11, 0, 0, 6.283); ctx.fill(); }); ctx.restore();
  }
  function draw(ctx, t) {
    if (t < P.split) shotEat(ctx, t);
    else if (t < P.kids) shotJaws(ctx, t);
    else if (t < P.clean) shotKids(ctx, t);
    else shotClean(ctx, t);
    vignette(ctx, '50,25,40', 0.25);
  }
  function ui(ctx, t) {
    if (t < P.split) { uiCard(ctx, t, 2.4, P.split - 0.1, 'carnívoros obrigatórios', 540, 300, { size: 52, accent: true }); uiCard(ctx, t, 5.6, P.split - 0.1, 'nutrientes de origem animal', 540, 420, { size: 40 }); }
    if (t >= P.split && t < P.kids) {
      uiCard(ctx, t, P.split + 0.3, P.kids - 0.1, 'gato doméstico', 230, 230, { size: 40 }); uiCard(ctx, t, P.split + 0.5, P.kids - 0.1, 'leão', 160, 800, { size: 40 });
      uiCard(ctx, t, P.canines + 0.2, P.carnassial - 0.05, 'caninos: seguram', 760, 680, { size: 42, accent: true });
      uiCard(ctx, t, P.carnassial + 0.6, P.kids - 0.1, 'carniceiros: cortam como tesoura', 560, 680, { size: 38, accent: true });
    }
  }
  const sfx = (E) => [['crunch', 3.0, 0.4, 820, 1150, 110, 0.1], ['crunch', 6.5, 0.4, 260, 1100, 110, -0.1], ['slurp', E.clean + 0.3, 0.5, 760, 640, 130, 0.12]];
  CENAS.s06 = { draw, ui, sfx, capY: (t) => (t >= P.split && t < P.kids ? 1420 : 1390) };
})();
