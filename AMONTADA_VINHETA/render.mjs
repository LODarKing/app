/**
 * Render da vinheta “Enquanto Isso em Amontada…”.
 *
 *   node render.mjs            → todos os entregáveis em output/
 *   node render.mjs --folha    → só a folha de contato (um quadro por batida e por acerto) em qa/
 *   node render.mjs --sem-alfa → entregáveis sem as versões ProRes 4444 com transparência
 *   node render.mjs --so-alfa  → só as versões ProRes 4444 com transparência
 *   node render.mjs --tira=10-24 → todos os quadros de um intervalo, para conferir movimento
 *
 * Vídeo: H.264, yuv420p, CRF 16, 30 fps, 1080×1920. Áudio: AAC 320 kb/s, 48 kHz, estéreo.
 */
import { bundle } from '@remotion/bundler';
import { openBrowser, renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, 'output');
const QA = path.join(ROOT, 'qa');
const CHROME = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const args = new Set(process.argv.slice(2));
const timeline = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/config/timeline.json'), 'utf8'));

const log = (...m) => console.log('›', ...m);
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(QA, { recursive: true });

const WAV = path.join(ROOT, 'public/audio/trilha-vinheta.wav');
if (!fs.existsSync(WAV)) {
  console.error('Falta public/audio/trilha-vinheta.wav — rode antes: python3 audio/gerar_trilha.py');
  process.exit(1);
}

log('Empacotando o projeto…');
const serveUrl = await bundle({ entryPoint: path.join(ROOT, 'src/index.ts'), publicDir: path.join(ROOT, 'public') });
const browser = await openBrowser('chrome', {
  browserExecutable: fs.existsSync(CHROME) ? CHROME : null,
  chromiumOptions: { gl: 'swangle' },
});
const common = { serveUrl, puppeteerInstance: browser, browserExecutable: fs.existsSync(CHROME) ? CHROME : null };

const comp = async (id, inputProps) => selectComposition({ ...common, id, inputProps });

const progresso = (nome) => {
  let last = -1;
  return ({ progress }) => {
    const p = Math.floor(progress * 10);
    if (p !== last) {
      last = p;
      process.stdout.write(`  ${nome} ${p * 10}%\r`);
    }
  };
};

/** Folha de contato: um quadro por batida e por acerto, com o número do quadro e o tempo. */
async function folha(intervalo = null, nomeFolha = 'folha-por-batida.png') {
  const beat = (60 / timeline.bpm) * timeline.fps;
  const batidas = [];
  for (let f = 0; f < timeline.durationInFrames; f += beat) batidas.push(Math.round(f));
  const acertos = Object.values(timeline.cues).map((b) => Math.round(b * beat));
  const extras = [13, 18, 24, 35, 42, 48, 56, 70, 88, 92, 95, 98, 101, 104];
  let quadros = [...new Set([...batidas, ...acertos, ...extras])];
  if (intervalo) {
    quadros = [];
    for (let f = intervalo[0]; f <= intervalo[1]; f++) quadros.push(f);
  }
  quadros = quadros.filter((f) => f >= 0 && f < timeline.durationInFrames).sort((a, b) => a - b);
  const props = { modo: 'completo', comAudio: false };
  const c = await comp('Vinheta', props);
  const dir = path.join(QA, 'quadros');
  fs.mkdirSync(dir, { recursive: true });
  const itens = [];
  for (const f of quadros) {
    const out = path.join(dir, `q${String(f).padStart(3, '0')}.png`);
    await renderStill({ ...common, composition: c, frame: f, output: out, inputProps: props, scale: 0.25 });
    const nomes = Object.entries(timeline.cues)
      .filter(([, b]) => Math.round(b * beat) === f)
      .map(([n]) => n);
    const ehBatida = batidas.includes(f);
    itens.push({ f, out, rotulo: `${f} · ${(f / timeline.fps).toFixed(2)} s${ehBatida ? ' · BATIDA' : ''}${nomes.length ? ' · ' + nomes.join(', ') : ''}` });
  }
  // monta a folha com o Chromium (Playwright)
  // Playwright só para diagramar a folha; sem ele, os quadros ficam soltos em qa/quadros/
  let chromium;
  try {
    ({ chromium } = createRequire(import.meta.url)('playwright'));
  } catch {
    log('Playwright não encontrado: quadros soltos em qa/quadros/ (folha não montada).');
    return;
  }
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1920, height: 1200 } });
  const cols = 8;
  const html = `<body style="margin:0;background:#0b0f10;font:600 13px/1.2 sans-serif;color:#ddd">
  <div style="display:grid;grid-template-columns:repeat(${cols},232px);gap:8px;padding:10px">
  ${itens
    .map(
      (i) => `<div><img src="data:image/png;base64,${fs.readFileSync(i.out).toString('base64')}" style="width:232px;display:block"/>
      <div style="padding:4px 0 6px">${i.rotulo}</div></div>`,
    )
    .join('')}</div></body>`;
  await page.setContent(html);
  const el = await page.$('div');
  const sheet = path.join(QA, nomeFolha);
  await el.screenshot({ path: sheet });
  await b.close();
  log('Folha de contato:', path.relative(ROOT, sheet), `(${itens.length} quadros)`);
}

async function principal() {
  const h264 = { codec: 'h264', crf: 16, pixelFormat: 'yuv420p', imageFormat: 'png', x264Preset: 'slow' };

  log('MP4 com áudio…');
  let props = { modo: 'completo', comAudio: true };
  let c = await comp('Vinheta', props);
  await renderMedia({
    ...common,
    ...h264,
    composition: c,
    inputProps: props,
    audioCodec: 'aac',
    audioBitrate: '320k',
    outputLocation: path.join(OUT, 'enquanto-isso-em-amontada.mp4'),
    onProgress: progresso('com áudio'),
  });

  log('MP4 sem áudio…');
  props = { modo: 'completo', comAudio: false };
  c = await comp('Vinheta', props);
  await renderMedia({
    ...common,
    ...h264,
    composition: c,
    inputProps: props,
    muted: true,
    outputLocation: path.join(OUT, 'enquanto-isso-sem-audio.mp4'),
    onProgress: progresso('sem áudio'),
  });

  log(`Capa (quadro ${timeline.quadroCapa})…`);
  await renderStill({
    ...common,
    composition: c,
    frame: timeline.quadroCapa,
    inputProps: props,
    output: path.join(OUT, 'capa-vinheta.png'),
  });

  fs.copyFileSync(WAV, path.join(OUT, 'trilha-vinheta.wav'));
  log('Trilha copiada para output/trilha-vinheta.wav');

  if (!args.has('--sem-alfa')) await alfa();
}

async function alfa() {
  {
    for (const [id, nome] of [
      ['VinhetaAlfaElementos', 'enquanto-isso-alfa-elementos.mov'],
      ['VinhetaAlfaTransicao', 'enquanto-isso-alfa-transicao.mov'],
    ]) {
      log(`ProRes 4444 com transparência: ${nome}…`);
      try {
        const cp = await comp(id, {});
        await renderMedia({
          ...common,
          composition: cp,
          codec: 'prores',
          proResProfile: '4444',
          imageFormat: 'png',
          pixelFormat: 'yuva444p10le',
          muted: true,
          outputLocation: path.join(OUT, nome),
          onProgress: progresso(nome),
        });
      } catch (e) {
        // a versão opcional nunca derruba a entrega principal
        console.warn(`  (versão opcional ${nome} falhou: ${e.message})`);
      }
    }
  }
}

try {
  const tira = process.argv.find((a) => a.startsWith('--tira='));
  if (tira) {
    // --tira=10-24 → todos os quadros do intervalo, para conferir o movimento quadro a quadro
    const [a, b] = tira.slice(7).split('-').map(Number);
    await folha([a, b], `tira-${a}-${b}.png`);
  } else if (args.has('--folha')) await folha();
  else if (args.has('--so-alfa')) await alfa();
  else {
    await principal();
    await folha();
  }
} finally {
  await browser.close({ silent: true });
}
log('Pronto.');
