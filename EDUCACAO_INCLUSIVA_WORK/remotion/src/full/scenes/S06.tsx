// CENA 6 (88,87–108,73): João 5:1-18 — tanque de Betesda. Jesus encontra o homem (38 anos), ouve, fala,
// realiza a cura narrada no texto; líderes questionam por ser sábado; Jesus dá atenção à pessoa.
import React from 'react';
import { Chip, Icon, Burst, PAL, FONT } from '../fx';
import { PageFrame, StorySky, Colonnade, Palm, Sil, LyingSil, BibleOpen, Bubble, INK, INK2 } from '../story';
import { ss, sm, outBack, keys } from '../../lib/anim';
import { clamp, lerp, f } from '../../lib/paths';

export const S06: React.FC<{ t: number }> = ({ t }) => {
  // Jesus entra caminhando e para perto do homem
  const jx = keys(t, [[1.0, -120], [3.6, 230]]);
  const walking = t > 1.0 && t < 3.6;
  const kneel = sm((t - 6.5) / 0.6) * (1 - sm((t - 9.3) / 0.6));
  const rise = sm((t - 9.7) / 1.0);                       // o homem se levanta
  const zoom = lerp(1, 1.45, sm((t - 13.7) / 1.0)) - 0.45 * sm((t - 17.4) / 0.8);
  const leaders = sm((t - 10.4) / 0.6) * (1 - sm((t - 13.7) / 0.5));
  const glow = Math.max(0, Math.sin(clamp((t - 9.4) / 1.4) * Math.PI)) * 0.9;
  const heart = outBack((t - 14.6) / 0.5) * (1 - ss((t - 17.3) / 0.4));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <PageFrame t={t} title="JOÃO 5">
        <svg width={1008} height={1160} style={{ position: 'absolute', inset: 0 }}>
          <g transform={`translate(380 900) scale(${f(zoom)}) translate(-380 -900)`}>
            <StorySky t={t} />
            <Palm x={80} y={900} s={0.9} t={t} />
            <Palm x={980} y={900} s={1.05} t={t} />
            <Colonnade x={440} y={880} n={5} gap={130} h={330} />
            <rect x={0} y={880} width={1008} height={300} fill="#7A4630" />
            {/* tanque com água ondulando */}
            <path d={`M640 905 L1008 905 L1008 1000 L620 1000 Z`} fill="#5E8FA0" />
            {Array.from({ length: 4 }, (_, i) => <path key={i} d={`M${650 + i * 90 + ((t * 30) % 90)} ${930 + (i % 3) * 22} q20 -8 40 0`} stroke="#B9E2EC" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7} />)}
            <rect x={0} y={1000} width={1008} height={160} fill="#5C3424" />
            <path d="M0 1000 L1008 1000" stroke="#3B2015" strokeWidth={6} />
            {/* o homem: deitado na esteira, depois de pé com a esteira */}
            {rise < 0.5 ? <LyingSil x={470} y={905} s={1.15} lift={sm((t - 6.8) / 0.5) * 0.35 + rise} /> : (
              <g>
                <Sil x={430} y={905} s={1.25} face={-1} dress="tunic" wear="plain" armF={[40, 60]} armB={[-60, 40]} head={-4} />
                <rect x={455} y={790} width={110} height={30} rx={13} fill="#7A4E3A" transform="rotate(-20 455 790)" />
              </g>
            )}
            {/* Jesus */}
            <Sil x={jx} y={905} s={1.3} face={1} wear="hair" beard walk={walking ? t * 7 : undefined} kneel={kneel}
              armF={kneel > 0.5 ? [90, 90] : t > 7.8 && t < 9.4 ? [110, 40] : t > 14 ? [100, 60] : [20, 150]} head={kneel > 0.3 ? 10 : rise > 0.5 ? -6 : 4} />
            {/* luz suave da cura */}
            {glow > 0 ? <circle cx={430} cy={760} r={240} fill="#FFF3C4" opacity={glow * 0.6} filter="url(#s6blur)" /> : null}
            <defs><filter id="s6blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40" /></filter></defs>
            {/* líderes questionando */}
            {leaders > 0 ? <g opacity={leaders} transform={`translate(${f((1 - leaders) * 120)} 0)`}>
              <Sil x={790} y={1110} s={1.35} face={-1} wear="turban" beard armF={[60, 70]} head={-6} color={INK} />
              <Sil x={930} y={1120} s={1.45} face={-1} wear="hat" beard armF={[30, 120]} head={4} color={INK} />
            </g> : null}
          </g>
        </svg>
        {/* coração da atenção entre Jesus e o homem */}
        {heart > 0.01 ? <div style={{ position: 'absolute', left: 400 - 60, top: 600 - 60 + 8 * Math.sin(t * 3), transform: `scale(${f(heart)})` }}><Icon name="heart" color="#E5484D" size={120} /></div> : null}
      </PageFrame>
      {/* contador de anos */}
      <Chip t={t} t0={4.65} t1={6.3} x={540} y={420} text={<><span style={{ fontSize: 80 }}>{Math.round(lerp(1, 38, sm((t - 4.7) / 0.7)))}</span> ANOS</>} bg="#6B3E2A" color="#FFF3D6" size={54} rot={-3} />
      <Bubble t={t} t0={7.15} t1={7.9} x={420} y={640}><Icon name="ear" color="#4A2A1A" size={64} /><span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 34, color: '#4A2A1A' }}>OUVIU</span></Bubble>
      <Bubble t={t} t0={7.85} t1={9.3} x={420} y={640}><Icon name="chat" color="#4A2A1A" size={64} /><span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 34, color: '#4A2A1A' }}>FALOU COM ELE</span></Bubble>
      <Bubble t={t} t0={11.7} t1={13.6} x={850} y={760} tail="r"><span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 64, color: '#4A2A1A' }}>?!</span></Bubble>
      <Chip t={t} t0={12.95} t1={13.7} x={760} y={420} text="SÁBADO" bg="#6B3E2A" color="#FFF3D6" size={50} rot={3} />
      <Chip t={t} t0={14.65} t1={17.4} x={540} y={420} text={<>ATENÇÃO <span style={{ color: PAL.yellow }}>À PESSOA</span></>} bg={PAL.navy} size={52} rot={-2} />
      <Burst t={t} t0={9.6} x={470} y={950} color="#FFE9A8" r={260} />
      {/* o que podemos aprender? */}
      {t > 17.6 ? <div style={{ position: 'absolute', inset: 0, background: `rgba(25,12,60,${f(0.55 * sm((t - 17.6) / 0.5))})` }}>
        <div style={{ position: 'absolute', left: 390, top: 560, width: 300, height: 300, transform: `scale(${f(clamp(outBack((t - 17.8) / 0.5), 0, 1.2))}) rotate(${f(Math.sin(t * 3) * 5)}deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 150, background: PAL.yellow, border: `10px solid ${PAL.deep}`, boxShadow: `0 14px 0 ${PAL.deep}` }}>
          <Icon name="idea" color={PAL.navy} size={200} />
        </div>
        <Burst t={t} t0={19.0} x={540} y={710} r={300} />
      </div> : null}
      <BibleOpen t={t} ref_="JOÃO 5:1-18" />
    </div>
  );
};
