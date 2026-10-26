// Exporta as onomatopeias desenhadas pelas cenas (texto, tempo global) para o synth.py: node audio/onomatopeias.mjs
import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage();
await p.goto('file://' + process.cwd() + '/index.html'); await p.waitForTimeout(1500);
const r = await p.evaluate(() => { collectSfx(); return SFXW.map(([txt, t]) => [txt, +t.toFixed(2)]); });
(await import('fs')).writeFileSync('audio/onomatopeias.json', JSON.stringify(r)); console.log(r.length, 'onomatopeias'); await b.close();
