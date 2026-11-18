// Render do piloto/episódio: Remotion (H.264 yuv420p, CRF 16, sem áudio) + FFmpeg (mux AAC 48 kHz).
// Uso:  node render.mjs [Piloto]            -> ../piloto_10s.mp4
//       node render.mjs Piloto folha        -> out/folha/*.jpeg  (1 quadro por batida, para a folha de contato)
import { bundle } from '@remotion/bundler';
import { renderMedia, renderFrames, selectComposition } from '@remotion/renderer';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const id = process.argv[2] || 'Piloto';
const modo = process.argv[3] || 'video';
const SAIDA = { Piloto: { mp4: '../piloto_10s.mp4', wav: '../audio/piloto_mix.wav' } }[id];
fs.mkdirSync('out', { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const composition = await selectComposition({ serveUrl, id });
const chromiumOptions = { gl: 'swangle' };
if (modo === 'folha') {
  fs.rmSync('out/folha', { recursive: true, force: true }); fs.mkdirSync('out/folha', { recursive: true });
  await renderFrames({ composition, serveUrl, imageFormat: 'jpeg', jpegQuality: 88, outputDir: 'out/folha', everyNthFrame: 15, chromiumOptions, muted: true,
    onStart: () => {}, onFrameUpdate: () => {} });
  console.log('folha: out/folha');
} else {
  const mudo = `out/${id}_mudo.mp4`;
  await renderMedia({ composition, serveUrl, codec: 'h264', crf: 16, pixelFormat: 'yuv420p', muted: true, outputLocation: mudo, chromiumOptions,
    onProgress: ({ progress }) => process.stdout.write(`\r${(progress * 100).toFixed(0)}%`) });
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', mudo, '-i', SAIDA.wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
    '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-ac', '2', '-shortest', '-movflags', '+faststart', SAIDA.mp4]);
  console.log('\nok:', SAIDA.mp4);
}
