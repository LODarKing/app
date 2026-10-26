// Fotos reais dos animais em PIP (picture-in-picture), com o nome popular e o nome científico ao lado.
// As fotos vêm do Wikimedia Commons (fotos/baixar.py); o crédito de cada uma (autor + licença) aparece na borda da foto.
'use strict';
// enquadramento de cada foto: centro do recorte (fração da imagem) e zoom sobre o "cover"
const FOTO = {
  tigre: { sci: 'Panthera tigris', fx: 0.6, fy: 0.55, z: 1.25 },
  leao: { sci: 'Panthera leo', fx: 0.28, fy: 0.5, z: 1.35 },
  onca: { sci: 'Panthera onca', fx: 0.62, fy: 0.48, z: 1.1 },
  guepardo: { sci: 'Acinonyx jubatus', fx: 0.5, fy: 0.5, z: 1.1 },
  leopardo: { sci: 'Panthera pardus', fx: 0.5, fy: 0.5, z: 1.1 },
  sucuarana: { sci: 'Puma concolor', fx: 0.55, fy: 0.5, z: 1.0 },
  jaguatirica: { sci: 'Leopardus pardalis', fx: 0.56, fy: 0.55, z: 1.05 },
  gato: { sci: 'Felis catus', fx: 0.5, fy: 0.5, z: 1.1 },
  persa: { sci: 'Felis catus', fx: 0.5, fy: 0.5, z: 1.25 },
  siames: { sci: 'Felis catus', fx: 0.6, fy: 0.45, z: 1.05 },
  mainecoon: { sci: 'Felis catus', fx: 0.5, fy: 0.42, z: 1.0 },
  angora: { sci: 'Felis catus', fx: 0.5, fy: 0.5, z: 1.1 },
};
// créditos (gerados de documentacao/fotos_creditos.json por fotos/baixar.py → js/fotos_creditos.js)
const fotoImg = (k) => { const im = document.getElementById('foto_' + k); return im && im.complete && im.naturalWidth ? im : null; };
const fotoCredito = (k) => { const c = (window.FOTO_CRED || {})[k]; return !c ? '' : c.licenca === 'uso autorizado' ? 'Foto enviada pela produção' : `Foto: ${c.autor} · ${c.licenca} · Wikimedia Commons`; };
/**
 * PIP com foto real: cartão de foto (borda creme, leve rotação, sombra), Ken Burns lento, selo "foto real",
 * crédito na borda e, ao lado, o nome popular e o nome científico em itálico.
 * o: { x, y (canto sup. esq. do cartão), w (largura da foto), h, side: 'right'|'left'|'below', name, sub, rot }
 */
function photoPip(ctx, t, t0, t1, key, o) {
  const k = (t - t0) / 0.32, out = (t - t1) / 0.22; if (k <= 0 || out >= 1) return;
  const img = fotoImg(key); if (!img) return;
  const F = FOTO[key], { x, y, w = 380, h = 280, side = 'right', name = '', sub = '', rot = -0.025, ly = 24 } = o;
  const B = 14, CB = 30, cw = w + 2 * B, ch = h + B + CB;   // cartão: borda + faixa do crédito embaixo
  const s = (k < 1 ? outBack(clamp(k), 1.8) : 1) * (out > 0 ? 1 - easeIn(clamp(out)) : 1);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(x + cw / 2, y + ch / 2); ctx.rotate(rot + (1 - Math.min(1, k)) * 0.12); ctx.scale(s, s); ctx.translate(-cw / 2, -ch / 2);
  // sombra suave no papel
  ctx.fillStyle = 'rgba(30,16,36,0.28)'; ctx.beginPath(); ctx.roundRect(10, 14, cw, ch, 10); ctx.fill();
  ctx.fillStyle = '#F6EEDD'; ctx.beginPath(); ctx.roundRect(0, 0, cw, ch, 10); ctx.fill();
  // foto: recorte "cover" com zoom e deriva lenta (Ken Burns)
  const life = clamp((t - t0) / Math.max(1, t1 - t0)), z = F.z * (1 + 0.07 * life);
  const sc = Math.max(w / img.naturalWidth, h / img.naturalHeight) * z, sw = w / sc, sh = h / sc;
  const sx = clamp(F.fx * img.naturalWidth - sw / 2 + (life - 0.5) * sw * 0.05, 0, img.naturalWidth - sw), sy = clamp(F.fy * img.naturalHeight - sh / 2, 0, img.naturalHeight - sh);
  ctx.save(); ctx.beginPath(); ctx.roundRect(B, B, w, h, 6); ctx.clip(); ctx.drawImage(img, sx, sy, sw, sh, B, B, w, h);
  ctx.fillStyle = linear(ctx, 0, B, 0, B + h, [[0, 'rgba(0,0,0,0)'], [0.75, 'rgba(0,0,0,0)'], [1, 'rgba(20,10,20,0.18)']]); ctx.fillRect(B, B, w, h); ctx.restore();
  // selo "foto real"
  ctx.font = '800 22px InterUI'; const sl = 'FOTO REAL', slw = ctx.measureText(sl).width + 24;
  ctx.fillStyle = ACCENT; ctx.beginPath(); ctx.roundRect(B + 10, B + 10, slw, 34, 17); ctx.fill(); ctx.fillStyle = PLUM; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillText(sl, B + 22, B + 28);
  // crédito na faixa de baixo (exigência das licenças CC)
  const cr = fotoCredito(key); ctx.font = '600 17px InterUI'; let fs = 17; while (ctx.measureText(cr).width > cw - 2 * B && fs > 11) { fs -= 1; ctx.font = `600 ${fs}px InterUI`; }
  ctx.fillStyle = 'rgba(59,42,69,0.85)'; ctx.fillText(cr, B, h + B + CB / 2 + 1);
  ctx.restore();
  // nome popular + nome científico ao lado (entra logo depois da foto)
  const nk = clamp((t - t0 - 0.18) / 0.3) * (out > 0 ? 1 - clamp(out) : 1); if (nk <= 0) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = nk;
  ctx.font = '900 50px InterUI'; const nw = ctx.measureText(name).width; ctx.font = 'italic 700 40px InterUI'; const sw2 = ctx.measureText(F.sci).width; ctx.font = '700 28px InterUI'; const subw = sub ? ctx.measureText(sub).width : 0;
  const bw = Math.max(nw, sw2, subw) + 44, bh = 66 + 54 + (sub ? 40 : 0) + 12;
  let bx, by; if (side === 'right') { bx = x + cw + 18; by = y + ly; } else if (side === 'left') { bx = x - 18 - bw; by = y + ly; } else { bx = x + cw / 2 - bw / 2; by = y + ch + 16; }
  ctx.translate((1 - easeOut(nk)) * (side === 'left' ? 30 : -30), 0);
  ctx.fillStyle = 'rgba(30,16,36,0.25)'; ctx.beginPath(); ctx.roundRect(bx + 6, by + 8, bw, bh, 14); ctx.fill();
  ctx.fillStyle = PLUM; ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 14); ctx.fill();
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.font = '900 50px InterUI'; ctx.fillStyle = CREAM; ctx.fillText(name, bx + 22, by + 60);
  ctx.font = 'italic 700 40px InterUI'; ctx.fillStyle = ACCENT; ctx.fillText(F.sci, bx + 22, by + 60 + 52);
  if (sub) { ctx.font = '700 28px InterUI'; ctx.fillStyle = '#D9C2D0'; ctx.fillText(sub, bx + 22, by + 60 + 52 + 40); }
  ctx.restore();
}
