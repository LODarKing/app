import React from 'react';
import { COR, FONTE, b, clamp, lerp, prog, easeInOut, easeOut, easeOut5, easeIn, mulberry32 } from '../tema';
import brasil from '../data/brasil.json';

/* CENA 01 — A PERGUNTA QUE INTRIGA (e começo da transição para 1971)
 * Tudo é função pura de t (segundos). Tempos: batidas medidas b(k) (audio/beats.json) casadas com a fala:
 *   b5  "vinte"        → o 20 de novembro vira dourado
 *   b8  "treze"        → anel branco no 13 de maio (Lei Áurea, 1888)
 *   b9…b10             → título "POR QUE 20 DE NOVEMBRO?" (teclas)
 *   b12 "muito antes"  → o calendário cai; o cartão 20 vai ao centro
 *   b13                → o cartão 20 vira a linha do tempo; o numeral "20" sobe e vira "2026"
 *   b14…b17            → recuo no tempo 2026 → 1971 (passa por 2024 em "feriado")
 *   b17 / b18          → pouso em 1971; a linha vira o contorno do Brasil; ponto de Porto Alegre
 */

const ANO = 2026;
const MESES = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
const SEM = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const C = 84;                 // lado da célula (unidades do plano)
const BW = 7 * C;             // largura do mês
const HEAD = 120;             // nome do mês + dias da semana
const BH = HEAD + 6 * C;      // altura do mês
const GY = 90;                // espaço entre meses
const P = 1700;               // distância focal da câmera

type Dia = { m: number; d: number; doy: number; x: number; y: number; dow: number };
const DIAS: Dia[] = [];
{
  let doy = 0;
  for (let m = 0; m < 12; m++) {
    const n = new Date(Date.UTC(ANO, m + 1, 0)).getUTCDate();
    const dow0 = new Date(Date.UTC(ANO, m, 1)).getUTCDay();
    for (let d = 1; d <= n; d++) {
      const k = dow0 + d - 1;
      DIAS.push({ m, d, doy: doy++, dow: k % 7, x: (k % 7) * C + C / 2, y: m * (BH + GY) + HEAD + Math.floor(k / 7) * C + C / 2 });
    }
  }
}
const dia = (m: number, d: number) => DIAS.find((x) => x.m === m && x.d === d)!;
const NOV20 = dia(10, 20), MAI13 = dia(4, 13);
const QUEDA = DIAS.map((_, i) => mulberry32(1000 + i)()); // atraso com semente para a queda das células

type Cam = { cx: number; cy: number; s: number; rx: number; rz: number; sy: number };
function proj(c: Cam, X: number, Y: number, Z = 0): [number, number] {
  const x = (X - c.cx) * c.s, y = (Y - c.cy) * c.s, z = Z * c.s;
  const cz = Math.cos(c.rz), sz = Math.sin(c.rz), cr = Math.cos(c.rx), sr = Math.sin(c.rx);
  const x1 = x * cz - y * sz, y1 = x * sz + y * cz;
  const y2 = y1 * cr - z * sr, dd = P - y1 * sr - z * cr, f = P / dd;
  return [540 + x1 * f, c.sy + y2 * f];
}
/** matriz afim local (aproximação exata de 1ª ordem da perspectiva) no ponto (X,Y,Z) do plano */
function mat(c: Cam, X: number, Y: number, Z = 0): number[] {
  const p0 = proj(c, X, Y, Z), px = proj(c, X + 1, Y, Z), py = proj(c, X, Y + 1, Z);
  return [px[0] - p0[0], px[1] - p0[1], py[0] - p0[0], py[1] - p0[1], p0[0], p0[1]];
}
/** fator de escala da perspectiva no ponto; <= 0 ou muito grande = atrás/colado na câmera (não desenhar) */
function escala(c: Cam, X: number, Y: number, Z = 0): number {
  const x = (X - c.cx) * c.s, y = (Y - c.cy) * c.s, z = Z * c.s;
  const y1 = x * Math.sin(c.rz) + y * Math.cos(c.rz);
  const dd = P - y1 * Math.sin(c.rx) - z * Math.cos(c.rx);
  return dd <= 0 ? -1 : P / dd;
}
const visivel = (c: Cam, X: number, Y: number, Z = 0) => { const f = escala(c, X, Y, Z); return f > 0 && f < 3.2; };
/** mistura de cores hex (para o numeral que sai do cartão: azul-escuro → dourado) */
function corMix(a: string, z: string, u: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), pz = [1, 3, 5].map((i) => parseInt(z.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(lerp(v, pz[i], u))).join(',')})`;
}
const mlerp = (A: number[], B: number[], u: number) => A.map((a, i) => lerp(a, B[i], u));
const M = (m: number[]) => `matrix(${m.map((v) => v.toFixed(4)).join(',')})`;
const rad = (g: number) => (g * Math.PI) / 180;

/* ---------- cursor do ano e câmera ---------- */
const T_GOLD = b(5), T_TREZE = b(8);
const cursorDoy = (t: number) => NOV20.doy * (1 - Math.pow(1 - prog(t, 0, T_GOLD), 2.2));
function cursorXY(t: number): [number, number] {
  const c = cursorDoy(t), i = Math.floor(c), u = c - i;
  const A = DIAS[i], B2 = DIAS[Math.min(i + 1, DIAS.length - 1)];
  return [lerp(A.x, B2.x, u), lerp(A.y, B2.y, u)];
}
function cam(t: number): Cam {
  // A: segue o cursor (média dos últimos 0,5 s, pura função de t) — 0 → b5
  let cx = 0, cy = 0;
  for (let j = 0; j < 10; j++) { const [x, y] = cursorXY(Math.max(0, t - j * 0.055)); cx += x; cy += y; }
  cx /= 10; cy /= 10;
  cx = lerp(BW / 2, cx, 0.55);
  const uA = prog(t, 0, T_GOLD);
  let s = lerp(1.3, 1.7, easeInOut(uA)), rx = lerp(56, 42, easeOut(uA)), rz = lerp(-11, -7, uA), sy = 930;
  // acomoda no 20 de novembro
  const uH = easeInOut(prog(t, T_GOLD - 0.5, T_GOLD + 0.4));
  cx = lerp(cx, NOV20.x, uH); cy = lerp(cy, NOV20.y, uH);
  s = lerp(s, lerp(2.25, 2.35, prog(t, T_GOLD, 4.3)), uH); rx = lerp(rx, 34, uH); sy = lerp(sy, 840, uH);
  // B: arco de volta ao 13 de maio (afasta no meio do caminho para mostrar o ano inteiro) — 4,30 → b8
  const uB = easeInOut(prog(t, 4.3, T_TREZE));
  cx = lerp(cx, MAI13.x, uB); cy = lerp(cy, MAI13.y, uB);
  s = lerp(s, 2.0, uB) * (1 - 0.7 * Math.sin(Math.PI * uB)); rx = lerp(rx, 38, uB); rz = lerp(rz, -5, uB); sy = lerp(sy, 860, uB);
  // C: o plano recua para o fundo enquanto os dois cartões sobem — b8+0,15 → b10
  const uC = easeInOut(prog(t, T_TREZE + 0.15, b(10)));
  cy = lerp(cy, MAI13.y + 2.2 * (BH + GY), uC); s = lerp(s, 0.9, uC); rx = lerp(rx, 62, uC); rz = lerp(rz, -9, uC); sy = lerp(sy, 1250, uC);
  // D: tudo afunda — b12 → b13
  const uD = easeIn(prog(t, b(12), b(13)));
  rx = lerp(rx, 72, uD); sy = lerp(sy, 1500, uD);
  return { cx, cy, s, rx: rad(rx), rz: rad(rz), sy };
}

/* ---------- linha do tempo ---------- */
const LY = 900;          // altura da linha
const PX = 72;           // px por ano
const DW = 118;          // largura de cada algarismo do contador
const CONT_Y = 690;      // linha de base do contador
// 2026 → 2024 (chega em "feriado", 9,44 s) · pausa lendo FERIADO NACIONAL · recua até 1971 em b17 ("mil novecentos e setenta e um")
const anoAt = (t: number) => {
  if (t < b(15.25)) return 2026 - 2 * easeInOut(prog(t, b(14), b(14.5)));
  return 2024 - 53 * easeInOut(prog(t, b(15.25), b(17)));
};
const MARCOS: Record<number, string> = { 2024: COR.dourado, 2011: COR.ciano, 1978: COR.ciano };

/* ---------- mapa ---------- */
const PTS = (brasil as { pontos: number[][] }).pontos.slice(0, -1);
const NPT = PTS.length;           // 600
const LAT0 = Math.cos(rad(-15)), K = 19.6, MCX = 540, MCY = 880, LONC = -54.4, LATC = -14.25;
const mapXY = (lo: number, la: number): [number, number] => [MCX + (lo - LONC) * LAT0 * K, MCY - (la - LATC) * K];
// reindexado: o centro da linha (índice NPT/2) é o litoral de Porto Alegre
const MAPA = Array.from({ length: NPT + 1 }, (_, i) => mapXY(...(PTS[(i + NPT / 2) % NPT] as [number, number])));
const POA = mapXY(-51.2177, -30.0346);

/* ---------- pequenos desenhos ---------- */
const typed = (s: string, t: number, t0: number, cps = 26) => s.slice(0, Math.max(0, Math.floor((t - t0) * cps)));

function Odometro({ v, x, y, size, cor }: { v: number; x: number; y: number; size: number; cor: string }) {
  // quatro algarismos; cada um rola quando o de baixo passa pela virada (igual a um contador mecânico)
  const H = size * 1.05;
  const dig = [3, 2, 1, 0].map((j) => {
    const p = Math.pow(10, j), base = Math.floor(v / p) % 10;
    const resto = v % p, frac = j === 0 ? v - Math.floor(v) : clamp(resto - (p - 1));
    return base + frac;
  });
  return (
    <g>
      {dig.map((d, i) => {
        const cx = x + (i - 1.5) * DW, lo = Math.floor(d), fr = clamp((d - lo - 0.5) * 3.2 + 0.5);
        return (
          <g key={i} clipPath="url(#odoclip)" transform={`translate(${cx},0)`}>
            {[lo, lo + 1].map((n, k) => (
              <text key={k} x={0} y={y + (k === 0 ? fr * H : (fr - 1) * H)} textAnchor="middle" fontFamily={FONTE.titulo} fontWeight={900} fontSize={size} fill={cor} style={{ fontVariantNumeric: 'lining-nums tabular-nums' }}>
                {((n % 10) + 10) % 10}
              </text>
            ))}
          </g>
        );
      })}
    </g>
  );
}

export const Cena01: React.FC<{ t: number }> = ({ t }) => {
  const c = cam(t);
  const cur = cursorDoy(t);
  const fimCursor = prog(t, T_GOLD, T_GOLD + 0.5);
  const uGold = easeOut(prog(t, T_GOLD, T_GOLD + 0.24));
  const uAnel = easeOut(prog(t, T_TREZE, T_TREZE + 0.32));
  const dimPlano = lerp(1, 0.38, easeInOut(prog(t, T_TREZE + 0.15, b(10))));
  const uQueda = (i: number) => easeIn(prog(t, b(12) + QUEDA[i] * 0.35, b(12) + QUEDA[i] * 0.35 + 0.45));
  const planoVisivel = t < b(13) + 0.2;

  // cartões flutuantes (13 e 20): sobem do plano para a tela; o 13 volta ao seu lugar quando o calendário cai
  const uSobe = easeInOut(prog(t, T_TREZE + 0.2, b(9) + 0.25));
  const uVolta13 = easeInOut(prog(t, b(12), b(12) + 0.5));
  const u13 = uSobe * (1 - uVolta13);
  const u20centro = easeInOut(prog(t, b(12), b(13)));
  const uLinha = easeInOut(prog(t, b(13), b(14)));
  const m13 = mlerp(mat(c, MAI13.x, MAI13.y, 40 * u13), [2.8, 0, 0, 2.8, 290, 790], u13);
  const alvo20 = [lerp(2.8, 2.3, u20centro), 0, 0, lerp(2.8, 2.3, u20centro), lerp(790, 540, u20centro), lerp(790, LY, u20centro)];
  const m20 = mlerp(mat(c, NOV20.x, NOV20.y, 40 * uSobe), alvo20, uSobe);

  // linha do tempo
  const v = anoAt(t);
  const pousou = prog(t, b(17), b(17) + 0.35);
  const corLinha = pousou > 0 ? COR.bege : COR.dourado;
  const uMapa = prog(t, b(17) + 0.05, b(18) + 0.15);
  const uTicks = easeOut(prog(t, b(13) + 0.35, b(14))) * (1 - easeIn(prog(t, b(17), b(17) + 0.3)));
  const uSobeCont = easeInOut(prog(t, b(17) + 0.05, b(18)));

  // título
  const T0 = b(9);
  // [texto da linha, [instante de cada palavra], y, cor]
  const linhas: [string, number[], number, string][] = [
    ['POR QUE', [T0, b(9.25)], 330, COR.branco], ['20 DE', [b(9.75)], 458, COR.dourado], ['NOVEMBRO?', [b(10)], 586, COR.dourado],
  ];
  const sobeTit = (k: number) => 470 * easeIn(prog(t, b(12) + k * 0.05, b(12) + 0.42 + k * 0.05));

  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <clipPath id="odoclip"><rect x={-DW / 2} y={CONT_Y - 175} width={DW} height={215} /></clipPath>
        <clipPath id="titclip"><rect x={0} y={190} width={1080} height={440} /></clipPath>
        <clipPath id="ouro"><rect x={-C / 2} y={C / 2 - C * uGold} width={C} height={C * uGold} /></clipPath>
      </defs>

      {/* ===== calendário 2026 em perspectiva ===== */}
      {planoVisivel && (
        <g opacity={dimPlano}>
          {visivel(c, 0, -150) && <text transform={M(mat(c, 0, -150))} fontFamily={FONTE.titulo} fontWeight={900} fontSize={150} fill={COR.branco} opacity={0.9}>{ANO}</text>}
          {MESES.map((nome, m) => {
            const y0 = m * (BH + GY), q = uQueda(Math.min(DIAS.length - 1, m * 30));
            if (!visivel(c, 0, y0 + 110, -500 * q)) return null;
            return (
              <g key={nome} opacity={1 - q}>
                <text transform={M(mat(c, 0, y0 + 52, -500 * q))} fontFamily={FONTE.ui} fontWeight={600} fontSize={38} letterSpacing={6} fill={m === DIAS[Math.min(DIAS.length - 1, Math.round(cur))].m || (m === 4 && t > 4.3) ? COR.branco : '#8C96AD'}>{nome}</text>
                {SEM.map((s2, k) => (
                  <text key={k} transform={M(mat(c, k * C + C / 2, y0 + 100, -500 * q))} textAnchor="middle" fontFamily={FONTE.ui} fontWeight={500} fontSize={22} fill="#5B6680">{s2}</text>
                ))}
              </g>
            );
          })}
          {DIAS.map((dd, i) => {
            const q = uQueda(i);
            if (q >= 1) return null;
            const passou = dd.doy < cur - 0.5, atual = Math.abs(dd.doy - cur) < 0.5 && fimCursor < 1;
            const rastro = dd.doy < cur && dd.doy > cur - 14 ? (1 - (cur - dd.doy) / 14) * (1 - fimCursor) : 0;
            const ehNov = dd === NOV20, ehMai = dd === MAI13;
            const sobe = ehNov ? uSobe > 0 : ehMai ? u13 > 0 : false;
            if (sobe) return null;
            if (!visivel(c, dd.x, dd.y + C / 2, -520 * q)) return null;
            const m = mat(c, dd.x, dd.y, -520 * q);
            const op = (1 - q) * (dd.doy > cur ? 0.85 : passou ? 0.4 : 1);
            return (
              <g key={i} transform={M(m)}>
                <rect x={-C / 2 + 4} y={-C / 2 + 4} width={C - 8} height={C - 8} rx={6} fill={COR.tinta} opacity={0.95 * (1 - q)} />
                {(atual || rastro > 0) && <rect x={-C / 2 + 4} y={-C / 2 + 4} width={C - 8} height={C - 8} rx={6} fill={COR.ciano} opacity={atual ? 1 : rastro * 0.6} />}
                {ehNov && uGold > 0 && <rect x={-C / 2 + 4} y={C / 2 - 4 - (C - 8) * uGold} width={C - 8} height={(C - 8) * uGold} rx={6} fill={COR.dourado} />}
                <text y={11} textAnchor="middle" fontFamily={ehNov && uGold > 0.5 ? FONTE.titulo : FONTE.ui} fontWeight={ehNov && uGold > 0.5 ? 900 : 500} fontSize={ehNov && uGold > 0.5 ? 40 : 30}
                  fill={atual ? COR.fundo : ehNov && uGold > 0.5 ? COR.fundo : COR.branco} opacity={ehNov ? 1 : op}>{dd.d}</text>
                {ehMai && uAnel > 0 && <rect x={-C / 2 + 3} y={-C / 2 + 3} width={C - 6} height={C - 6} rx={7} fill="none" stroke={COR.branco} strokeWidth={4} pathLength={1} strokeDasharray={`${uAnel} 1`} />}
              </g>
            );
          })}
        </g>
      )}

      {/* ===== cartão 13 de maio (Lei Áurea, 1888) ===== */}
      {u13 > 0 && (
        <g transform={M(m13)}>
          <rect x={-C / 2 + 3} y={-C / 2 + 3} width={C - 6} height={C - 6} rx={7} fill={COR.fundo} stroke={COR.branco} strokeWidth={3} />
          <text y={-23} textAnchor="middle" fontFamily={FONTE.ui} fontWeight={600} fontSize={11} letterSpacing={2} fill={COR.bege} opacity={u13}>{typed('MAIO', t, b(9), 20)}</text>
          <text y={20} textAnchor="middle" fontFamily={FONTE.titulo} fontWeight={900} fontSize={40} fill={COR.branco}>13</text>
        </g>
      )}
      {u13 > 0.5 && (
        <g>
          <text x={290} y={968} textAnchor="middle" fontFamily={FONTE.ui} fontWeight={600} fontSize={34} letterSpacing={1} fill={COR.branco}>{typed('LEI ÁUREA', t, b(10.5)).slice(0, Math.max(0, 9 - Math.floor(uVolta13 * 30)))}</text>
          <text x={290} y={1012} textAnchor="middle" fontFamily={FONTE.ui} fontWeight={500} fontSize={30} letterSpacing={2} fill={COR.bege}>{typed('13·05·1888', t, b(10.75)).slice(0, Math.max(0, 10 - Math.floor(uVolta13 * 30)))}</text>
        </g>
      )}

      {/* ===== cartão 20 de novembro → linha do tempo ===== */}
      {uSobe > 0 && uLinha < 1 && (
        <g transform={M(m20)}>
          {(() => {
            // primeiro achata (o numeral sai por cima), depois estica até as bordas da tela
            const w = lerp(C - 6, 1500 / 2.3, easeInOut(clamp((uLinha - 0.25) / 0.75))), h = lerp(C - 6, 5 / 2.3, easeInOut(clamp(uLinha / 0.45)));
            return <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={lerp(7, 1, uLinha)} fill={COR.dourado} />;
          })()}
          <text y={-23} textAnchor="middle" fontFamily={FONTE.ui} fontWeight={600} fontSize={11} letterSpacing={2} fill={COR.fundo} opacity={uSobe * (1 - uLinha * 4)}>{typed('NOVEMBRO', t, b(9), 30)}</text>
          {uLinha === 0 && <text y={20} textAnchor="middle" fontFamily={FONTE.titulo} fontWeight={900} fontSize={40} fill={COR.fundo}>20</text>}
        </g>
      )}
      {uSobe > 0.5 && u20centro < 1 && (
        <text x={790} y={968} textAnchor="middle" fontFamily={FONTE.ui} fontWeight={600} fontSize={34} letterSpacing={0} fill={COR.dourado}>{typed('CONSCIÊNCIA NEGRA', t, b(10.5)).slice(0, Math.max(0, 17 - Math.floor(u20centro * 50)))}</text>
      )}

      {/* ===== linha do tempo ===== */}
      {uLinha > 0 && (
        <g>
          {uLinha >= 1 && (() => {
            // a linha (e depois o contorno do Brasil): os pontos mais próximos de Porto Alegre se transformam primeiro
            const pts = Array.from({ length: NPT + 1 }, (_, i) => {
              const x0 = lerp(-210, 1290, i / NPT), dist = Math.abs(i / NPT - 0.5) * 2;
              const u = easeInOut(clamp((uMapa * 1.5 - dist * 0.5)));
              return [lerp(x0, MAPA[i][0], u), lerp(LY, MAPA[i][1], u)];
            });
            return <polyline points={pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')} fill="none" stroke={corLinha} strokeWidth={lerp(5, 3.2, uMapa)} strokeLinejoin="round" strokeLinecap="round" />;
          })()}
          {/* marcas de ano */}
          {uTicks > 0 && Array.from({ length: 80 }, (_, k) => 1955 + k).map((ano) => {
            const x = 540 + (ano - v) * PX;
            if (x < -40 || x > 1120) return null;
            const dez = ano % 10 === 0, cinco = ano % 5 === 0, cor = MARCOS[ano];
            const d = Math.abs(x - 540) / 600, hh = (cor ? 58 : dez ? 40 : cinco ? 26 : 15) * clamp(uTicks * 1.6 - d * 0.6);
            return (
              <g key={ano}>
                <line x1={x} x2={x} y1={LY - hh} y2={LY} stroke={cor ?? COR.branco} strokeOpacity={cor ? 1 : dez ? 0.7 : 0.38} strokeWidth={cor ? 5 : dez ? 3 : 2} />
                {(dez || ano === 2024) && uTicks > 0.6 && (
                  <text x={x} y={LY + 52} textAnchor="middle" fontFamily={FONTE.ui} fontWeight={ano === 2024 ? 600 : 500} fontSize={32} fill={ano === 2024 ? COR.dourado : COR.branco} opacity={ano === 2024 ? 1 : 0.55}>{ano}</text>
                )}
                {ano === 2024 && t > b(14) && (
                  <text x={x} y={LY - 84} textAnchor="middle" fontFamily={FONTE.ui} fontWeight={600} fontSize={36} letterSpacing={1} fill={COR.dourado}>{typed('FERIADO NACIONAL', t, b(14.25), 36)}</text>
                )}
              </g>
            );
          })}
          {/* agulha (presente → passado): ponto ciano que no fim vira Porto Alegre */}
          {t > b(13.5) && (() => {
            const uIn = easeOut(prog(t, b(13.5), b(13.5) + 0.25));
            const i = NPT / 2, u = easeInOut(clamp(uMapa * 1.5));
            const x = lerp(540, MAPA[i][0], u), y = lerp(LY, MAPA[i][1], u);
            const xf = lerp(x, POA[0], u), yf = lerp(y, POA[1], u);
            const ping = prog(t, b(18), b(18) + 0.7);
            return (
              <g>
                <circle cx={xf} cy={yf} r={11 * uIn} fill={COR.ciano} />
                {ping > 0 && <circle cx={xf} cy={yf} r={12 + 70 * easeOut(ping)} fill="none" stroke={COR.ciano} strokeWidth={3} opacity={1 - ping} />}
              </g>
            );
          })()}
        </g>
      )}

      {/* ===== contador de anos: o "20" do cartão sobe e completa "2026"; depois rola até 1971 ===== */}
      {uLinha > 0 && (() => {
        const sy = lerp(1, 0.62, uSobeCont), ty = lerp(0, 330 - CONT_Y + 40, uSobeCont);
        const cor = pousou > 0.5 ? COR.bege : COR.dourado;
        if (t < b(14)) {
          // numeral "20" viajando do cartão até as duas primeiras casas; "2" e "6" entram rolando de baixo
          const u = easeInOut(uLinha);
          const x20 = lerp(540, 540 - DW, u), y20 = lerp(LY + 20 * 2.3, CONT_Y, u), fs = lerp(40 * 2.3, 190, u);
          const r1 = easeOut(prog(t, b(13.5), b(13.5) + 0.16)), r2 = easeOut(prog(t, b(13.75), b(13.75) + 0.16));
          return (
            <g>
              {/* "20" desenhado como dois algarismos que viajam até as duas primeiras casas do contador */}
              {[['2', 540 - 0.29 * 40 * 2.3, x20 - 0.5 * DW], ['0', 540 + 0.29 * 40 * 2.3, x20 + 0.5 * DW]].map(([g, xa, xb]) => (
                <text key={g as string} x={lerp(xa as number, xb as number, u)} y={y20} textAnchor="middle" fontFamily={FONTE.titulo} fontWeight={900} fontSize={fs} fill={corMix(COR.fundo, COR.dourado, prog(u, 0.12, 0.4))} style={{ fontVariantNumeric: 'lining-nums tabular-nums' }}>{g}</text>
              ))}
              <g clipPath="url(#odoclip)" transform={`translate(${540 + 0.5 * DW},0)`}>
                <text x={0} y={CONT_Y + (1 - r1) * 200} textAnchor="middle" fontFamily={FONTE.titulo} fontWeight={900} fontSize={190} fill={COR.dourado}>2</text>
              </g>
              <g clipPath="url(#odoclip)" transform={`translate(${540 + 1.5 * DW},0)`}>
                <text x={0} y={CONT_Y + (1 - r2) * 200} textAnchor="middle" fontFamily={FONTE.titulo} fontWeight={900} fontSize={190} fill={COR.dourado}>6</text>
              </g>
            </g>
          );
        }
        return (
          <g transform={`translate(540,${CONT_Y + ty}) scale(${sy}) translate(-540,${-CONT_Y})`}>
            <Odometro v={v} x={540} y={CONT_Y} size={190} cor={cor} />
          </g>
        );
      })()}

      {/* ===== título ===== */}
      {t >= T0 && t < b(12) + 0.7 && (
        <g clipPath="url(#titclip)">
          {linhas.map(([txt, tps, y, cor], k) => {
            const pal = txt.split(' ');
            // cada palavra datilografa em 0,09 s a partir do seu instante (teclas na grade de semicolcheias)
            let vis = '';
            pal.forEach((w, j) => { const r = clamp((t - tps[Math.min(j, tps.length - 1)]) / 0.09); if (j > 0 && tps.length === 1) return; if (r > 0) vis += (j ? ' ' : '') + w.slice(0, Math.ceil(w.length * r)); });
            if (tps.length === 1 && pal.length > 1 && t >= tps[0]) vis = txt.slice(0, Math.ceil(txt.length * clamp((t - tps[0]) / 0.12)));
            if (!vis) return null;
            return (
              <text key={k} x={80} y={y - sobeTit(k)} fontFamily={FONTE.titulo} fontWeight={900} fontSize={124} letterSpacing={-1} fill={cor}>{vis}</text>
            );
          })}
        </g>
      )}
    </svg>
  );
};
