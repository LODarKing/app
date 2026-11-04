// Render (Playwright + Chromium; contrato window.seek(t) = quadro do instante t).
//   node render.mjs --frame saida.png T            um quadro
//   node render.mjs --stills saida.png T1 T2 ...   tira de quadros
//   node render.mjs --sheet [saida.png]            folha de contato: um quadro por batida (audio/beats.json)
//   node render.mjs --video saida.mp4 [t0 t1]      vídeo (H.264 yuv420p CRF 16); se existir audio/mix.wav, entra como AAC
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const TL = JSON.parse(fs.readFileSync('timeline.js', 'utf8').replace(/^const TL = /, '').replace(/;\s*$/, ''));
const FPS = TL.fps, args = process.argv.slice(2);
const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
async function page() {
  const p = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', (e) => { console.error('ERRO NA PÁGINA:', e.message); process.exitCode = 1; });
  p.on('console', (m) => { if (m.type() === 'error') console.error('console:', m.text()); });
  await p.goto('file://' + path.resolve('index.html')); await p.evaluate(() => window.ready);
  return p;
}
async function grab(p, t) { await p.evaluate((t) => window.seek(t), t); const u = await p.evaluate(() => window.png()); return Buffer.from(u.split(',')[1], 'base64'); }
function sheet(files, labels, out, cols) {
  const a = ['-loglevel', 'error', '-y']; files.forEach((f) => a.push('-i', f));
  const rows = Math.ceil(files.length / cols), pad = rows * cols - files.length;
  const v = files.map((_, i) => `[${i}]scale=270:-1,drawtext=fontfile=fonts/Inter-Bold.otf:text='${labels[i]}':x=8:y=8:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.6[v${i}]`);
  for (let k = 0; k < pad; k++) v.push(`color=black:s=270x480:d=1[p${k}]`);
  const all = [...files.map((_, i) => `[v${i}]`), ...Array.from({ length: pad }, (_, k) => `[p${k}]`)];
  const xs = []; for (let r = 0; r < rows; r++) xs.push(`${all.slice(r * cols, r * cols + cols).join('')}hstack=${cols}[r${r}]`);
  const last = rows > 1 ? `;${Array.from({ length: rows }, (_, r) => `[r${r}]`).join('')}vstack=${rows}` : '';
  let fc = `${v.join(';')};${xs.join(';')}${last}`; if (rows === 1) fc = fc.replace(/\[r0\]$/, '');
  a.push('-filter_complex', fc, '-frames:v', '1', out);
  execFileSync('ffmpeg', a);
}
fs.mkdirSync('out', { recursive: true });
if (args[0] === '--frame') {
  const p = await page(); fs.writeFileSync(args[1], await grab(p, Number(args[2])));
} else if (args[0] === '--stills') {
  const [out, ...ts] = args.slice(1), p = await page(), files = [];
  for (const t of ts) { const f = `out/_s_${t}.png`; fs.writeFileSync(f, await grab(p, Number(t))); files.push(f); }
  sheet(files, ts.map((t) => t + 's'), out, Math.min(files.length, 6));
} else if (args[0] === '--sheet') {
  const out = args[1] || 'out/folha_contato.png', sc = args[2] ? TL.scenes.find((s) => s.id === args[2]) : { t0: 0, dur: TL.dur };
  const beats = JSON.parse(fs.readFileSync('audio/beats.json', 'utf8')).beats.filter((b) => b >= sc.t0 && b < sc.t0 + sc.dur);
  const p = await page(), files = [];
  for (const b of beats) { const f = `out/_b_${b.toFixed(3)}.png`; fs.writeFileSync(f, await grab(p, b + 0.02)); files.push(f); }
  sheet(files, beats.map((b) => b.toFixed(2) + 's'), out, 8);
  console.log(out, beats.length, 'batidas');
} else if (args[0] === '--acertos') {
  const p = await page(); const ev = await p.evaluate(() => window.acertos());
  fs.writeFileSync('audio/acertos.json', JSON.stringify(ev, null, 1)); console.log('audio/acertos.json', ev.length, 'acertos');
} else if (args[0] === '--video') {
  const out = args[1], t0 = Number(args[2] || 0), t1 = Number(args[3] || TL.dur);
  const f0 = Math.round(t0 * FPS), f1 = Math.round(t1 * FPS), n = f1 - f0, NP = 4, per = Math.ceil(n / NP), tA = Date.now();
  const pages = await Promise.all(Array.from({ length: NP }, page)); let done = 0;
  await Promise.all(pages.map(async (p, k) => {
    const a = f0 + k * per, b = Math.min(f1, a + per); if (a >= b) return;
    const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-', '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', String(FPS), `out/_parte${k}.mp4`], { stdio: ['pipe', 'inherit', 'inherit'] });
    const fim = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg ' + c)))));
    for (let f = a; f < b; f++) { const buf = await grab(p, f / FPS); if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r)); if (++done % 60 === 0) console.log(`${done}/${n} quadros, ${((Date.now() - tA) / 1000).toFixed(0)} s`); }
    ff.stdin.end(); await fim;
  }));
  const parts = Array.from({ length: NP }, (_, k) => `out/_parte${k}.mp4`).filter((f) => fs.existsSync(f));
  fs.writeFileSync('out/_lista.txt', parts.map((f) => `file '${path.resolve(f)}'`).join('\n'));
  const temAudio = fs.existsSync('audio/mix.wav');
  const ff = ['-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', 'out/_lista.txt'];
  if (temAudio) ff.push('-ss', String(t0), '-t', String(t1 - t0), '-i', 'audio/mix.wav', '-map', '0:v', '-map', '1:a', '-af', `afade=t=out:st=${(t1 - t0 - 0.15).toFixed(3)}:d=0.15`, '-c:a', 'aac', '-b:a', '256k', '-ar', '48000');
  ff.push('-c:v', 'copy', '-movflags', '+faststart', '-shortest', out);
  execFileSync('ffmpeg', ff); parts.forEach((f) => fs.rmSync(f));
  console.log(`vídeo: ${out} (${n} quadros em ${((Date.now() - tA) / 1000).toFixed(0)} s${temAudio ? ', com áudio' : ', sem áudio'})`);
}
await browser.close();
