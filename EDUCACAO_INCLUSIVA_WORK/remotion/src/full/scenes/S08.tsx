// CENA 8 (129,87–144,54): Helen Keller — surdocegueira na infância; Anne Sullivan soletra W-A-T-E-R
// na palma da mão junto à bomba d'água (The Story of My Life, 1903); escritora; formatura no Radcliffe (1904);
// defesa de direitos. Foco em educação acessível e apoio.
import React from 'react';
import { Chip, Icon, Burst, PAL, FONT, rnd } from '../fx';
import { PageFrame, Sil, INK, INK2 } from '../story';
import { ss, sm, outBack, keys } from '../../lib/anim';
import { clamp, lerp, f } from '../../lib/paths';

const SEPIA = { top: '#E9D3A8', bot: '#C9A574', ink: '#4A2E22', ink2: '#6A4532' };

export const S08: React.FC<{ t: number }> = ({ t }) => {
  // planos: A bomba d'água 0–5,4 | B escritora 5,4–7,2 | C formatura 7,2–9,8 | D direitos 9,8–14,7
  const P = t < 5.45 ? 0 : t < 7.25 ? 1 : t < 9.8 ? 2 : 3;
  const flash = [5.45, 7.25, 9.8].reduce((m, c) => Math.max(m, 1 - Math.min(1, Math.abs(t - c) / 0.16)), 0);
  const letters = 'WATER';
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <PageFrame t={t} title="HELEN KELLER" tone="#F3E3C3">
        <svg width={1008} height={1160} style={{ position: 'absolute', inset: 0 }}>
          <defs><linearGradient id="sep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={SEPIA.top} /><stop offset="1" stopColor={SEPIA.bot} /></linearGradient></defs>
          <rect width={1008} height={1160} fill="url(#sep)" />
          {P === 0 ? <g transform={`translate(760 850) scale(${f(lerp(1, 1.3, sm((t - 2.6) / 2.6)))}) translate(-760 -850)`}>
            {/* jardim e bomba d'água */}
            <path d="M0 880 Q300 860 500 880 T1008 870 L1008 1160 L0 1160 Z" fill="#B48B5A" />
            <path d="M80 880 C60 700 180 640 240 700 C300 600 420 640 400 760 C430 800 400 880 380 880 Z" fill={SEPIA.ink2} opacity={0.55} />
            <g>
              <g transform="translate(1590 0) scale(-1 1)">
              <rect x={600} y={560} width={60} height={320} rx={10} fill={SEPIA.ink} />
              <path d="M640 600 L760 600 L760 640 L700 640 L700 680 L660 680 Z" fill={SEPIA.ink} />
              <g transform={`rotate(${f(-20 + 18 * Math.sin(t * 5) * (t > 1.2 && t < 5.4 ? 1 : 0))} 640 580)`}><rect x={500} y={570} width={150} height={20} rx={10} fill={SEPIA.ink} /></g>
              {/* água escorrendo */}
              {t > 1.3 ? Array.from({ length: 10 }, (_, i) => { const k = ((t * 1.6 + i / 10) % 1); return <ellipse key={i} cx={740 + Math.sin(i) * 4} cy={650 + k * 230} rx={9} ry={14} fill="#6FB7D6" opacity={0.85 * (1 - k * 0.5)} />; }) : null}
              <ellipse cx={745} cy={880} rx={70} ry={14} fill="#6FB7D6" opacity={0.6} />
              </g>
            </g>
            {/* Anne Sullivan e Helen (criança), mãos juntas sob a água */}
            <Sil x={560} y={880} s={1.2} face={1} wear="bow" dress="gown" armF={[230, 90]} head={6} color={SEPIA.ink} rim="#FFF4D8" />
            <Sil x={760} y={880} s={1.15} face={1} child wear="hair" dress="gown" armF={[150, 40]} head={-8} color={SEPIA.ink2} rim="#FFF4D8" />
          </g> : null}
          {P === 1 ? <g>
            {/* escritora: mesa, máquina de escrever Braille, papéis */}
            <rect x={0} y={760} width={1008} height={400} fill="#A57E52" />
            <rect x={160} y={720} width={700} height={40} rx={8} fill={SEPIA.ink} />
            <rect x={420} y={630} width={220} height={90} rx={14} fill={SEPIA.ink2} />
            {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={448 + i * 32} cy={670 + (i % 2) * 6 * Math.sin(t * 20 + i)} r={10} fill="#E9D3A8" />)}
            <rect x={470} y={560} width={120} height={70} fill="#FFF8E8" transform={`translate(0 ${f(-30 * sm((t - 5.5) / 1.6))})`} />
            <Sil x={320} y={860} s={1.25} face={1} wear="bow" dress="gown" kneel={0.5} armF={[180, 30]} head={6} color={SEPIA.ink} rim="#FFF4D8" />
            {Array.from({ length: 6 }, (_, i) => { const k = (t - 5.5 - i * 0.22) / 1.4; return k > 0 && k < 1 ? <rect key={i} x={640 + k * 260 + rnd(i) * 40} y={500 - k * 200 + rnd(i + 4) * 60} width={60} height={76} fill="#FFF8E8" stroke={SEPIA.ink} strokeWidth={3} transform={`rotate(${f(k * 60 * (i % 2 ? 1 : -1))} ${f(670 + k * 260)} ${f(540 - k * 200)})`} opacity={1 - k} /> : null; })}
          </g> : null}
          {P === 2 ? <g>
            {/* formatura no Radcliffe College, 1904 */}
            <rect x={0} y={0} width={1008} height={1160} fill="#D8BC8E" />
            <path d="M200 860 L200 420 L504 260 L808 420 L808 860 Z" fill={SEPIA.ink2} opacity={0.55} />
            {[260, 380, 500, 620, 740].map((x) => <rect key={x} x={x - 18} y={440} width={36} height={420} fill={SEPIA.ink} opacity={0.5} />)}
            <rect x={0} y={860} width={1008} height={300} fill="#A57E52" />
            <Sil x={504} y={880} s={1.45} face={1} wear="cap" dress="gown" armF={[110, lerp(120, -40, sm((t - 7.6) / 0.6))]} head={-4} color={SEPIA.ink} rim="#FFF4D8" />
            {/* diploma */}
            <g transform={`translate(${f(504 + 125)} ${f(lerp(700, 455, sm((t - 7.6) / 0.6)))}) rotate(-20)`}><rect x={-12} y={-50} width={24} height={100} rx={10} fill="#FFF8E8" stroke={SEPIA.ink} strokeWidth={3} /><rect x={-14} y={-6} width={28} height={12} fill="#C0392B" /></g>
            {/* capelos voando */}
            {Array.from({ length: 5 }, (_, i) => { const k = (t - 8.4 - i * 0.12) / 1.3; if (k <= 0 || k >= 1) return null; const x = 200 + i * 150 + Math.sin(k * 6 + i) * 30, y = 820 - Math.sin(k * Math.PI) * 600; return <g key={i} transform={`translate(${f(x)} ${f(y)}) rotate(${f(k * 360 * (i % 2 ? 1 : -1))})`}><path d="M-40 0 L0 -18 L40 0 L0 18 Z" fill={SEPIA.ink} /></g>; })}
          </g> : null}
          {P === 3 ? <g>
            <rect width={1008} height={1160} fill="#E2C89A" />
            {/* defendeu direitos: Helen adulta à frente de um púlpito; depois portas se abrindo (oportunidades) */}
            {t < 10.5 ? <g>
              <rect x={560} y={620} width={160} height={260} rx={10} fill={SEPIA.ink2} />
              <Sil x={470} y={880} s={1.4} face={1} wear="bow" dress="gown" armF={[150, -10]} head={-6} color={SEPIA.ink} rim="#FFF4D8" />
            </g> : <g>
              {[0, 1, 2].map((i) => { const k = sm((t - 10.6 - i * 0.55) / 0.7); const x = 170 + i * 250; return <g key={i}>
                <rect x={x} y={420} width={170} height={420} rx={10} fill="#FFF3C4" />
                <circle cx={x + 85} cy={630} r={150 * k} fill="#FFFFFF" opacity={0.5 * k} />
                <path d={`M${x} 420 L${x + 170 * (1 - k * 0.8)} ${420 + 30 * k} L${x + 170 * (1 - k * 0.8)} ${840 - 30 * k} L${x} 840 Z`} fill={SEPIA.ink} />
              </g>; })}
              <rect x={0} y={840} width={1008} height={320} fill="#A57E52" />
            </g>}
          </g> : null}
        </svg>
        {flash > 0 ? <div style={{ position: 'absolute', inset: 0, background: '#FFF8E8', opacity: flash }} /> : null}
      </PageFrame>
      {/* alfabeto manual tátil: letras surgindo da mão */}
      {t > 3.75 && t < 5.45 ? letters.split('').map((ch, i) => {
        const k = outBack((t - 3.95 - i * 0.24) / 0.3);
        if (k <= 0) return null;
        return <div key={i} style={{ position: 'absolute', left: 330 + i * 92, top: 500 - 30 * Math.sin(clamp(k) * Math.PI), width: 84, height: 96, transform: `scale(${f(k)})`, background: '#FFFDF5', border: '5px solid #4A2A1A', borderRadius: 18, boxShadow: '0 7px 0 #4A2A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 60, color: '#2A6F97' }}>{ch}</div>;
      }) : null}
      <Chip t={t} t0={3.8} t1={5.45} x={540} y={410} text={<>ALFABETO MANUAL <span style={{ color: PAL.yellow }}>NA MÃO</span></>} bg={PAL.navy} size={38} rot={-2} />
      <Chip t={t} t0={0.9} t1={3.5} x={540} y={420} text={<span style={{ display: 'inline-flex', gap: 18, alignItems: 'center' }}><Icon name="cane" size={54} /> + <Icon name="ear" size={54} /> SURDOCEGUEIRA</span>} bg="#6B3E2A" color="#FFF3D6" size={40} rot={-2} />
      <Chip t={t} t0={4.0} t1={5.4} x={540} y={1240} text={<>EDUCAÇÃO <span style={{ color: PAL.yellow }}>ACESSÍVEL</span> + APOIO</>} bg={PAL.green} size={40} rot={2} />
      <Chip t={t} t0={5.55} t1={7.2} x={540} y={420} text="ESCRITORA" bg="#6B3E2A" color="#FFF3D6" size={58} rot={-3} />
      <Chip t={t} t0={7.4} t1={9.8} x={540} y={420} text={<>UNIVERSIDADE • <span style={{ color: PAL.yellow }}>1904</span></>} bg={PAL.navy} size={50} rot={2} />
      <Chip t={t} t0={9.9} t1={10.6} x={540} y={420} text="DIREITOS" bg={PAL.royal} size={58} rot={-2} />
      <Chip t={t} t0={12.9} t1={99} x={540} y={420} text={<>OPORTUNIDADES <span style={{ color: PAL.yellow }}>REAIS</span></>} bg={PAL.green} size={52} rot={-2} />
      <Burst t={t} t0={7.75} x={630} y={660} r={260} />
      <Burst t={t} t0={13.7} x={540} y={700} r={320} />
    </div>
  );
};
