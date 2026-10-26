// Renderiza vários quadros de uma composição com um único bundle e monta uma folha de contato.
// uso: node stills.mjs <composição> <saída.png> <segundos...>   (rodar a partir de FELINOS_WORK/remotion)
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
const [comp, out, ...secs] = process.argv.slice(2);
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const inputProps = { audio: false };
const composition = await selectComposition({ serveUrl, id: comp, inputProps, browserExecutable });
const files = [];
for (const s of secs) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(Number(s) * 60));
  const file = `out/st_${frame}.png`;
  await renderStill({ composition, serveUrl, output: file, frame, inputProps, browserExecutable });
  files.push(file);
}
const n = files.length, args = ['-loglevel', 'error', '-y'];
files.forEach((f) => args.push('-i', f));
args.push('-filter_complex', `${files.map((_, i) => `[${i}]scale=360:-1,drawtext=text='${secs[i]}s':x=10:y=10:fontsize=28:fontcolor=white:box=1:boxcolor=black@0.6[v${i}]`).join(';')};${files.map((_, i) => `[v${i}]`).join('')}hstack=${n}`, out);
execFileSync('ffmpeg', args);
console.log('ok', out);
