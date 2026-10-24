// node tools/lookdev.cjs "<query>" out.png [t]  -> screenshot of hyperframes/lookdev/index.html?<query>
const { chromium } = require('playwright'); const path = require('node:path');
const [,, query, out, t = '0'] = process.argv;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1600, height: 1600 } });
  const errs = []; p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text()); });
  await p.goto('file://' + path.resolve('hyperframes/lookdev/index.html') + '?' + query);
  await p.waitForFunction(() => window.__draw, null, { timeout: 30000 }).catch(() => {});
  for (const tt of t.split(',')) {
    await p.evaluate((x) => window.__draw(x), Number(tt));
    const el = await p.$('#wrap');
    await el.screenshot({ path: t.includes(',') ? out.replace('.png', `_${tt}.png`) : out });
  }
  if (errs.length) console.log(errs.slice(0, 10).join('\n'));
  await b.close();
})();
