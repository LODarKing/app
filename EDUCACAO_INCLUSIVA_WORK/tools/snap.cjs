// Usage: node tools/snap.mjs <page.html> <out_prefix> t1 t2 ...  -> PNG stills via the page's window.__draw(t)
const { chromium } = require('playwright');
const path = require('node:path');
const [,, page, out, ...ts] = process.argv;
(async () => {
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
const errs = [];
p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + path.resolve(page));
await p.waitForFunction(() => window.__draw, null, { timeout: 30000 }).catch(() => {});
if (errs.length) console.log('ERRORS:\n' + errs.join('\n'));
if (process.env.ONLY) await p.evaluate((v) => { window.__only = v; }, Number(process.env.ONLY));
if (process.env.VIEW) await p.evaluate((v) => window.__view(...v), process.env.VIEW.split(',').map(Number));
for (const t of ts) {
  const t0 = Date.now();
  await p.evaluate((tt) => { window.__draw(tt); if (window.__timelines && window.__timelines.root) window.__timelines.root.seek(tt, false); }, Number(t));
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: `${out}_${String(t).padStart(6, '0')}.png` });
  console.log('t=' + t, (Date.now() - t0) + 'ms');
}
await browser.close();
})();
