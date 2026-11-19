// Render da vinheta (Remotion). Cada quadro é função pura do tempo: o quadro f desenha o instante f/30 s
// (é o equivalente do contrato window.seek(t) do estúdio — o Remotion posiciona o tempo e captura).
//   node render.mjs --sheet [saida.png] [--oitavas]   um quadro por batida (ou por colcheia) numa folha de contato
//   node render.mjs --stills saida.png T1 T2 ...   tira de quadros nos instantes dados
//   node render.mjs --frame saida.png T               um quadro no instante T (s)
//   node render.mjs --capa                             entregaveis/capa-vinheta.png (+ guia e recorte 4:5)
//   node render.mjs --video                            entregaveis/*.mp4 (com e sem áudio) — H.264, yuv420p, CRF 16
//   node render.mjs --tudo                             capa + vídeos
import { bundle } from '@remotion/bundler';
import { openBrowser, renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const BROWSER = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const FONT = path.resolve('../FELINOS_EPISODIO/fonts/Inter-Bold.otf');
const T = JSON.parse(fs.readFileSync('src/timeline.json', 'utf8'));
const args = process.argv.slice(2);
const MIX = 'public/audio/vinheta_mix.wav';
fs.mkdirSync('out', { recursive: true }); fs.mkdirSync('entregaveis', { recursive: true });

const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const browser = await openBrowser('chrome', { browserExecutable: BROWSER });
const comp = (id, inputProps = { audio: false }) => selectComposition({ serveUrl, id, inputProps, puppeteerInstance: browser });
async function still(t, output) {
  const composition = await comp('Vinheta');
  await renderStill({ composition, serveUrl, output, frame: Math.min(composition.durationInFrames - 1, Math.round(t * T.fps)), inputProps: { audio: false }, puppeteerInstance: browser, overwrite: true });
}
function sheet(files, labels, out, cols) {
  const a = ['-loglevel', 'error', '-y']; files.forEach((f) => a.push('-i', f));
  const rows = Math.ceil(files.length / cols), pad = rows * cols - files.length;
  const v = files.map((_, i) => `[${i}]scale=270:-1,drawtext=fontfile=${FONT}:text='${labels[i]}':x=8:y=8:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.6[v${i}]`);
  for (let k = 0; k < pad; k++) v.push(`color=black:s=270x480:d=1[p${k}]`);
  const all = [...files.map((_, i) => `[v${i}]`), ...Array.from({ length: pad }, (_, k) => `[p${k}]`)];
  const xs = []; for (let r = 0; r < rows; r++) xs.push(`${all.slice(r * cols, r * cols + cols).join('')}hstack=${cols}[r${r}]`);
  const last = rows > 1 ? `;${Array.from({ length: rows }, (_, r) => `[r${r}]`).join('')}vstack=${rows}` : '';
  a.push('-filter_complex', `${v.join(';')};${xs.join(';')}${last}`.replace(/\[r0\]$/, ''), '-frames:v', '1', out);
  execFileSync('ffmpeg', a);
}

if (args[0] === '--sheet') {
  const out = args[1] && !args[1].startsWith('--') ? args[1] : 'out/folha_batidas.png';
  const step = args.includes('--oitavas') ? 30 / T.bpm : 60 / T.bpm;
  const ts = []; for (let x = 0; x < T.duracao - 1e-6; x += step) ts.push(+x.toFixed(3));
  const files = [];
  for (const x of ts) { const f = `out/_b_${x.toFixed(3)}.png`; await still(x + 0.034, f); files.push(f); }
  sheet(files, ts.map((x) => x.toFixed(2) + 's'), out, Math.min(files.length, args.includes('--oitavas') ? 9 : 9));
  console.log(out, files.length, 'quadros');
} else if (args[0] === '--stills') {
  const [out, ...ts] = args.slice(1), files = [];
  for (const x of ts) { const f = `out/_s_${x}.png`; await still(Number(x), f); files.push(f); }
  sheet(files, ts.map((x) => x + 's'), out, files.length); console.log(out);
} else if (args[0] === '--frame') {
  await still(Number(args[2]), args[1]); console.log(args[1]);
}
if (args[0] === '--capa' || args[0] === '--tudo') {
  const composition = await comp('Capa', {});
  const out = 'entregaveis/capa-vinheta.png';
  await renderStill({ composition, serveUrl, output: out, puppeteerInstance: browser, overwrite: true });
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', out, '-vf', 'crop=1080:1350:0:285', 'entregaveis/capa-vinheta_recorte4x5.png']);
  console.log(out);
}
if (args[0] === '--video' || args[0] === '--tudo') {
  const composition = await comp('Vinheta');
  const silent = 'entregaveis/vinheta-enquanto-isso-em-amontada-sem-audio.mp4';
  const t0 = Date.now();
  await renderMedia({ composition, serveUrl, codec: 'h264', crf: 16, pixelFormat: 'yuv420p', imageFormat: 'png', muted: true, outputLocation: silent, inputProps: { audio: false }, puppeteerInstance: browser, concurrency: 4, overwrite: true });
  console.log(silent, ((Date.now() - t0) / 1000).toFixed(0) + ' s');
  if (fs.existsSync(MIX)) {
    const out = 'entregaveis/vinheta-enquanto-isso-em-amontada.mp4';
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', silent, '-i', MIX, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '320k', '-ar', '48000', '-t', String(T.duracao), '-movflags', '+faststart', out]);
    console.log(out);
  } else console.log('sem mixagem em', MIX, '— rode python3 audio/sonic_logo.py');
}
await browser.close({ silent: true });
