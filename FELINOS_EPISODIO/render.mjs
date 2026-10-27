// Render do episódio (Playwright + Chromium; contrato window.seek(t) = quadro do instante t).
//   node render.mjs --frame saida.png T                 um quadro (T = segundos globais ou "s05:3.2" = cena s05, tempo local 3,2)
//   node render.mjs --stills saida.png T1 T2 ...        tira de quadros
//   node render.mjs --sheet s05 [saida.png]             um quadro por batida da cena (folha de contato do CLAUDE.md)
//   node render.mjs --lab saida.png vista [t]           vistas de laboratório (personagens isolados)
//   node render.mjs --seg s05 [s07]                     renderiza as cenas (inclusive) em segmentos/s05.mp4 ... (sem áudio)
//   node render.mjs --final                             junta os segmentos + audio/mix.wav -> FELINOS_EPISODIO_COMPLETO.mp4
// Vídeo: H.264, yuv420p, CRF 16. Quadros vão direto para o codificador (sem PNG em disco).
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawn } from 'node:child_process';

const TL = JSON.parse(fs.readFileSync('timeline.js', 'utf8').replace(/^const TL = /, '').replace(/;\s*$/, ''));
const FPS = TL.fps, args = process.argv.slice(2);
const sceneOf = (id) => TL.scenes.find((s) => s.id === id);
const T = (x) => { const m = String(x).match(/^(s\d\d|cred):([\d.]+)$/); return m ? sceneOf(m[1]).t0 + Number(m[2]) : Number(x); };
const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
async function page() {
  const p = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', (e) => { console.error('ERRO NA PÁGINA:', e.message); process.exitCode = 1; });
  p.on('console', (m) => { if (m.type() === 'error') console.error('console:', m.text()); });
  await p.goto('file://' + path.resolve('index.html')); await p.evaluate(() => window.ready);
  return p;
}
const save = (file, url) => fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
async function grab(p, t) { await p.evaluate((t) => window.seek(t), t); const u = await p.evaluate(() => window.png()); return Buffer.from(u.split(',')[1], 'base64'); }
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
function encoder(file) {
  const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-', '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', String(FPS), file], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg ' + c)))));
  return { write: (buf) => new Promise((res) => { if (ff.stdin.write(buf)) res(); else ff.stdin.once('drain', res); }), end: async () => { ff.stdin.end(); await done; } };
}
fs.mkdirSync('out', { recursive: true });
if (args[0] === '--frame') {
  const p = await page(); fs.writeFileSync(args[1], await grab(p, T(args[2])));
} else if (args[0] === '--stills') {
  const [out, ...ts] = args.slice(1), p = await page(), files = [];
  for (const t of ts) { const f = `out/_s_${t.replace(':', '_')}.png`; fs.writeFileSync(f, await grab(p, T(t))); files.push(f); }
  sheet(files, ts.map((t) => t.replace(':', ' ')), out, Math.min(files.length, 6));
} else if (args[0] === '--sheet') {
  const sc = sceneOf(args[1]), out = args[2] || `out/folha_${args[1]}.png`;
  const grid = fs.existsSync('audio/beats.json') ? JSON.parse(fs.readFileSync('audio/beats.json', 'utf8')).beats : Array.from({ length: Math.ceil(TL.dur * 2) }, (_, i) => i * 0.5);
  const beats = grid.filter((b) => b >= sc.t0 && b < sc.t0 + sc.dur), p = await page(), files = [];
  for (const b of beats) { const f = `out/_b_${b.toFixed(3)}.png`; fs.writeFileSync(f, await grab(p, b + 0.02)); files.push(f); }
  sheet(files, beats.map((b) => (b - sc.t0).toFixed(2) + 's'), out, 8);
  console.log(out, beats.length, 'batidas');
} else if (args[0] === '--lab') {
  const p = await page(); await p.evaluate(([v, t]) => window.lab(v, t), [args[2], Number(args[3] || 0)]); save(args[1], await p.evaluate(() => window.png()));
} else if (args[0] === '--seg') {
  const i0 = TL.scenes.findIndex((s) => s.id === args[1]), i1 = args[2] ? TL.scenes.findIndex((s) => s.id === args[2]) : i0;
  fs.mkdirSync('segmentos', { recursive: true });
  const NP = 4, pages = await Promise.all(Array.from({ length: NP }, page));
  for (let si = i0; si <= i1; si++) {
    const sc = TL.scenes[si], f0 = Math.round(sc.t0 * FPS), f1 = Math.round((sc.t0 + sc.dur) * FPS), n = f1 - f0, per = Math.ceil(n / NP), t0 = Date.now();
    let done = 0;
    await Promise.all(pages.map(async (p, k) => {
      const a = f0 + k * per, b = Math.min(f1, a + per); if (a >= b) return;
      const enc = encoder(`segmentos/${sc.id}_${k}.mp4`);
      for (let f = a; f < b; f++) { await enc.write(await grab(p, f / FPS)); if (++done % 150 === 0) console.log(`${sc.id}: ${done}/${n} quadros, ${((Date.now() - t0) / 1000).toFixed(0)} s`); }
      await enc.end();
    }));
    const parts = Array.from({ length: NP }, (_, k) => `segmentos/${sc.id}_${k}.mp4`).filter((f) => fs.existsSync(f));
    fs.writeFileSync('segmentos/_lista.txt', parts.map((f) => `file '${path.resolve(f)}'`).join('\n'));
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', 'segmentos/_lista.txt', '-c', 'copy', `segmentos/${sc.id}.mp4`]);
    parts.forEach((f) => fs.rmSync(f));
    console.log(`segmento ${sc.id}.mp4: ${n} quadros em ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  }
} else if (args[0] === '--capa') {
  // --capa saida.png: capa do Instagram (1080×1920) + recorte 4:5 do perfil (saida_4x5.png)
  const p = await page(); await p.evaluate(() => window.capa()); save(args[1], await p.evaluate(() => window.png()));
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', args[1], '-vf', 'crop=1080:1350:0:285', args[1].replace(/\.png$/, '_4x5.png')]);
} else if (args[0] === '--part') {
  // --part sNN a b fps: refaz só o trecho [a, b) (tempo local da cena) a `fps` quadros/s (saída sempre a 30, quadros repetidos)
  // e emenda no segmento existente: [0, a) antigo + trecho novo + [b, fim) antigo
  const sc = sceneOf(args[1]), a = Number(args[2]), b = Math.min(Number(args[3]), sc.dur), fr = Number(args[4] || FPS), NP = 4, t0 = Date.now();
  const n = Math.round((b - a) * fr), per = Math.ceil(n / NP), pages = await Promise.all(Array.from({ length: NP }, page)); let done = 0;
  await Promise.all(pages.map(async (p, k) => {
    const f0 = k * per, f1 = Math.min(n, f0 + per); if (f0 >= f1) return;
    const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fr), '-c:v', 'png', '-i', '-', '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', String(FPS), `segmentos/_p${k}.mp4`], { stdio: ['pipe', 'inherit', 'inherit'] });
    const fin = new Promise((res) => ff.on('close', res));
    for (let f = f0; f < f1; f++) { const buf = await grab(p, sc.t0 + a + f / fr); if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r)); if (++done % 100 === 0) console.log(`${sc.id} trecho: ${done}/${n} quadros, ${((Date.now() - t0) / 1000).toFixed(0)} s`); }
    ff.stdin.end(); await fin;
  }));
  const parts = Array.from({ length: NP }, (_, k) => `segmentos/_p${k}.mp4`).filter((f) => fs.existsSync(f));
  fs.writeFileSync('segmentos/_lista.txt', parts.map((f) => `file '${path.resolve(f)}'`).join('\n'));
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', 'segmentos/_lista.txt', '-c', 'copy', 'segmentos/_novo.mp4']); parts.forEach((f) => fs.rmSync(f));
  const old = `segmentos/${sc.id}.mp4`, keepA = a > 0.001, keepB = b < sc.dur - 0.001, ins = [], fc = []; let k = 0;
  if (keepA) { ins.push('-i', old); fc.push(`[${k}:v]trim=0:${a},setpts=PTS-STARTPTS[v${k}]`); k++; }
  ins.push('-i', 'segmentos/_novo.mp4'); fc.push(`[${k}:v]setpts=PTS-STARTPTS[v${k}]`); k++;
  if (keepB) { ins.push('-i', old); fc.push(`[${k}:v]trim=${b}:${sc.dur},setpts=PTS-STARTPTS[v${k}]`); k++; }
  const cat = Array.from({ length: k }, (_, i) => `[v${i}]`).join('') + `concat=n=${k}:v=1:a=0[out]`;
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...ins, '-filter_complex', fc.join(';') + ';' + cat, '-map', '[out]', '-c:v', 'libx264', '-crf', '16', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-r', String(FPS), 'segmentos/_emenda.mp4']);
  fs.renameSync('segmentos/_emenda.mp4', old); fs.rmSync('segmentos/_novo.mp4');
  console.log(`${sc.id}: trecho ${a}–${b} s refeito (${n} quadros a ${fr} q/s) em ${((Date.now() - t0) / 1000).toFixed(0)} s`);
} else if (args[0] === '--final') {
  const segs = TL.scenes.map((s) => `segmentos/${s.id}.mp4`), miss = segs.filter((f) => !fs.existsSync(f));
  if (miss.length) { console.error('faltam segmentos:', miss.join(' ')); process.exit(1); }
  fs.writeFileSync('segmentos/_lista.txt', segs.map((f) => `file '${path.resolve(f)}'`).join('\n'));
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', 'segmentos/_lista.txt', '-i', 'audio/mix.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', 'FELINOS_EPISODIO_COMPLETO.mp4']);
  console.log('vídeo: FELINOS_EPISODIO_COMPLETO.mp4');
}
await browser.close();
