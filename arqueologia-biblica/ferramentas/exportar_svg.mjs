// Exporta os vetores originais (src/vetores.js) como arquivos .svg editáveis em assets/vetores/.
// Cada peça mantém a origem no seu pivô (o viewBox é centrado no pivô). Uso: node ferramentas/exportar_svg.mjs
import fs from 'node:fs'; import vm from 'node:vm';
const ctx = { String, Array, Math }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync('src/config.js', 'utf8') + '\n' + fs.readFileSync('src/vetores.js', 'utf8') + '\nthis.VET = VET; this.CFG = CFG;', ctx);
const { VET, CFG } = ctx, C = CFG.cor;
const cores = { estela: C.basalto, tronco: C.pele, saiote: C.linho, saioteAba: C.linho, rosto: C.pele, peruca: C.cabelo, olho: '#F6F0E2', orelha: C.pele, maoAponta: C.pele, polegar: C.pele, maoFechada: C.pele, pe: C.pele, lupaAro: C.bronze, lupaCabo: C.terracota, lupaVirola: C.bronze, pincelCabo: C.ocre, pincelVirola: C.bronze, cartucho: 'none', cartuchoBarra: C.terracota };
fs.mkdirSync('assets/vetores', { recursive: true });
const svg = (d, fill, vb = '-400 -400 800 800') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"><path d="${d}" fill="${fill}" stroke="${C.tinta}" stroke-width="4" stroke-linejoin="round"/></svg>\n`;
let n = 0;
for (const [k, d] of Object.entries(VET)) {
  if (Array.isArray(d)) { fs.writeFileSync(`assets/vetores/${k}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-400 -400 800 800">${d.map((p) => `<path d="${p}" fill="rgba(15,15,18,0.45)"/>`).join('')}</svg>\n`); n++; continue; }
  fs.writeFileSync(`assets/vetores/${k}.svg`, svg(d, cores[k] || C.papiro)); n++;
}
// personagem montado (vista de referência das peças nos pivôs, pose neutra)
const p = (d, f, x, y) => `<path transform="translate(${x} ${y})" d="${d}" fill="${f}" stroke="${C.tinta}" stroke-width="3.6" stroke-linejoin="round"/>`;
fs.writeFileSync('assets/vetores/personagem_egipcio_montado.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-200 -860 460 900">${p(VET.saiote, C.linho, 0, -486)}${p(VET.tronco, C.pele, 0, -486)}${p(VET.rosto, C.pele, 1, -708)}${p(VET.peruca, C.cabelo, 1, -708)}${p(VET.olho, '#F6F0E2', 1, -708)}${p(VET.pe, C.pele, 74, -24)}${p(VET.pe, C.pele, -58, -24)}</svg>\n`);
console.log(n + 1, 'arquivos .svg em assets/vetores/');
