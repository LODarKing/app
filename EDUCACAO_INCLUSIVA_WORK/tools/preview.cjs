// Fast low-res motion preview: node tools/preview.cjs <page.html> <outdir> <fps> [t0] [t1]
const { chromium } = require('playwright');
const path = require('node:path'); const fs = require('node:fs');
const [,, page, out, fpsS, t0S, t1S] = process.argv;
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 0.3333 });
  await p.goto('file://' + path.resolve(page));
  await p.waitForFunction(() => window.__draw, null, { timeout: 30000 });
  await p.evaluate(() => document.fonts.ready);
  const fps = Number(fpsS), t0 = Number(t0S || 0), t1 = Number(t1S || 180);
  let i = 0;
  for (let t = t0; t < t1; t += 1 / fps, i++) {
    await p.evaluate((tt) => { window.__draw(tt); if (window.__timelines && window.__timelines.root) window.__timelines.root.seek(tt, false); }, t);
    await p.screenshot({ path: `${out}/f${String(i).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 80 });
  }
  await browser.close();
})();
