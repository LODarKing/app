// Render do episódio 07 (Remotion + FFmpeg). Contrato: cada quadro é função pura de t (frame/30) — sem estado entre quadros.
//   node render.mjs --sheet [saida.png] [composicao]   um quadro por batida medida (audio/beats.json) numa folha de contato
//   node render.mjs --frame saida.png T [composicao]   um quadro no instante T
//   node render.mjs --video saida.mp4 [composicao]     imagem muda, H.264 yuv420p CRF 16, 30 q/s
//   node render.mjs --mux video.mp4 audio.wav saida.mp4   junta imagem e som (AAC 48 kHz 256k, +faststart)
// Rode a partir de episodio_07_consciencia_negra/.
import path from 'node:path';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(path.resolve('remotion/package.json'));
const { bundle } = require('@remotion/bundler');
const { selectComposition, renderStill, renderMedia } = require('@remotion/renderer');
const CHROME = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const args = process.argv.slice(2);
fs.mkdirSync('out', { recursive: true });
async function prep(id) {
  const serveUrl = await bundle({ entryPoint: path.resolve('remotion/src/index.ts'), publicDir: path.resolve('remotion/public') });
  const composition = await selectComposition({ serveUrl, id, browserExecutable: CHROME });
  return { serveUrl, composition };
}
function sheet(files, labels, out, cols) {
  const a = ['-loglevel', 'error', '-y']; files.forEach((f) => a.push('-i', f));
  const rows = Math.ceil(files.length / cols), pad = rows * cols - files.length;
  const font = path.resolve('remotion/public/fonts/ibm-plex-mono-latin-600-normal.woff2');
  const v = files.map((_, i) => `[${i}]scale=270:-1,drawtext=fontfile=${font}:text='${labels[i]}':x=8:y=8:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.6[v${i}]`);
  for (let k = 0; k < pad; k++) v.push(`color=black:s=270x480:d=1[p${k}]`);
  const all = [...files.map((_, i) => `[v${i}]`), ...Array.from({ length: pad }, (_, k) => `[p${k}]`)];
  const xs = []; for (let r = 0; r < rows; r++) xs.push(`${all.slice(r * cols, r * cols + cols).join('')}hstack=${cols}[r${r}]`);
  const last = rows > 1 ? `;${Array.from({ length: rows }, (_, r) => `[r${r}]`).join('')}vstack=${rows}` : '';
  let fc = `${v.join(';')};${xs.join(';')}${last}`; if (rows === 1) fc = fc.replace(/\[r0\]$/, '');
  a.push('-filter_complex', fc, '-frames:v', '1', out);
  execFileSync('ffmpeg', a);
}
if (args[0] === '--sheet' || args[0] === '--frame') {
  const id = (args[0] === '--sheet' ? args[2] : args[3]) || 'Piloto';
  const { serveUrl, composition } = await prep(id);
  const ts = args[0] === '--frame' ? [Number(args[2])] : JSON.parse(fs.readFileSync('audio/beats.json', 'utf8')).batidas.filter((x) => x * 30 < composition.durationInFrames);
  const files = [];
  for (const t of ts) {
    const f = args[0] === '--frame' ? args[1] : `out/_b_${t.toFixed(3)}.png`;
    await renderStill({ composition, serveUrl, output: path.resolve(f), frame: Math.min(composition.durationInFrames - 1, Math.round(t * 30) + 1), browserExecutable: CHROME, imageFormat: 'png' });
    files.push(f);
  }
  if (args[0] === '--sheet') { const out = args[1] || 'out/folha.png'; sheet(files, ts.map((t) => t.toFixed(2) + 's'), out, 6); console.log(out, files.length, 'batidas'); }
} else if (args[0] === '--video') {
  const { serveUrl, composition } = await prep(args[2] || 'Piloto'); const t0 = Date.now();
  await renderMedia({ composition, serveUrl, codec: 'h264', crf: 16, pixelFormat: 'yuv420p', x264Preset: 'medium', muted: true, outputLocation: path.resolve(args[1]), browserExecutable: CHROME, concurrency: 4, imageFormat: 'png',
    onProgress: ({ renderedFrames }) => { if (renderedFrames % 60 === 0) console.log(renderedFrames, 'quadros', ((Date.now() - t0) / 1000).toFixed(0) + 's'); } });
  console.log('vídeo:', args[1]);
} else if (args[0] === '--mux') {
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', args[1], '-i', args[2], '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-ar', '48000', '-b:a', '256k', '-shortest', '-movflags', '+faststart', args[3]]);
  console.log('vídeo:', args[3]);
}
