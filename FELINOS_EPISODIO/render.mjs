// node render.mjs                       -> render completo: frames/ + FELINOS_PILOTO_v4.mp4 (H.264 yuv420p, CRF 16, áudio)
// node render.mjs --sheet [saida.png]   -> um quadro por batida (beats.json) numa folha de contato
// node render.mjs --stills saida.png t1 t2 ...   |   node render.mjs --frame saida.png t   |   node render.mjs --lab saida.png vista [t]
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const TL = JSON.parse(fs.readFileSync('timeline.js', 'utf8').replace(/^const TL = /, '').replace(/;\s*$/, ''));
const FPS = TL.fps, DUR = TL.dur, args = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--allow-file-access-from-files'] }).catch(() => chromium.launch({ args: ['--allow-file-access-from-files'] }));
async function page() {
  const p = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', (e) => { console.error('ERRO NA PÁGINA:', e.message); process.exitCode = 1; });
  await p.goto('file://' + path.resolve('index.html')); await p.evaluate(() => window.ready);
  return p;
}
const save = (file, url) => fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
async function shoot(p, t, file) { await p.evaluate((t) => window.seek(t), t); save(file, await p.evaluate(() => window.png())); }
function sheet(files, labels, out, cols) {
  const a = ['-loglevel', 'error', '-y']; files.forEach((f) => a.push('-i', f));
  const rows = Math.ceil(files.length / cols), pad = rows * cols - files.length;
  const v = files.map((_, i) => `[${i}]scale=270:-1,drawtext=fontfile=fonts/Inter-Bold.otf:text='${labels[i]}':x=8:y=8:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.6[v${i}]`);
  for (let k = 0; k < pad; k++) v.push(`color=black:s=270x480:d=1[p${k}]`);
  const all = [...files.map((_, i) => `[v${i}]`), ...Array.from({ length: pad }, (_, k) => `[p${k}]`)];
  const xs = []; for (let r = 0; r < rows; r++) xs.push(cols > 1 ? `${all.slice(r * cols, r * cols + cols).join('')}hstack=${cols}[r${r}]` : `${all[r]}null[r${r}]`);
  if (rows === 1) xs[0] = xs[0].replace(/\[r0\]$/, '');
  const last = rows > 1 ? `;${Array.from({ length: rows }, (_, r) => `[r${r}]`).join('')}vstack=${rows}` : '';
  a.push('-filter_complex', `${v.join(';')};${xs.join(';')}${last}`, '-frames:v', '1', out);
  execFileSync('ffmpeg', a);
}
fs.mkdirSync('out', { recursive: true });
if (args[0] === '--sheet') {
  const beats = JSON.parse(fs.readFileSync('audio/beats.json', 'utf8')).beats.filter((b) => b < DUR);
  const p = await page(), files = [];
  for (const b of beats) { const f = `out/_b_${b.toFixed(3)}.png`; await shoot(p, b + 0.02, f); files.push(f); }
  sheet(files, beats.map((b) => b.toFixed(2) + 's'), args[1] || 'out/folha_batidas.png', 8);
} else if (args[0] === '--stills') {
  const [out, ...ts] = args.slice(1), p = await page(), files = [];
  for (const t of ts) { const f = `out/_s_${t}.png`; await shoot(p, Number(t), f); files.push(f); }
  sheet(files, ts.map((t) => t + 's'), out, Math.min(files.length, 6));
} else if (args[0] === '--frame') {
  const p = await page(); await shoot(p, Number(args[2]), args[1]);
} else if (args[0] === '--lab') {
  const p = await page(); await p.evaluate(([v, t]) => window.lab(v, t), [args[2], Number(args[3] || 0)]); save(args[1], await p.evaluate(() => window.png()));
} else {
  fs.rmSync('frames', { recursive: true, force: true }); fs.mkdirSync('frames');
  const n = Math.round(DUR * FPS), pages = await Promise.all([0, 1, 2, 3].map(page)); let next = 0, done = 0; const t0 = Date.now();
  await Promise.all(pages.map(async (p) => { while (next < n) { const f = next++; await shoot(p, f / FPS, `frames/f_${String(f).padStart(5, '0')}.png`); if (++done % 120 === 0) console.log(`${done}/${n} quadros, ${((Date.now() - t0) / 1000).toFixed(0)} s`); } }));
  const a = ['-loglevel', 'error', '-y', '-framerate', String(FPS), '-i', 'frames/f_%05d.png'];
  if (fs.existsSync('audio/mix.wav')) a.push('-i', 'audio/mix.wav', '-c:a', 'aac', '-b:a', '256k', '-shortest');
  a.push('-c:v', 'libx264', '-crf', '16', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', 'FELINOS_PILOTO_v4.mp4');
  execFileSync('ffmpeg', a); console.log('vídeo: FELINOS_PILOTO_v4.mp4');
}
await browser.close();
