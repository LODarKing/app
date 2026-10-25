// CENA 7 (108,73–129,87): 2 Samuel 9 — Davi procura Mefibosete (filho de Jônatas, com deficiência nos pés);
// Mefibosete se prostra diante do rei, inseguro; recebe acolhimento e lugar permanente à mesa do rei.
// Nenhum dispositivo de mobilidade é inventado: ele é trazido a Davi (v. 5) e se prostra (v. 6).
import React from 'react';
import { Chip, Icon, Burst, PAL, FONT } from '../fx';
import { PageFrame, StorySky, Colonnade, Sil, BibleOpen, Bubble, INK, INK2 } from '../story';
import { ss, sm, outBack, keys } from '../../lib/anim';
import { clamp, lerp, f, shape } from '../../lib/paths';

const Table: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect x={160} y={860} width={700} height={36} rx={10} fill="#5A2F1E" />
    <rect x={190} y={896} width={24} height={110} fill="#4A2618" /><rect x={806} y={896} width={24} height={110} fill="#4A2618" />
    {/* pratos, pão, uvas, jarro, velas */}
    {[260, 420, 600, 760].map((x, i) => <ellipse key={i} cx={x} cy={856} rx={46} ry={10} fill="#E9D6B0" />)}
    <path d="M380 850 Q420 820 460 850 Z" fill="#D9A55A" />
    {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={585 + (i % 3) * 14} cy={838 - Math.floor(i / 3) * 12} r={8} fill="#7B3F8F" />)}
    <path d="M690 856 L700 800 Q720 786 740 800 L750 856 Z" fill="#B5733E" />
    {[300, 520].map((x, i) => <g key={i}><rect x={x - 6} y={790} width={12} height={60} fill="#F3E7C9" /><path d={`M${x} 790 q${f(6 + Math.sin(t * 9 + i) * 3)} -14 0 -26 q${f(-6 + Math.sin(t * 7 + i) * 3)} 12 0 26 Z`} fill="#FFC14D" /><circle cx={x} cy={772} r={36} fill="#FFE29A" opacity={0.25} /></g>)}
  </g>
);

export const S07: React.FC<{ t: number }> = ({ t }) => {
  // planos: A palácio (Davi procura) 0–7,5 | B Mefibosete diante do rei 7,5–12 | C banquete 12–21
  const A = t < 7.55, B = t >= 7.55 && t < 12.1, C = t >= 12.1;
  const cut = (t0: number) => 1 - ss((t - t0) / 0.18) + ss((t - t0 - 0.18) / 0.18);
  const flash = Math.min(cut(7.4), cut(11.95));
  // Mefibosete chega, é trazido (caminha devagar) e se prostra
  const mx = keys(t, [[7.55, 1000], [9.4, 640]]);
  const bow = sm((t - 9.5) / 0.7) * (1 - sm((t - 12.2) / 0.6));
  const davidReach = sm((t - 11.0) / 0.6);
  const zoomC = lerp(1.15, 1, sm((t - 12.1) / 1.4)) + 0.22 * sm((t - 15.0) / 6.2);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <PageFrame t={t} title="2 SAMUEL 9">
        <svg width={1008} height={1160} style={{ position: 'absolute', inset: 0 }}>
          {A ? <g transform={`translate(500 900) scale(${f(lerp(1, 1.18, sm((t - 1.6) / 5)))}) translate(-500 -900)`}>
            <StorySky t={t} top="#5A6FC4" mid="#C99BD0" bot="#F6D2B0" sun={[820, 300]} hills={['#8B6AA8', '#6E4E8E', '#553A74']} />
            <Colonnade x={90} y={900} n={7} gap={140} h={420} color={INK2} />
            <rect x={0} y={900} width={1008} height={260} fill="#4E2C48" />
            <rect x={300} y={600} width={400} height={300} fill="#3A1F3A" />
            {/* trono */}
            <path d={shape([[420, 900, 1], [420, 640], [500, 590], [580, 640], [580, 900, 1]])} fill="#2B1630" />
            <Sil x={500} y={900} s={1.35} face={1} wear="crown" beard armF={[110, 20 + 30 * Math.sin(clamp((t - 2.5) / 1.6) * Math.PI)]} head={keys(t, [[1.8, 0], [2.6, -6], [4.0, 6]])} />
            <Sil x={820} y={900} s={1.15} face={-1} wear="turban" walk={t > 4.3 && t < 6.4 ? t * 7 : undefined} armF={t > 2.6 && t < 4.6 ? [40, 40] : [10, 150]} color={INK2} />
          </g> : null}
          {B ? <g>
            <StorySky t={t} top="#5A6FC4" mid="#C99BD0" bot="#F6D2B0" sun={[820, 300]} hills={['#8B6AA8', '#6E4E8E', '#553A74']} />
            <Colonnade x={90} y={900} n={7} gap={140} h={420} color={INK2} />
            <rect x={0} y={900} width={1008} height={260} fill="#4E2C48" />
            <Sil x={300} y={900} s={1.4} face={1} wear="crown" beard armF={[lerp(20, 150, davidReach), lerp(150, 60, davidReach)]} head={lerp(0, 10, davidReach)} />
            <Sil x={mx} y={900} s={1.25} face={-1} wear="plain" beard dress="tunic" walk={t < 9.4 ? t * 4 : undefined} bow={bow} kneel={bow} armF={[60, lerp(150, 120, bow)]} head={lerp(0, 18, bow)} />
            <Sil x={mx + 150} y={900} s={1.1} face={-1} wear="turban" walk={t < 9.4 ? t * 4 : undefined} color={INK2} armF={[-60, 60]} />
          </g> : null}
          {C ? <g transform={`translate(500 880) scale(${f(zoomC)}) translate(-500 -880)`}>
            <rect width={1008} height={1160} fill="#3A1F3A" />
            <circle cx={500} cy={620} r={480} fill="#FFCF8A" opacity={0.28} />
            <Colonnade x={60} y={980} n={8} gap={128} h={520} color="#2B1630" />
            <rect x={0} y={980} width={1008} height={180} fill="#2B1630" />
            {/* cortinas */}
            <path d="M0 140 Q120 300 60 980 L0 980 Z M1008 140 Q888 300 948 980 L1008 980 Z" fill="#7A1E3A" />
            <Sil x={290} y={980} s={1.2} face={1} wear="crown" beard armF={[110, 70 + 10 * Math.sin(t * 2)]} head={3} rim="#FFD9A0" />
            <Sil x={720} y={980} s={1.1} face={-1} wear="plain" beard dress="tunic" kneel={0.62} armF={[90, 70]} head={-4} rim="#FFD9A0" />
            <Table t={t} />
          </g> : null}
        </svg>
        {flash < 1 ? <div style={{ position: 'absolute', inset: 0, background: '#FFF6E0', opacity: 1 - flash }} /> : null}
      </PageFrame>
      <Chip t={t} t0={3.2} t1={5.6} x={540} y={420} text="MEFIBOSETE" bg="#6B3E2A" color="#FFF3D6" size={54} rot={-3} />
      <Chip t={t} t0={4.6} t1={7.3} x={540} y={520} text={<>FILHO DE <span style={{ color: PAL.yellow }}>JÔNATAS</span></>} bg={PAL.navy} size={40} rot={2} />
      <Bubble t={t} t0={2.3} t1={4.4} x={440} y={500}><span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 30, color: '#4A2A1A' }}>Há ainda alguém da casa de Saul?</span></Bubble>
      <Bubble t={t} t0={9.8} t1={11.6} x={700} y={760} tail="r"><span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 30, color: '#4A2A1A' }}>Eis aqui o teu servo.</span></Bubble>
      <Bubble t={t} t0={11.4} t1={12.0} x={360} y={620}><span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 30, color: '#4A2A1A' }}>Não temas.</span></Bubble>
      <Chip t={t} t0={12.2} t1={14.4} x={540} y={420} text="ACOLHIMENTO" bg={PAL.green} size={56} rot={-2} />
      <Chip t={t} t0={13.55} t1={16.0} x={540} y={520} text={<>LUGAR <span style={{ color: PAL.yellow }}>À MESA</span></>} bg={PAL.navy} size={48} rot={2} />
      <Chip t={t} t0={17.7} t1={99} x={540} y={420} text={<>VALOR <span style={{ color: PAL.yellow }}>E DIGNIDADE</span></>} bg={PAL.navy} size={52} rot={-2} />
      <Burst t={t} t0={12.2} x={540} y={720} color="#FFD27A" r={300} />
      {t > 18.4 ? <div style={{ position: 'absolute', left: 470, top: 600, transform: `scale(${f(clamp(outBack((t - 18.5) / 0.45), 0, 1.2))})` }}><Icon name="heart" color="#E5484D" size={140} /></div> : null}
      <BibleOpen t={t} ref_="2 SAMUEL 9" />
    </div>
  );
};
