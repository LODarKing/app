import React from 'react';
import { COR, FONTE, b, clamp, lerp, prog, easeInOut, easeOut, easeIn, mulberry32 } from '../tema';
import { typed } from '../comp/util';
import { Pessoa } from '../comp/Pessoa';

/* CENA 06 — O SIGNIFICADO NO PRESENTE (49,3 → 60,2 s)
 *  b76.5 "Hoje"          → a linha do tempo dourada vira a moldura de quatro quadros (ilustrações autorais, sem rosto)
 *  b79.75 "lembrar"      → MEMÓRIA      (leitora diante de uma estante)
 *  b82.5  "cultura"      → CULTURA      (artista pintando)
 *  b84.75 "refletir"     → RESISTÊNCIA  (organização coletiva: três pessoas, uma com a palavra)
 *  b86.25 "igualdade"    → IGUALDADE    (formatura)
 *  b88.25 "conhecer"     → os quadros se juntam · b90.75 "transforma" → só o que está dentro do número 20 permanece
 */
const PW = 470, PH = 460;
const PAINEIS = [{ x: 60, y: 300 }, { x: 550, y: 300 }, { x: 60, y: 780 }, { x: 550, y: 780 }];
const PALAVRAS = ['MEMÓRIA', 'CULTURA', 'RESISTÊNCIA', 'IGUALDADE'];
const TW = [b(79.75), b(82.5), b(84.75), b(86.25)];
const FUNDO_P = '#121B2F';
export const T_MASCARA = b(90.75);

function Estante() {
  const r = mulberry32(42), cores = [COR.bege, COR.terracota, COR.dourado, '#3D6E8C', '#2B3A5A', '#E9E2D0'];
  const livros: React.ReactNode[] = [];
  [70, 175, 280].forEach((ys, k) => {
    let x = 30;
    while (x < 440) { const w = 14 + r() * 18, h = 60 + r() * 30; livros.push(<rect key={`${k}-${x}`} x={x} y={ys - h} width={w - 3} height={h} fill={cores[Math.floor(r() * cores.length)]} opacity={0.55} />); x += w; }
    livros.push(<rect key={'s' + k} x={20} y={ys} width={430} height={8} fill="#2B3A5A" />);
  });
  return <g>{livros}</g>;
}
const Livro = (mE: [number, number], mD: [number, number]) => {
  const cx = (mE[0] + mD[0]) / 2, cy = (mE[1] + mD[1]) / 2 - 6;
  return (
    <g>
      <path d={`M${cx},${cy + 8} L${cx - 70},${cy - 6} L${cx - 70},${cy + 46} L${cx},${cy + 58}Z`} fill="#F5F7FC" />
      <path d={`M${cx},${cy + 8} L${cx + 70},${cy - 6} L${cx + 70},${cy + 46} L${cx},${cy + 58}Z`} fill="#E4D6BD" />
      {[0, 1, 2, 3].map((i) => <line key={i} x1={cx - 60} x2={cx - 12} y1={cy + 6 + i * 10} y2={cy + 14 + i * 10} stroke="#9AA3B5" strokeWidth={2} />)}
      {[0, 1, 2, 3].map((i) => <line key={'d' + i} x1={cx + 12} x2={cx + 60} y1={cy + 14 + i * 10} y2={cy + 6 + i * 10} stroke="#9AA3B5" strokeWidth={2} />)}
    </g>
  );
};

function Vinheta({ i }: { i: number }) {
  if (i === 0) return (
    <g>
      <Estante />
      <circle cx={235} cy={250} r={150} fill={COR.dourado} opacity={0.08} />
      <Pessoa x={235} y={452} H={360} pele="#6B4226" cabelo="afro" blusa={COR.dourado} calca="#24324F" mangaLonga
        bracoE={[0.01, 0.15, 0.085, 0.2]} bracoD={[-0.01, 0.15, -0.085, 0.2]} frente={Livro} />
    </g>
  );
  if (i === 1) return (
    <g>
      {/* cavalete e tela com composição abstrata */}
      <line x1={300} y1={300} x2={280} y2={455} stroke="#7A5A3A" strokeWidth={8} />
      <line x1={410} y1={300} x2={430} y2={455} stroke="#7A5A3A" strokeWidth={8} />
      <line x1={355} y1={300} x2={355} y2={450} stroke="#5E4530" strokeWidth={6} />
      <rect x={268} y={92} width={176} height={214} fill="#F2EBDD" />
      <circle cx={330} cy={170} r={44} fill={COR.dourado} />
      <rect x={285} y={222} width={142} height={16} fill={COR.terracota} />
      <rect x={285} y={248} width={110} height={16} fill={COR.terracota} opacity={0.75} />
      <path d={`M372,110 L430,110 L430,200Z`} fill="#1E8FA3" />
      <rect x={260} y={300} width={192} height={12} fill="#5E4530" />
      <Pessoa x={150} y={452} H={350} pele="#8D5A3B" cabelo="coque" blusa={COR.terracota} saia="#0F5E6B"
        bracoE={[-0.05, 0.14, 0.0, 0.25]} bracoD={[0.11, 0.06, 0.25, -0.02]}
        frente={(mE, mD) => (
          <g>
            <ellipse cx={mE[0] - 6} cy={mE[1] + 8} rx={40} ry={24} fill="#C9A77A" />
            {[COR.dourado, COR.terracota, '#1E8FA3', COR.branco].map((c, k) => <circle key={k} cx={mE[0] - 26 + k * 15} cy={mE[1] + 2 + (k % 2) * 8} r={6} fill={c} />)}
            <line x1={mD[0]} y1={mD[1]} x2={mD[0] + 36} y2={mD[1] - 26} stroke="#E4D6BD" strokeWidth={5} strokeLinecap="round" />
          </g>
        )} />
    </g>
  );
  if (i === 2) return (
    <g>
      <rect x={30} y={40} width={410} height={70} fill={COR.terracota} opacity={0.8} />
      {Array.from({ length: 10 }, (_, k) => <path key={k} d={`M${42 + k * 40},96 L${62 + k * 40},56 L${82 + k * 40},96Z`} fill={COR.bege} opacity={0.5} />)}
      <Pessoa x={105} y={452} H={320} pele="#4A2C1A" cabelo="locs" blusa="#1E8FA3" calca="#2B3A5A" />
      <Pessoa x={365} y={452} H={335} pele="#9A6440" cabelo="curto" blusa={COR.dourado} calca="#24324F" mangaLonga />
      <Pessoa x={235} y={452} H={355} pele="#7A4B2E" cabelo="trancas" blusa={COR.branco} calca="#3A2A20"
        bracoD={[0.06, -0.07, 0.09, -0.21]} />
    </g>
  );
  return (
    <g>
      {[0, 1, 2].map((k) => <rect key={k} x={0} y={120 + k * 70} width={470} height={34} fill={COR.dourado} opacity={0.05 + k * 0.02} />)}
      <Pessoa x={160} y={452} H={360} pele="#5A3825" cabelo="curto" blusa={COR.branco} toga="#1F2B47" capelo
        bracoD={[0.07, -0.03, 0.1, -0.17]}
        frente={(_, mD) => (<g><rect x={mD[0] - 8} y={mD[1] - 52} width={16} height={60} rx={6} fill="#F5F7FC" /><rect x={mD[0] - 9} y={mD[1] - 26} width={18} height={7} fill={COR.dourado} /></g>)} />
      <Pessoa x={325} y={452} H={345} pele="#8A5636" cabelo="afro" blusa={COR.branco} toga="#1F2B47" capelo />
      {[160, 325].map((x, k) => <path key={k} d={`M${x - 18},${452 - (k ? 345 : 360) * 0.76} L${x - 4},${452 - (k ? 345 : 360) * 0.3} L${x + 4},${452 - (k ? 345 : 360) * 0.3} L${x + 18},${452 - (k ? 345 : 360) * 0.76}`} fill="none" stroke={COR.dourado} strokeWidth={9} />)}
    </g>
  );
}

export const Cena06: React.FC<{ t: number }> = ({ t }) => {
  if (t < b(76.5) || t > 60.3) return null;
  const T0 = b(76.5);
  // a linha dourada (x=150, 330→947) vira a divisória vertical; depois nasce a horizontal
  const uV = easeInOut(prog(t, T0, T0 + 0.5));
  const uH = easeOut(prog(t, T0 + 0.4, T0 + 0.85));
  const junta = easeInOut(prog(t, b(88.25), b(88.25) + 0.6));
  const linhas = 1 - junta;
  const uMask = easeInOut(prog(t, T_MASCARA, T_MASCARA + 0.75));
  const DES = [[10, 10], [-10, 10], [10, -10], [-10, -10]];
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        {PAINEIS.map((p, i) => {
          const u = easeOut(prog(t, T0 + 0.6 + i * 0.18, T0 + 1.1 + i * 0.18));
          const ax = i % 2 === 0 ? p.x + PW : p.x, ay = i < 2 ? p.y + PH : p.y;   // canto que encosta no cruzamento
          const w = PW * u, h = PH * u;
          return <clipPath key={i} id={`pc${i}`}><rect x={i % 2 === 0 ? ax - w : ax} y={i < 2 ? ay - h : ay} width={w} height={h} /></clipPath>;
        })}
        <mask id="m20" maskUnits="userSpaceOnUse" x={0} y={0} width={1080} height={1920}>
          <rect width={1080} height={1920} fill="#fff" opacity={1 - uMask} />
          <text x={540} y={1060} textAnchor="middle" fontFamily={FONTE.titulo} fontWeight={900} fontSize={760} fill="#fff">20</text>
        </mask>
      </defs>
      <text x={60} y={250} fontFamily={FONTE.ui} fontWeight={600} fontSize={38} letterSpacing={2}>
        <tspan fill={COR.ciano}>{typed('HOJE', t, T0, 20)}</tspan>
        <tspan fill={COR.dourado}>{typed(' · 20 DE NOVEMBRO', t, b(77.25), 40)}</tspan>
      </text>
      <g mask="url(#m20)">
        {PAINEIS.map((p, i) => {
          const aceso = lerp(0.38, 1, easeOut(prog(t, TW[i] - 0.1, TW[i] + 0.25)));
          const dx = DES[i][0] * junta, dy = DES[i][1] * junta;
          const faixa = easeIn(prog(t, b(88.25), b(88.25) + 0.4));
          return (
            <g key={i} clipPath={`url(#pc${i})`}>
              <g transform={`translate(${p.x + dx},${p.y + dy})`}>
                <rect width={PW} height={PH} fill={FUNDO_P} />
                <g opacity={aceso}><Vinheta i={i} /></g>
                <g transform={`translate(0,${120 * faixa})`}>
                  <rect y={PH - 78} width={PW} height={78} fill={COR.fundo} opacity={0.9} />
                  <text x={24} y={PH - 22} fontFamily={FONTE.titulo} fontWeight={900} fontSize={54} fill={i === 2 ? COR.dourado : COR.branco}>{typed(PALAVRAS[i], t, TW[i], 30)}</text>
                </g>
              </g>
            </g>
          );
        })}
      </g>
      {/* moldura dourada (linha do tempo transformada) */}
      {linhas > 0 && (
        <g opacity={uMask < 1 ? 1 : 0}>
          <line x1={lerp(150, 540, uV)} x2={lerp(150, 540, uV)} y1={lerp(340, 300 + 470 * junta, uV)} y2={lerp(960, 1240 - 470 * junta, uV)} stroke={COR.dourado} strokeWidth={lerp(6, 3, uV)} />
          {uH > 0 && <line x1={540 - 480 * uH * linhas} x2={540 + 480 * uH * linhas} y1={770} y2={770} stroke={COR.dourado} strokeWidth={3} />}
        </g>
      )}
    </svg>
  );
};
