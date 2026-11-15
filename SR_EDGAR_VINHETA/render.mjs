// Render (Playwright + Chromium). Contrato: window.seek(t) desenha o quadro do instante t.
//   node render.mjs --frame saida.png T [--alpha]     um quadro
//   node render.mjs --stills saida.png T1 T2 ...      tira de quadros (folha)
//   node render.mjs --sheet [saida.png]               um quadro por batida medida (audio/beats.json) — ciclo de notas
//   node render.mjs --video saida.mp4 [--scale 0.5]   vídeo sem áudio, H.264 yuv420p CRF 16, 60 q/s (4 páginas em paralelo)
//   node render.mjs --video saida.mov --alpha         ProRes 4444 com canal alfa (fundo transparente)
//   node render.mjs --mux video.mp4 audio.wav saida.mp4   junta imagem e som (AAC 320k, +faststart)
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const FPS = 60;
const ALPHA = process.argv.includes('--alpha');
const si = process.argv.indexOf('--scale'), SCALE = si > 0 ? Number(process.argv[si + 1]) : 1;
const args = process.argv.slice(2).filter((a, i, A) => a !== '--alpha' && a !== '--scale' && A[i - 1] !== '--scale');
const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
async function page() {
  const p = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', (e) => { console.error('ERRO NA PÁGINA:', e.message); process.exitCode = 1; });
  p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.error('console:', m.text()); });
  await p.goto('file://' + path.resolve('index.html') + (ALPHA ? '?alpha=1' : '')); await p.evaluate(() => window.ready);
  return p;
}
const buf = (u) => Buffer.from(u.split(',')[1], 'base64');
async function grab(p, t) { await p.evaluate((t) => window.seek(t), t); return buf(await p.evaluate(() => window.png())); }
function sheet(files, labels, out, cols) {
  const a = ['-loglevel', 'error', '-y']; files.forEach((f) => a.push('-i', f));
  const rows = Math.ceil(files.length / cols), pad = rows * cols - files.length;
  const v = files.map((_, i) => `[${i}]scale=270:-1,drawtext=fontfile=tools/Inter-Bold.otf:text='${labels[i]}':x=8:y=8:fontsize=20:fontcolor=white:box=1:boxcolor=black@0.6[v${i}]`);
  for (let k = 0; k < pad; k++) v.push(`color=black:s=270x480:d=1[p${k}]`);
  const all = [...files.map((_, i) => `[v${i}]`), ...Array.from({ length: pad }, (_, k) => `[p${k}]`)];
  const xs = []; for (let r = 0; r < rows; r++) xs.push(cols > 1 ? `${all.slice(r * cols, r * cols + cols).join('')}hstack=${cols}[r${r}]` : `${all[r]}null[r${r}]`);
  if (rows === 1) xs[0] = xs[0].replace(/\[r0\]$/, '');
  const last = rows > 1 ? `;${Array.from({ length: rows }, (_, r) => `[r${r}]`).join('')}vstack=${rows}` : '';
  a.push('-filter_complex', `${v.join(';')};${xs.join(';')}${last}`, '-frames:v', '1', out);
  execFileSync('ffmpeg', a);
}
function encoder(file) {
  const vf = SCALE !== 1 ? ['-vf', `scale=${Math.round(1080 * SCALE / 2) * 2}:${Math.round(1920 * SCALE / 2) * 2}:flags=lanczos`] : [];
  const codec = ALPHA ? ['-c:v', 'prores_ks', '-profile:v', '4444', '-pix_fmt', 'yuva444p10le', '-alpha_bits', '16', '-vendor', 'apl0']
    : ['-c:v', 'libx264', '-crf', '16', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709'];
  const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-', ...vf, ...codec, '-r', String(FPS), file], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg ' + c)))));
  return { write: (b) => new Promise((res) => { if (ff.stdin.write(b)) res(); else ff.stdin.once('drain', res); }), end: async () => { ff.stdin.end(); await done; } };
}
fs.mkdirSync('out', { recursive: true });
if (args[0] === '--frame') {
  const p = await page(); fs.writeFileSync(args[1], await grab(p, Number(args[2])));
} else if (args[0] === '--stills') {
  const [out, ...ts] = args.slice(1), p = await page(), files = [];
  for (const t of ts) { const f = `out/_s_${t}.png`; fs.writeFileSync(f, await grab(p, Number(t))); files.push(f); }
  sheet(files, ts.map((t) => t + 's'), out, Math.min(files.length, 6));
} else if (args[0] === '--sheet') {
  const out = args[1] || 'out/folha.png', p = await page(), info = await p.evaluate(() => window.info());
  const beats = JSON.parse(fs.readFileSync('audio/beats.json', 'utf8')).batidas.filter((b) => b < info.dur);
  const files = [];
  for (const b of beats) { const f = `out/_b_${b.toFixed(3)}.png`; fs.writeFileSync(f, await grab(p, b + 0.02)); files.push(f); }
  sheet(files, beats.map((b) => b.toFixed(2) + 's'), out, 6); console.log(out, files.length, 'batidas');
} else if (args[0] === '--video') {
  const out = args[1], p0 = await page(), info = await p0.evaluate(() => window.info());
  const n = Math.round(info.dur * FPS), NP = 4, per = Math.ceil(n / NP), t0 = Date.now(), ext = path.extname(out);
  const pages = [p0, ...(await Promise.all(Array.from({ length: NP - 1 }, page)))]; let done = 0;
  await Promise.all(pages.map(async (p, k) => {
    const x = k * per, y = Math.min(n, x + per); if (x >= y) return;
    const enc = encoder(`out/_part${k}${ext}`);
    for (let f = x; f < y; f++) { await enc.write(await grab(p, f / FPS)); if (++done % 60 === 0) console.log(`${done}/${n} quadros, ${((Date.now() - t0) / 1000).toFixed(0)} s`); }
    await enc.end();
  }));
  const parts = Array.from({ length: NP }, (_, k) => `out/_part${k}${ext}`).filter((f) => fs.existsSync(f));
  fs.writeFileSync('out/_lista.txt', parts.map((f) => `file '${path.resolve(f)}'`).join('\n'));
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', 'out/_lista.txt', '-c', 'copy', out]); parts.forEach((f) => fs.rmSync(f));
  console.log(`${out}: ${n} quadros em ${((Date.now() - t0) / 1000).toFixed(0)} s`);
} else if (args[0] === '--mux') {
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', args[1], '-i', args[2], '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '320k', '-ar', '48000', '-ac', '2', '-shortest', '-movflags', '+faststart', args[3]]);
  console.log('vídeo:', args[3]);
}
await browser.close();
