// node tools/svg2png.cjs in.svg out.png [scale]
const { chromium } = require('playwright'); const path = require('node:path'); const fs = require('node:fs');
const [,, inp, out, sc = '1'] = process.argv;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ deviceScaleFactor: Number(sc) });
  const svg = fs.readFileSync(inp, 'utf8'); const m = svg.match(/width="(\d+)" height="(\d+)"/);
  await p.setViewportSize({ width: Number(m[1]), height: Number(m[2]) });
  await p.setContent(`<html><body style="margin:0">${svg}</body></html>`);
  await p.screenshot({ path: out }); await b.close();
})();
