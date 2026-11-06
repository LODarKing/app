// Monta as páginas do kit: mapa ilustrado, cartões dos desbravadores, guia do monitor e placas dos pontos.
'use strict';
const D = DADOS, PT = D.pontos, PE = D.pernas;
const JAN = { x0: -23, x1: 116.5, y0: -35, y1: 115 };  // janela do mapa em metros (1:750 em 186 × 200 mm)
const MMM = 1000 / 750;                                // mm por metro no papel
const mx = (x) => (x - JAN.x0) * MMM, my = (y) => (JAN.y1 - y) * MMM;
const pg = (html) => { const d = document.createElement('div'); d.className = 'pg'; d.innerHTML = html; document.getElementById('paginas').appendChild(d); return d; };
const graus = (v) => String(v).padStart(3, '0') + '°';
const ROXO = '#8E24AA', LAR = '#F57C00', VERDE = '#1F5A3A';

// ícones SVG reutilizáveis
const icBussola = (x, y, s) => `<g transform="translate(${x},${y}) scale(${s})"><circle r="2.6" fill="#fff" stroke="${VERDE}" stroke-width="0.45"/><path d="M0,-2 L0.65,0 L-0.65,0Z" fill="#E53935"/><path d="M0,2 L0.65,0 L-0.65,0Z" fill="#9e9e9e"/><circle r="0.35" fill="#333"/></g>`;
const icPe = (x, y, s, rot = 0) => `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})" fill="#5B3A22"><ellipse cx="0" cy="0.6" rx="0.55" ry="1"/><ellipse cx="0" cy="-1.0" rx="0.45" ry="0.5"/><circle cx="-0.45" cy="-1.85" r="0.2"/><circle cx="-0.1" cy="-2.05" r="0.2"/><circle cx="0.25" cy="-2.0" r="0.18"/><circle cx="0.55" cy="-1.85" r="0.15"/></g>`;
const icPes = (x, y, s) => icPe(x - 0.7 * s, y + 0.5 * s, s * 0.9, -8) + icPe(x + 0.7 * s, y - 0.4 * s, s * 0.9, 8);
const icPrisma = (x, y, s) => `<g transform="translate(${x},${y}) scale(${s})"><line x1="-1.6" y1="-1.6" x2="-1.6" y2="3.2" stroke="#5a4636" stroke-width="0.35"/><rect x="-1.6" y="-1.6" width="3" height="3" fill="#fff" stroke="#333" stroke-width="0.2"/><path d="M1.4,-1.6 L1.4,1.4 L-1.6,1.4Z" fill="${LAR}"/></g>`;
const icMonitor = (x, y, s) => `<g transform="translate(${x},${y}) scale(${s})"><circle cx="0" cy="-2.2" r="1" fill="#8d5a3b"/><path d="M-1.4,-1 h2.8 l0.4,3 h-3.6z" fill="${LAR}"/><rect x="-1.1" y="2" width="0.8" height="1.8" fill="#37474f"/><rect x="0.3" y="2" width="0.8" height="1.8" fill="#37474f"/><path d="M-1.3,-0.2 h2.6" stroke="#ffeb3b" stroke-width="0.35"/></g>`;

function paginaMapa() {
  const p = pg(`
  <div class="topo"><img src="emblema_desbravadores_recortado.png">
    <div><h1>TRILHA DA <span>BÚSSOLA</span></h1><p>Ache os 10 pontos com a bússola e os seus passos · Icaraí, Amontada (CE)</p></div>
    <div class="selo">Especialidade<br>Mapa e Bússola<b>AR-021</b></div></div>
  <div class="moldura"><canvas width="${Math.round(186 * 300 / 25.4)}" height="${Math.round(200 * 300 / 25.4)}"></canvas><svg viewBox="0 0 186 200" id="sobre"></svg></div>
  <div class="rodape">
    <div class="caixa"><h3>Legenda</h3><svg viewBox="0 0 74 31" width="74mm" height="31mm" id="leg"></svg></div>
    <div class="caixa"><h3>Como usar a bússola</h3><div class="dica">
      <b>1.</b> Gire o limbo até o número do trecho (ex.: <b>89°</b>) ficar na seta de direção.<br>
      <b>2.</b> Segure a bússola reta e gire o corpo até a agulha entrar na seta do Norte.<br>
      <b>3.</b> Ande para onde a seta de direção aponta, <b>contando os passos</b>.<br>
      <b>4.</b> Achou a placa? Anote a <b>letra</b> no cartão. No fim, descubra a palavra secreta! <span style="color:#777">(1 passo ≈ 50 cm)</span></div>
      <svg viewBox="0 0 58 9" width="58mm" height="9mm" id="escala"></svg></div>
    <div class="caixa"><h3>Norte</h3><svg viewBox="0 0 38 34" width="31mm" height="28mm" id="rosa"></svg></div>
  </div>
  <div class="creditos">Rua: © colaboradores do OpenStreetMap (ODbL). Casas e quintais traçados sobre imagem aérea (aprox. ±2 m). Declinação magnética: modelo WMM-2025 (NOAA), ${Math.abs(D.declinacao).toFixed(0)}° Oeste em nov/2026. Escala 1:750.</div>`);
  MAPA.render(p.querySelector('canvas'), D, JAN);
  const s = p.querySelector('#sobre'); let h = '';
  // setas para fora do mapa
  h += `<g font-family="Poppins" font-weight="800" font-size="4.2" fill="${VERDE}">
    <g transform="translate(60,9)"><rect x="-21" y="-5" width="42" height="7.5" rx="3.7" fill="#fff" opacity="0.92"/><text text-anchor="middle" y="0.6">↑ Praia de Icaraí</text></g>
    <g transform="translate(162,15)"><rect x="-23" y="-5" width="46" height="7.5" rx="3.7" fill="#fff" opacity="0.92"/><text text-anchor="middle" y="0.6">Centro da vila →</text></g></g>`;
  // seta do Norte dentro do mapa
  h += `<g transform="translate(173,186)"><circle r="9" fill="#fff" opacity="0.93" stroke="${VERDE}" stroke-width="0.6"/><path d="M0,-7 L3,3 L0,1.2 L-3,3Z" fill="${VERDE}"/><text y="7.6" text-anchor="middle" font-family="Poppins" font-weight="900" font-size="4.2" fill="${VERDE}">N</text></g>`;
  // selos de cada trecho (rumo na bússola + passos), do lado de fora do caminho
  // posição de cada selo (mm), planejada para não encobrir pontos nem outros selos
  const SELO = [[60, 165], [79, 146], [102, 124], [126, 103], [151, 80], [172, 53], [124, 44], [100, 66], [74, 90], [46, 112], [20, 132]];
  PE.forEach((q, i) => {
    const [X, Y] = SELO[i], alvo = PT[i + 1].nome === 'CHEGADA' ? 'chegada' : 'até o ' + PT[i + 1].nome;
    h += `<g transform="translate(${X},${Y})"><rect x="-12" y="-7.3" width="24" height="14.6" rx="3" fill="#fff" stroke="${ROXO}" stroke-width="0.7"/>
      <text x="0" y="-3.4" text-anchor="middle" font-family="Poppins" font-weight="700" font-size="2.7" fill="${ROXO}">${alvo}</text>
      ${icBussola(-7.4, 1.1, 1.05)}<text x="2.2" y="2.6" text-anchor="middle" font-family="Poppins" font-weight="900" font-size="6.2" fill="#1B2A22">${q.az_magnetico}°</text>
      ${icPes(-6.6, 5.0, 0.75)}<text x="2.2" y="5.9" text-anchor="middle" font-family="Poppins" font-weight="700" font-size="2.9" fill="#5B3A22">${q.passos} passos</text></g>`;
  });
  // travessia
  h += `<g transform="translate(118,26.5)"><rect x="-8" y="-6.5" width="34" height="11.5" rx="3" fill="#fff" opacity="0.93"/>${icMonitor(-3.5, -0.5, 1.1)}<g font-family="Caveat" font-weight="700" font-size="5" fill="#C62828"><text x="0" y="-1.6">atravesse com</text><text x="0" y="3">o monitor!</text></g></g>`;
  // largada e chegada
  { const X = mx(0), Y = my(0);
    h += `<g transform="translate(${X},${Y})"><circle r="6.2" fill="none" stroke="${ROXO}" stroke-width="0.9"/><circle r="4.4" fill="none" stroke="${ROXO}" stroke-width="0.9"/><path d="M0,-4.3 L3.8,2.3 L-3.8,2.3Z" fill="${ROXO}" stroke="#fff" stroke-width="0.4"/></g>
      <g transform="translate(${X - 4},${Y + 18})"><rect x="-21" y="-5" width="42" height="9.5" rx="2.5" fill="${ROXO}"/><text text-anchor="middle" y="1.4" font-family="Poppins" font-weight="900" font-size="4" fill="#fff">LARGADA E CHEGADA</text></g>
      <line x1="${X - 1}" y1="${Y + 6.2}" x2="${X - 3}" y2="${Y + 13}" stroke="${ROXO}" stroke-width="0.7"/>`; }
  // pontos de controle
  PT.slice(1, -1).forEach((q) => {
    const X = mx(q.x), Y = my(q.y);
    h += `${icPrisma(X + 5.2, Y - 4.4, 0.95)}<circle cx="${X}" cy="${Y}" r="4.2" fill="#fff" stroke="${ROXO}" stroke-width="1.1"/><text x="${X}" y="${Y + 1.85}" text-anchor="middle" font-family="Poppins" font-weight="900" font-size="5.4" fill="${ROXO}">${q.nome}</text>`;
  });
  s.innerHTML = h;
  // legenda
  const lg = p.querySelector('#leg'); let l = '';
  const item = (col, row, icone, texto) => { const x = col * 38, y = row * 6 + 3.4; l += `<g transform="translate(${x + 3},${y})">${icone}</g><text x="${x + 7.5}" y="${y + 1.2}" font-family="Inter" font-weight="600" font-size="2.55">${texto}</text>`; };
  item(0, 0, `<path d="M0,-2.2 L2,1.4 L-2,1.4Z" fill="${ROXO}"/>`, 'Largada e chegada');
  item(0, 1, `<circle r="2.1" fill="#fff" stroke="${ROXO}" stroke-width="0.6"/><text y="0.95" text-anchor="middle" font-family="Poppins" font-weight="900" font-size="2.7" fill="${ROXO}">3</text>`, 'Ponto: ache a placa');
  item(0, 2, icPes(0, 0, 0.75), 'Pegadas: o caminho');
  item(0, 3, `<rect x="-2.6" y="-1.6" width="5.2" height="3.2" rx="0.6" fill="#fff" stroke="${ROXO}" stroke-width="0.4"/><text y="0.8" text-anchor="middle" font-family="Poppins" font-weight="900" font-size="2" fill="#000">89°</text>`, 'Número da bússola');
  item(0, 4, `<rect x="-2.6" y="-1.3" width="5.2" height="2.6" fill="#EDE6D6" stroke="#CDBF9A" stroke-width="0.4"/><line x1="-2.4" y1="0" x2="2.4" y2="0" stroke="#F2C230" stroke-width="0.3" stroke-dasharray="0.8 0.6"/>`, 'Rua');
  item(1, 0, `<rect x="-2.3" y="-1.7" width="4.6" height="3.4" fill="#E2683A" stroke="#5A3424" stroke-width="0.3"/><line x1="-1" y1="0" x2="1" y2="0" stroke="#F08A5D" stroke-width="0.4"/>`, 'Casa (não entre!)');
  item(1, 1, `<circle r="1.9" fill="#3E7146"/><circle cx="-0.5" cy="-0.6" r="0.9" fill="#6C9A62"/>`, 'Árvores e mato');
  item(1, 2, `<g stroke="#56875A" stroke-width="0.45" stroke-linecap="round"><path d="M0,0 L2,-1.3 M0,0 L-2,-1 M0,0 L1.4,1.6 M0,0 L-1.5,1.5 M0,0 L0.2,-2.1"/></g>`, 'Coqueiro');
  item(1, 3, `<ellipse rx="2.6" ry="1.6" fill="#F1E3BE"/>`, 'Quintal de areia');
  item(1, 4, `<rect x="-2.6" y="-1.3" width="5.2" height="2.6" fill="#EDE6D6"/><g stroke="#fff" stroke-width="0.45"><line x1="-1.8" y1="-1.3" x2="-1.8" y2="1.3"/><line x1="-0.6" y1="-1.3" x2="-0.6" y2="1.3"/><line x1="0.6" y1="-1.3" x2="0.6" y2="1.3"/><line x1="1.8" y1="-1.3" x2="1.8" y2="1.3"/></g>`, 'Travessia c/ monitor');
  lg.innerHTML = l;
  // escala: 1 m = 1,333 mm; 30 m = 40 mm
  const e = p.querySelector('#escala'); let es = '';
  for (let k = 0; k < 3; k++) es += `<rect x="${6 + k * 13.333}" y="1.2" width="13.333" height="1.6" fill="${k % 2 ? '#fff' : '#1B2A22'}" stroke="#1B2A22" stroke-width="0.25"/>`;
  for (let k = 0; k <= 3; k++) es += `<text x="${6 + k * 13.333}" y="5.6" text-anchor="middle" font-family="Poppins" font-weight="700" font-size="2.5">${k * 10} m</text><text x="${6 + k * 13.333}" y="8.4" text-anchor="middle" font-family="Inter" font-weight="600" font-size="2" fill="#5B3A22">${k * 20} passos</text>`;
  e.innerHTML = es;
  // rosa: Norte verdadeiro (mapa) e Norte magnético (agulha)
  const r = p.querySelector('#rosa'), dec = D.declinacao, rad = (dec * Math.PI) / 180, cx = 19, cy = 19, L = 12;
  r.innerHTML = `<circle cx="${cx}" cy="${cy}" r="13" fill="#FBF3DF" stroke="#d8cfb8" stroke-width="0.4"/>
    <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - L}" stroke="${VERDE}" stroke-width="1"/><path d="M${cx},${cy - L - 2.6} l1.6,3 h-3.2z" fill="${VERDE}"/>
    <text x="${cx}" y="${cy - L - 3.4}" text-anchor="middle" font-family="Poppins" font-weight="900" font-size="3.4" fill="${VERDE}">N</text>
    <line x1="${cx}" y1="${cy}" x2="${cx + L * Math.sin(rad)}" y2="${cy - L * Math.cos(rad)}" stroke="#E53935" stroke-width="1" stroke-dasharray="1.4 0.8"/>
    <text x="${cx + (L + 1) * Math.sin(rad) - 1}" y="${cy - (L + 1) * Math.cos(rad) - 0.6}" text-anchor="end" font-family="Poppins" font-weight="800" font-size="2.7" fill="#E53935">agulha</text>
    <text x="${cx + 2}" y="${cy - 3}" font-family="Poppins" font-weight="800" font-size="2.6" fill="#1B2A22">${Math.abs(dec).toFixed(0)}°</text>
    <text x="${cx}" y="${cy + 7.5}" text-anchor="middle" font-family="Inter" font-weight="600" font-size="2.2" fill="#333">os números do mapa</text>
    <text x="${cx}" y="${cy + 10.3}" text-anchor="middle" font-family="Inter" font-weight="600" font-size="2.2" fill="#333">já valem na bússola</text>`;
}

function paginaCartoes() {
  const linhas = PE.map((q) => `<tr><td class="n">${q.de === 'LARGADA' ? '▲' : q.de} → ${q.para === 'CHEGADA' ? '◎' : q.para}</td><td class="az">${q.az_magnetico}°</td><td>${Math.round(q.dist)} m</td><td>≈ ${q.passos}</td><td class="vazio"></td><td class="vazio"></td></tr>`).join('');
  const cartao = (top) => `<div class="cartao" style="top:${top}mm">
    <div class="cab"><img src="emblema_desbravadores_recortado.png"><div><h2>Cartão da Trilha da Bússola</h2><div style="font-size:8pt;font-weight:600">Icaraí · ${PE.length - 1} pontos · ${D.total_m} m</div></div>
    <div class="nome">Nome: <i></i><br><br>Unidade: <i style="width:50mm"></i></div></div>
    <table class="ct"><tr><th>Trecho</th><th>Número na<br>bússola</th><th>Distância</th><th>Passos<br>(passo 50 cm)</th><th>Meus<br>passos</th><th>Letra<br>da placa</th></tr>${linhas}</table>
    <div class="palavra">Palavra secreta: ${'<span></span>'.repeat(10)}</div>
    <div class="calib"><b>Meu passo:</b> em 10 metros eu dou ______ passos. Se for diferente de 20, faça: passos do trecho = metros × (meus passos em 10 m) ÷ 10.</div></div>`;
  pg(cartao(6) + '<div class="corte"></div>' + cartao(154.5));
}

function paginaGuia() {
  const t = PT.slice(1, -1).map((q, i) => { const pr = PE[i]; return `<tr><td><b>${q.nome}</b></td><td><b>${q.letra}</b></td><td>${pr.az_magnetico}°</td><td>${pr.az_verdadeiro}°</td><td>${pr.dist.toFixed(1)} m</td><td>${q.lat.toFixed(6)}</td><td>${q.lon.toFixed(6)}</td><td class="e">${q.desc}</td></tr>`; }).join('');
  const ult = PE[PE.length - 1];
  pg(`<div class="guia">
  <h2>Guia do Monitor · Trilha da Bússola</h2>
  <div style="font-weight:600">Especialidade de Mapa e Bússola (AR-021): "seguir uma pista usando mapa e bússola com pelo menos 10 pontos de controle". Local: rua em frente à coordenada ${D.largada.lat.toFixed(7)}, ${D.largada.lon.toFixed(7)} (Icaraí, Amontada-CE).</div>
  <div class="duas" style="margin-top:2mm">
  <div><h3>Resumo</h3><ul>
    <li><b>${PE.length - 1} pontos</b>, percurso total de <b>${D.total_m} m</b> (trechos de ${Math.min(...PE.map((q) => Math.round(q.dist)))} a ${Math.max(...PE.map((q) => Math.round(q.dist)))} m).</li>
    <li>Tempo: 30 a 45 min por equipe. Equipes de 2 ou 3 crianças, saindo de 5 em 5 minutos.</li>
    <li>Ida pelo lado <b>sudeste</b> da rua (pontos 1 a 5), uma travessia na curva (5 → 6) e volta pelo lado <b>noroeste</b> (6 a 10).</li>
    <li>Material: bússolas, trena de 30 m, 11 placas (páginas 4 a 9), estacas ou barbante, cartões, lápis, coletes, apito, água e boné.</li></ul></div>
  <div><h3>Segurança</h3><ul>
    <li>É uma rua com moradores: <b>um monitor na largada, um na travessia (curva) e um no fim da pista</b>. Use coletes.</li>
    <li>As placas ficam na beira da rua, <b>nunca dentro de quintais</b>. Avise os vizinhos antes.</li>
    <li>Prefira o começo da manhã ou o fim da tarde (sol forte no Ceará). Leve água.</li>
    <li>A bússola erra perto de carros, motos e portões de ferro: fique a 1 m deles para ler.</li></ul></div></div>
  <h3>Como montar a pista (30 min antes)</h3><ol>
    <li>Fique na largada. Para cada ponto, aponte a bússola no <b>número da tabela</b> (coluna "bússola"), meça a <b>distância com a trena</b> nessa direção e fixe a placa. Depois repita a partir dessa placa até o próximo ponto.</li>
    <li>Confira com o celular (Google Maps ou outro): as coordenadas abaixo devem bater com uma diferença de até 5 m. Se um ponto cair em lugar ruim (poça, carro parado, portão), mude 1 ou 2 m para a beira da rua e siga em frente.</li>
    <li>Marque uma <b>pista de 10 m</b> perto da largada para cada criança contar os seus passos (placa "aferição").</li></ol>
  <h3>Gabarito dos pontos</h3>
  <table class="gab"><tr><th>Ponto</th><th>Letra</th><th>Bússola</th><th>Rumo verdadeiro</th><th>Distância do ponto anterior</th><th>Latitude</th><th>Longitude</th><th>Onde fica</th></tr>${t}
  <tr><td><b>Chegada</b></td><td>–</td><td>${ult.az_magnetico}°</td><td>${ult.az_verdadeiro}°</td><td>${ult.dist.toFixed(1)} m</td><td colspan="3" class="e">volta à largada (mesmo ponto)</td></tr></table>
  <div class="duas" style="margin-top:2mm">
  <div><h3>Bússola e declinação</h3>
  Em Icaraí a agulha aponta <b>${Math.abs(D.declinacao).toFixed(0)}° a oeste</b> do Norte verdadeiro (modelo WMM-2025, nov/2026). Os números do mapa e do cartão <b>já estão corrigidos</b>: a criança só gira o limbo até o número e segue.<br>
  Rumo verdadeiro = número da bússola − ${Math.abs(D.declinacao).toFixed(0)}°. Se a bússola tiver ajuste de declinação, deixe em <b>0°</b>.</div>
  <div><h3>Respostas</h3>
  Palavra secreta: <b style="font-family:Poppins;font-size:13pt;color:#8E24AA;letter-spacing:1pt">${PT.slice(1, -1).map((q) => q.letra).join('')}</b><br>
  Passos estimados para passo de 50 cm (criança de 9 a 12 anos). Na aferição, quem der 16 passos em 10 m faz ≈ 0,8 × os passos do cartão; quem der 24, ≈ 1,2 ×.
  <div class="aviso" style="margin-top:2mm">Lembre: completar esta trilha cumpre o requisito prático <b>com o seu instrutor</b>. O vídeo e o mapa são apoio.</div></div></div>
  <div style="position:absolute;bottom:0;font-size:6.4pt;color:#666">Fontes: rua do OpenStreetMap (© colaboradores, ODbL), traçado de casas sobre imagem aérea, declinação do World Magnetic Model 2025 (NOAA/BGS). Coordenadas em SIRGAS 2000 / WGS 84.</div>
  </div>`);
}

function placaSVG(num, letra, titulo) {
  return `<svg viewBox="0 0 190 128">
    <g transform="translate(14,18)"><rect width="88" height="88" fill="#fff" stroke="#222" stroke-width="1.2"/><path d="M88,0 L88,88 L0,88Z" fill="${LAR}"/>
      <circle cx="30" cy="30" r="22" fill="#fff" stroke="${ROXO}" stroke-width="3"/><text x="30" y="${num.length > 2 ? 35 : 40}" text-anchor="middle" font-family="Poppins" font-weight="900" font-size="${num.length > 2 ? 13 : 29}" fill="${ROXO}">${num}</text></g>
    <text x="112" y="34" font-family="Poppins" font-weight="900" font-size="15" fill="${VERDE}">${titulo}</text>
    ${letra ? `<text x="112" y="50" font-family="Poppins" font-weight="700" font-size="7" fill="#555">Anote a letra:</text>
    <rect x="112" y="55" width="50" height="50" rx="6" fill="#FBF3DF" stroke="${VERDE}" stroke-width="1.5"/>
    <text x="137" y="96" text-anchor="middle" font-family="Poppins" font-weight="900" font-size="44" fill="#1B2A22">${letra}</text>` : ''}
    <text x="95" y="122" text-anchor="middle" font-family="Inter" font-weight="600" font-size="4.2" fill="#777">Trilha da Bússola · Desbravadores · Especialidade de Mapa e Bússola (AR-021)</text></svg>`;
}
function paginasPlacas() {
  const pl = PT.slice(1, -1).map((q) => placaSVG(q.nome, q.letra, 'PONTO ' + q.nome));
  pl.push(`<svg viewBox="0 0 190 128"><g transform="translate(14,18)"><rect width="88" height="88" fill="#fff" stroke="#222" stroke-width="1.2"/><path d="M88,0 L88,88 L0,88Z" fill="${LAR}"/>
    <path d="M44,14 L76,70 L12,70Z" fill="${ROXO}" stroke="#fff" stroke-width="2"/></g>
    <text x="110" y="40" font-family="Poppins" font-weight="900" font-size="13" fill="${VERDE}">LARGADA</text><text x="110" y="56" font-family="Poppins" font-weight="900" font-size="13" fill="${VERDE}">E CHEGADA</text>
    <text x="112" y="74" font-family="Inter" font-weight="700" font-size="5.6" fill="#333">Pegue o cartão, a bússola</text><text x="112" y="82" font-family="Inter" font-weight="700" font-size="5.6" fill="#333">e conte os seus passos!</text>
    <text x="95" y="122" text-anchor="middle" font-family="Inter" font-weight="600" font-size="4.2" fill="#777">Trilha da Bússola · Desbravadores · Especialidade de Mapa e Bússola (AR-021)</text></svg>`);
  pl.push(`<svg viewBox="0 0 190 128"><rect x="14" y="18" width="162" height="70" rx="8" fill="#FBF3DF" stroke="${VERDE}" stroke-width="1.5"/>
    <text x="95" y="44" text-anchor="middle" font-family="Poppins" font-weight="900" font-size="15" fill="${VERDE}">AFERIÇÃO DO PASSO</text>
    <text x="95" y="62" text-anchor="middle" font-family="Poppins" font-weight="800" font-size="9" fill="#1B2A22">10 metros: daqui até a outra placa</text>
    <text x="95" y="78" text-anchor="middle" font-family="Inter" font-weight="700" font-size="6" fill="#333">Ande normal e conte. Quantos passos você deu?</text>
    ${[0, 1, 2, 3, 4, 5].map((k) => `<g transform="translate(${40 + k * 22},104) rotate(90)">${icPe(0, 0, 3.2, 0)}</g>`).join('')}
    <text x="95" y="122" text-anchor="middle" font-family="Inter" font-weight="600" font-size="4.2" fill="#777">Imprima 2 vezes: uma no começo e outra no fim dos 10 m</text></svg>`);
  for (let i = 0; i < pl.length; i += 2) pg(`<div class="placa" style="top:8mm">${pl[i]}</div><div class="corte"></div><div class="placa" style="top:160.5mm">${pl[i + 1] || ''}</div>`);
}

paginaMapa(); paginaCartoes(); paginaGuia(); paginasPlacas();
window.pronto = document.fonts.ready.then(() => true);
