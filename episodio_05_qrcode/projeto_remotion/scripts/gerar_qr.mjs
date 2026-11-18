// Gera os QR Codes do episódio com a biblioteca node-qrcode (MIT) e exporta, para a animação,
// a matriz real, as regiões reservadas (padrões de função, formato, versão) e a ordem real de
// posicionamento dos bits de dados (zigue-zague da ISO/IEC 18004). Nada é desenhado à mão.
import QRCode from 'qrcode';
import fs from 'node:fs';

export const CODIGOS = {
  abertura: { texto: 'Olá! Esta mensagem estava escondida nos quadrados.', ec: 'M' },
  mensagem: { texto: 'Você descobriu a mensagem secreta! O extraordinário está nos detalhes.', ec: 'M' },
  demoH: { texto: 'Olá! Esta mensagem estava escondida nos quadrados.', ec: 'H' },   // cena 5: mesma mensagem, nível H
  link: { texto: 'https://example.com', ec: 'M' },                                  // cena 6: domínio reservado para exemplos (IANA)
};
// máscaras da ISO/IEC 18004 (i = linha, j = coluna)
const MASK = [(i, j) => (i + j) % 2 === 0, (i) => i % 2 === 0, (i, j) => j % 3 === 0, (i, j) => (i + j) % 3 === 0,
  (i, j) => (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0, (i, j) => ((i * j) % 2) + ((i * j) % 3) === 0,
  (i, j) => (((i * j) % 2) + ((i * j) % 3)) % 2 === 0, (i, j) => (((i + j) % 2) + ((i * j) % 3)) % 2 === 0];
// blocos de correção (ISO/IEC 18004, tabela 9) só para as combinações usadas
const BLOCOS = { '4-M': { blocos: 2, dados: 32, ec: 18 }, '5-M': { blocos: 2, dadosPorBloco: [43, 43], ec: 24 }, '6-H': { blocos: 4, dados: 15, ec: 28 }, '2-M': { blocos: 1, dados: 28, ec: 16 } };

function zigzag(size, reserved) {
  // percorre colunas em pares da direita para a esquerda, alternando subida/descida, pulando a coluna 6 (padrão de sincronismo)
  const ordem = []; let subindo = true;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let k = 0; k < size; k++) {
      const row = subindo ? size - 1 - k : k;
      for (const col of [right, right - 1]) if (!reserved[row * size + col]) ordem.push(row * size + col);
    }
    subindo = !subindo;
  }
  return ordem;
}

function tipoReservado(size, version, r, c) {
  // classifica as áreas reservadas para a animação (localização, separador, sincronismo, alinhamento, formato, versão)
  const inFinder = (r0, c0) => r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7;
  if (inFinder(0, 0) || inFinder(0, size - 7) || inFinder(size - 7, 0)) return 'localizador';
  const sep = (r <= 7 && c <= 7) || (r <= 7 && c >= size - 8) || (r >= size - 8 && c <= 7);
  if (sep && !(r === 8 || c === 8)) return 'separador';
  if (r === 6 || c === 6) return 'sincronismo';
  if ((r === 8 && (c <= 8 || c >= size - 8)) || (c === 8 && (r <= 8 || r >= size - 8))) return 'formato';
  if (version >= 7 && ((r < 6 && c >= size - 11 && c < size - 8) || (c < 6 && r >= size - 11 && r < size - 8))) return 'versao';
  return 'alinhamento';
}

const out = {};
for (const [nome, { texto, ec }] of Object.entries(CODIGOS)) {
  const qr = QRCode.create(texto, { errorCorrectionLevel: ec });
  const m = qr.modules, size = m.size;
  const data = Array.from(m.data, v => (v ? 1 : 0));
  const reserved = Array.from(m.reservedBit, v => (v ? 1 : 0));
  const tipos = data.map((_, i) => (reserved[i] ? tipoReservado(size, qr.version, Math.floor(i / size), i % size) : 'dados'));
  out[nome] = {
    texto, ec, version: qr.version, size, maskPattern: qr.maskPattern,
    segments: qr.segments.map(s => ({ mode: s.mode.id, length: s.getLength ? s.getLength() : undefined })),
    bytesUtf8: Buffer.byteLength(texto, 'utf8'),
    data, tipos, ordemDados: zigzag(size, reserved),
  };
  // bits reais lidos da matriz: módulo XOR máscara, na ordem de posicionamento
  const mk = MASK[qr.maskPattern];
  out[nome].bitsLidos = out[nome].ordemDados.map((i) => data[i] ^ (mk(Math.floor(i / size), i % size) ? 1 : 0));
  out[nome].blocos = BLOCOS[`${qr.version}-${ec}`] || null;
  console.log(`${nome}: versão ${qr.version} (${size}×${size}), EC ${ec}, máscara ${qr.maskPattern}, modo ${out[nome].segments.map(s => s.mode).join('+')}, ${out[nome].bytesUtf8} bytes UTF-8, ${out[nome].ordemDados.length} módulos de dados+correção`);
}
fs.writeFileSync('src/qr_dados.json', JSON.stringify(out));

// arquivos oficiais do código final: PNG grande (escala 24 px/módulo) e SVG, ambos com zona de silêncio de 4 módulos
const fin = CODIGOS.mensagem;
await QRCode.toFile('../qrcode_mensagem.png', fin.texto, { errorCorrectionLevel: fin.ec, margin: 4, scale: 24, color: { dark: '#090E1AFF', light: '#F5F7FCFF' } });
fs.writeFileSync('../qrcode_mensagem.svg', await QRCode.toString(fin.texto, { type: 'svg', errorCorrectionLevel: fin.ec, margin: 4, color: { dark: '#090E1AFF', light: '#F5F7FCFF' } }));
await QRCode.toFile('../ferramentas/qrcode_abertura.png', CODIGOS.abertura.texto, { errorCorrectionLevel: CODIGOS.abertura.ec, margin: 4, scale: 16 });
// conferência: lê as palavras de código da matriz, desfaz a intercalação dos blocos e confere o fluxo de dados inteiro
// (indicador de modo byte 0100 + comprimento em 8 bits + bytes UTF-8 do texto)
for (const [nome, o] of Object.entries(out)) {
  const B = o.blocos; const nb = B.blocos; const nd = B.dados ?? B.dadosPorBloco[0];
  const cws = []; for (let k = 0; k + 8 <= o.bitsLidos.length; k += 8) cws.push(parseInt(o.bitsLidos.slice(k, k + 8).join(''), 2));
  const blocos = Array.from({ length: nb }, () => []);
  for (let i = 0; i < nd * nb; i++) blocos[i % nb].push(cws[i]);
  const fluxo = blocos.flat().map((v) => v.toString(2).padStart(8, '0')).join('');
  const esperado = '0100' + o.bytesUtf8.toString(2).padStart(8, '0') + [...Buffer.from(o.texto, 'utf8')].map((v) => v.toString(2).padStart(8, '0')).join('');
  const ok = fluxo.startsWith(esperado);
  console.log(`${nome}: ${cws.length} palavras lidas, ${nb} bloco(s) × ${nd} de dados; fluxo de dados ${ok ? 'CONFERE' : 'NÃO CONFERE'} com modo+comprimento+${o.bytesUtf8} bytes`);
  if (!ok) process.exit(1);
  o.fluxoInicio = esperado.slice(0, 4 + 8 + 8 * 6);   // modo, comprimento e os 6 primeiros bytes, para a cena 2
  o.palavras = cws.length;
}
fs.writeFileSync('src/qr_dados.json', JSON.stringify(out));
console.log('ok: qrcode_mensagem.png / .svg, src/qr_dados.json');
