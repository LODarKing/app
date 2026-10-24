const { chromium } = require('playwright'); const path = require('node:path');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + path.resolve(process.argv[2]));
  await p.waitForFunction(() => window.__draw); await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => { window.__view(2.4, 1.15, 1.18); window.__draw(176.9); });
  await p.screenshot({ path: process.argv[3] }); await b.close();
})();
