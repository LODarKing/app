// Render: node render.mjs <Composição> <saída.mp4> [quadros "a-b"] [--stills lista,de,quadros pasta]
// Vídeo H.264 yuv420p CRF 16 (contrato do estúdio). O áudio é mixado em Python e multiplexado depois (ffmpeg).
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const [, , comp = 'Piloto', out = 'out/piloto_video.mp4', ...rest] = process.argv;
const browserExecutable = fs.existsSync('/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell')
  ? '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' : undefined;
const chromiumOptions = { gl: 'swangle', enableMultiProcessOnLinux: true };
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const composition = await selectComposition({ serveUrl, id: comp, browserExecutable, chromiumOptions });
fs.mkdirSync(path.dirname(out), { recursive: true });

const si = rest.indexOf('--stills');
if (si >= 0) {
  const frames = rest[si + 1].split(',').map(Number);
  const dir = rest[si + 2] || 'out/stills';
  fs.mkdirSync(dir, { recursive: true });
  for (const f of frames) {
    await renderStill({ serveUrl, composition, frame: f, output: `${dir}/q${String(f).padStart(4, '0')}.png`, browserExecutable, chromiumOptions });
    process.stdout.write(`${f} `);
  }
  console.log('\nstills ok');
} else {
  const range = rest[0] && /^\d+-\d+$/.test(rest[0]) ? rest[0].split('-').map(Number) : null;
  await renderMedia({
    serveUrl, composition, codec: 'h264', crf: 16, pixelFormat: 'yuv420p', outputLocation: out,
    browserExecutable, chromiumOptions, frameRange: range, concurrency: 4, muted: true,
    onProgress: ({ progress }) => process.stdout.write(`\r${(progress * 100).toFixed(0)}%`),
  });
  console.log('\nvideo ok', out);
}
