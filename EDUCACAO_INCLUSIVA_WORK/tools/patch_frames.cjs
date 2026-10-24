// Re-render a frame range at full resolution: node tools/patch_frames.cjs <page> <outdir> <n0> <n1> <subs on|off>
const { chromium } = require('playwright'); const path = require('node:path'); const fs = require('node:fs');
const [,, page, out, n0, n1, subs] = process.argv;
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + path.resolve(page));
  await p.waitForFunction(() => window.__draw); await p.evaluate(() => document.fonts.ready);
  if (subs === 'off') await p.evaluate(() => { document.getElementById('subs').style.display = 'none'; });
  for (let n = Number(n0); n <= Number(n1); n++) {
    const t = n / 60;
    await p.evaluate((tt) => { window.__draw(tt); window.__timelines.root.seek(tt, false); }, t);
    await p.screenshot({ path: `${out}/p${String(n).padStart(5, '0')}.png` });
  }
  await b.close();
})();
