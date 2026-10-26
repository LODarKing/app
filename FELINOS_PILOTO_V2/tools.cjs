// Ferramentas do piloto: quadros de conferência, vistas de laboratório e render completo.
//   node tools.cjs still out/folha.png 0.5 2.6 5.4    -> quadros nos tempos dados + folha de contato
//   node tools.cjs lab out/lab.png pingo [t]          -> vista de laboratório
//   node tools.cjs render [inicio] [fim]              -> frames/f_00000.png ... (60 fps, 4 abas em paralelo)
const { chromium } = require('playwright');
const fs = require('node:fs'), path = require('node:path'), { execFileSync } = require('node:child_process');
(async () => {
const FPS = 60, DUR = 10.0;
const url = 'file://' + path.resolve('piloto.html');
const [cmd, ...args] = process.argv.slice(2);
const browser = await chromium.launch({ args: ['--disable-web-security', '--allow-file-access-from-files'] });
async function page() {
  const p = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', (e) => console.error('ERRO NA PÁGINA:', e.message));
  p.on('console', (m) => { if (m.type() === 'error') console.error('console:', m.text()); });
  await p.goto(url); await p.evaluate(() => window.READY);
  return p;
}
const save = (file, data) => fs.writeFileSync(file, Buffer.from(data.split(',')[1], 'base64'));
function sheet(files, labels, out) {
  const a = ['-loglevel', 'error', '-y']; files.forEach((f) => a.push('-i', f));
  a.push('-filter_complex', `${files.map((_, i) => `[${i}]scale=360:-1,drawtext=text='${labels[i]}':x=10:y=10:fontsize=26:fontcolor=white:box=1:boxcolor=black@0.6[v${i}]`).join(';')};${files.map((_, i) => `[v${i}]`).join('')}hstack=${files.length}`, out);
  execFileSync('ffmpeg', a);
}
if (cmd === 'still') {
  const [out, ...ts] = args; const p = await page(); const files = [];
  for (const t of ts) { await p.evaluate((t) => window.draw(t), Number(t)); const f = `out/_st_${t}.png`; save(f, await p.evaluate(() => window.png())); files.push(f); }
  if (files.length > 1) sheet(files, ts.map((t) => t + 's'), out); else fs.copyFileSync(files[0], out);
} else if (cmd === 'lab') {
  const [out, view, t] = args; const p = await page();
  await p.evaluate(([v, t]) => window.lab(v, t), [view, Number(t || 0)]); save(out, await p.evaluate(() => window.png()));
} else if (cmd === 'render') {
  const a = Math.round(Number(args[0] || 0) * FPS), b = Math.round(Number(args[1] || DUR) * FPS);
  fs.mkdirSync('frames', { recursive: true });
  const N = 4, pages = await Promise.all(Array.from({ length: N }, page));
  let next = a, done = 0; const t0 = Date.now();
  await Promise.all(pages.map(async (p) => {
    while (next < b) {
      const f = next++;
      await p.evaluate((t) => window.draw(t), f / FPS);
      save(`frames/f_${String(f).padStart(5, '0')}.png`, await p.evaluate(() => window.png()));
      if (++done % 60 === 0) console.log(`${done}/${b - a} quadros, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    }
  }));
}
await browser.close();
console.log('ok');
})();
