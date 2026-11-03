// Objetos desenhados: mastros de madeira (roliços), com veios e sombreado de cilindro.
const MADEIRA = { claro: '#C99A62', medio: '#A8763F', escuro: '#6E4A26', veio: '#5A3A1C' };
// mastro entre (x0,y0) e (x1,y1), raio r
function mastroLinha(x0, y0, x1, y1, r, semente = 1) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), ang = Math.atan2(dy, dx);
  ctx.save(); ctx.translate(x0, y0); ctx.rotate(ang);
  const ow = Math.max(2.2 / escala(), r * 0.08);
  ctx.fillStyle = C.contorno; rr(-ow, -r - ow, L + 2 * ow, 2 * r + 2 * ow, r * 0.35); ctx.fill();
  const g = ctx.createLinearGradient(0, -r, 0, r);
  g.addColorStop(0, MADEIRA.claro); g.addColorStop(0.35, MADEIRA.claro); g.addColorStop(0.7, MADEIRA.medio); g.addColorStop(1, MADEIRA.escuro);
  ctx.fillStyle = g; rr(0, -r, L, 2 * r, r * 0.3); ctx.fill();
  ctx.save(); rr(0, -r, L, 2 * r, r * 0.3); ctx.clip();
  const R = mulberry32(semente); ctx.strokeStyle = rgba(MADEIRA.veio, 0.35); ctx.lineWidth = Math.max(1, r * 0.04);
  for (let i = 0; i < 9; i++) { const yy = (R() * 2 - 1) * r * 0.8, x = R() * L * 0.6, l = L * (0.25 + R() * 0.5); ctx.beginPath(); ctx.moveTo(x, yy); ctx.bezierCurveTo(x + l * 0.3, yy + r * 0.08, x + l * 0.7, yy - r * 0.08, x + l, yy + r * 0.03); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(0, -r * 0.62, L, r * 0.16);
  ctx.restore();
  // topos cortados (anéis)
  for (const x of [0, L]) { ctx.fillStyle = MADEIRA.medio; ctx.strokeStyle = C.contorno; ctx.lineWidth = ow; ctx.beginPath(); ctx.ellipse(x, 0, r * 0.28, r, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.strokeStyle = rgba(MADEIRA.veio, 0.5); ctx.lineWidth = ow * 0.6; ctx.beginPath(); ctx.ellipse(x, 0, r * 0.15, r * 0.55, 0, 0, 7); ctx.stroke(); }
  ctx.restore();
}
function mastro(x, y0, y1, r, vertical = true, semente = 1) { if (vertical) mastroLinha(x, y0, x, y1, r, semente); else mastroLinha(y0, x, y1, x, r, semente); }
