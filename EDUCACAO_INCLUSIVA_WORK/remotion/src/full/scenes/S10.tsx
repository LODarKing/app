// CENA 10 (160,60–180,00): o seu clube é inclusivo? Observar barreiras, propor melhorias, apresentar à diretoria.
// A rampa (inclinação 8,33%, corrimãos duplos e guia de balizamento) é construída e o Theo sobe sozinho até a sede.
// "Inclusão não é apenas receber alguém, é garantir que essa pessoa participe." Tela final.
import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { SetBack, SetFront, Cam, camT, stairsProfile, PORCH_Y } from '../../scene/Clubhouse';
import { FrontKid } from '../../chars/FrontKid';
import { GABRIEL, GIRL } from '../../chars/rigs';
import { Theo } from '../../chars/Theo';
import { kidPose, theoRoll, expr, THEO_S, GAB_S, GIRL_S } from '../acting';
import { Chip, Card, Icon, Burst, Stamp, Confetti, TitleBurst, PAL, FONT } from '../fx';
import { keys, ss, sm, outBack } from '../../lib/anim';
import { clamp, lerp, f } from '../../lib/paths';

const RAMP_TOP = 610, SLOPE = 0.0833, RAMP_RUN = -PORCH_Y / SLOPE, RAMP_BOT = RAMP_TOP - RAMP_RUN;   // ≈ -2319
const rampY = (x: number) => x <= RAMP_BOT ? 0 : x >= RAMP_TOP ? PORCH_Y : -SLOPE * (x - RAMP_BOT);
const ANG = Math.atan(SLOPE) * 180 / Math.PI;
const CM = 4;   // px por cm (degrau de 61 px ≈ 15 cm)

const Ramp: React.FC<{ k: number }> = ({ k }) => {
  if (k <= 0) return null;
  const xr = lerp(RAMP_BOT, RAMP_TOP + 40, k);
  const top = (x: number) => rampY(x);
  const posts = [];
  for (let x = RAMP_BOT + 60; x < RAMP_TOP; x += 300) posts.push(x);
  return (
    <g>
      <defs><clipPath id="rampReveal"><rect x={RAMP_BOT - 60} y={-1200} width={xr - RAMP_BOT + 60} height={1400} /></clipPath></defs>
      <g clipPath="url(#rampReveal)">
        {/* corpo da rampa (concreto) com a lateral visível */}
        <path d={`M${RAMP_BOT} 0 L${RAMP_TOP} ${PORCH_Y} L${RAMP_TOP + 40} ${PORCH_Y} L${RAMP_TOP + 40} 0 Z`} fill="#D9D3C6" stroke="#8E887C" strokeWidth={3.5} strokeLinejoin="round" />
        <path d={`M${RAMP_BOT} 0 L${RAMP_TOP} ${PORCH_Y} L${RAMP_TOP} ${PORCH_Y + 18} L${RAMP_BOT + 210} 0 Z`} fill="#EFECE6" />
        {/* piso tátil de alerta no início e no fim */}
        {[RAMP_BOT - 70, RAMP_TOP + 4].map((x, i) => <g key={i}>{Array.from({ length: 4 }, (_, j) => <circle key={j} cx={x + 10 + j * 14} cy={(i ? PORCH_Y : 0) - 4} r={4} fill="#F2C14E" />)}</g>)}
        {/* guia de balizamento (5 cm) */}
        <path d={`M${RAMP_BOT} ${-5 * CM} L${RAMP_TOP} ${PORCH_Y - 5 * CM}`} stroke="#B9B2A4" strokeWidth={8} />
        {/* corrimãos duplos (70 e 92 cm) */}
        {posts.map((x) => <line key={x} x1={x} y1={top(x)} x2={x} y2={top(x) - 92 * CM} stroke="#5F6B78" strokeWidth={12} strokeLinecap="round" />)}
        {[70, 92].map((h) => <g key={h}>
          <path d={`M${RAMP_BOT - 30} ${-h * CM} L${RAMP_TOP + 30} ${PORCH_Y - h * CM}`} stroke="#5F6B78" strokeWidth={12} strokeLinecap="round" />
          <path d={`M${RAMP_BOT - 30} ${-h * CM - 4} L${RAMP_TOP + 30} ${PORCH_Y - h * CM - 4}`} stroke="#9AA5B1" strokeWidth={4} strokeLinecap="round" />
        </g>)}
      </g>
    </g>
  );
};

export const S10: React.FC<{ t: number }> = ({ t }) => {
  // Theo: na base da escada até o corte; depois na base da rampa; sobe 10,2–14,6
  const theoX = (tt: number) => tt < 8.9 ? -60 : tt < 10.2 ? RAMP_BOT - 60 : lerp(RAMP_BOT - 60, 650, sm((tt - 10.2) / 4.4));
  const tx = theoX(t);
  const onRamp = tx > RAMP_BOT && tx < RAMP_TOP + 40;
  const exT = expr(t, { smile: [[0, 0.4], [3.0, 0.3], [5.0, 0.7], [10.0, 0.9]], open: [[0, 0.3], [2.5, 0.05], [5.2, 0.5], [10.2, 0.6], [14.6, 0.9]], worry: [[0, 0.3], [4.9, 0.3], [5.3, 0]], look: [[0, [3, -6]], [8.9, [3, -2]]] });
  const theo = theoRoll(t, theoX, { scale: THEO_S, y: rampY(tx), ex: exT, head: -3, lean: onRamp ? 6 : 2 });
  // câmera
  let cam: Cam;
  if (t < 8.9) {
    const c = keys<number[]>(t, [[0, [520, -470, 0.76]], [2.6, [520, -470, 0.78]], [3.2, [400, -250, 1.35]], [4.9, [420, -240, 1.4]], [5.4, [520, -470, 0.78]]]);
    cam = { x: c[0], y: c[1], zoom: c[2] };
  } else if (t < 10.2) {
    cam = { x: RAMP_BOT + 330 + 150 * sm((t - 8.9) / 1.3), y: -360, zoom: 0.92 };
  } else if (t < 14.9) {
    const follow = { x: tx + 260, y: rampY(tx) - 330, zoom: 0.92 };
    const b = sm((t - 10.2) / 0.6);
    cam = { x: lerp(RAMP_BOT + 480, follow.x, b), y: lerp(-360, follow.y, b), zoom: 0.92 };
  } else {
    const k = sm((t - 14.9) / 1.6);
    cam = { x: lerp(910, 700, k), y: lerp(-574, -620, k), zoom: lerp(0.92, 0.66, k) };
  }
  cam = { ...cam, x: cam.x + 4 * Math.sin(t * 0.7), y: cam.y + 3 * Math.sin(t * 0.9 + 1) };
  const rampK = sm((t - 8.95) / 1.1);
  const scan = t > 3.0 && t < 5.0;
  const exK = expr(t, { smile: [[0, 0.5], [5.0, 0.8], [14.4, 1.0]], open: [[0, 0.3], [14.4, 0.85]], look: [[0, [-6, 4]], [14.0, [-8, 2]]] });
  const kids = [
    <FrontKid key="g" rig={GIRL} id="s10g" pose={kidPose(t, { x: 870, y: PORCH_Y, scale: GIRL_S, phase: 1, skirt: true, hop: [14.5, 16.4], actions: [{ kind: 'present', side: 'L', t0: 6.5, t1: 8.7, angle: 70 }, { kind: 'wave', side: 'L', t0: 13.6, t1: 19.4 }], ex: exK })} />,
    <FrontKid key="k" rig={GABRIEL} id="s10k" pose={kidPose(t, { x: 1060, y: PORCH_Y, scale: GAB_S, hop: [14.65, 16.55], actions: [{ kind: 'think', side: 'R', t0: 4.9, t1: 6.6 }, { kind: 'wave', side: 'R', t0: 13.7, t1: 19.4 }], ex: exK })} />,
  ];
  const final = t > 14.85;
  return (
    <AbsoluteFill style={{ background: '#D4F1FB' }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <SetBack cam={cam} t={t + 20} />
        <g transform={camT(cam, 1)}>
          <Ramp k={rampK} />
          <ellipse cx={960} cy={PORCH_Y + 4} rx={200} ry={20} fill="#2A2410" opacity={0.25} filter="url(#blur8)" />
          {kids}
          <ellipse cx={tx + 70} cy={rampY(tx) + 4} rx={150} ry={20} fill="#2A2410" opacity={0.28} filter="url(#blur8)" />
          <g transform={onRamp ? `rotate(${f(-ANG)} ${f(tx)} ${f(rampY(tx))})` : undefined}><Theo pose={theo} id="s10t" /></g>
          {/* lupa sobre os degraus (observar barreiras) */}
          {scan ? <g transform={`translate(${f(lerp(250, 560, sm((t - 3.2) / 1.4)))} ${f(-150 - 30 * Math.sin(t * 3))}) scale(${f(clamp(outBack((t - 3.05) / 0.35), 0, 1.2) * (1 - ss((t - 4.8) / 0.2)))})`}>
            <circle r={110} fill="#BFE6F5" opacity={0.35} stroke={PAL.navy} strokeWidth={18} />
            <line x1={78} y1={78} x2={170} y2={170} stroke={PAL.navy} strokeWidth={28} strokeLinecap="round" />
          </g> : null}
          {t > 3.4 && t < 5.2 ? <path d={stairsProfile()} fill="none" stroke="#FF5A3C" strokeWidth={9} strokeLinejoin="round" opacity={0.6 + 0.4 * Math.sin(t * 8)} /> : null}
        </g>
        <SetFront cam={cam} t={t + 20} />
      </svg>
      {/* perguntas e passos */}
      <Chip t={t} t0={0.6} t1={2.9} x={540} y={330} text={<>O SEU <span style={{ color: PAL.yellow }}>CLUBE</span></>} size={60} rot={-3} />
      <Chip t={t} t0={2.3} t1={2.95} x={540} y={470} text="É INCLUSIVO?" bg={PAL.yellow} color={PAL.navy} size={70} rot={2} />
      <Chip t={t} t0={3.05} t1={5.0} x={540} y={330} text={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}><span style={{ background: '#fff', color: PAL.royal, borderRadius: 30, width: 56, height: 56, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>1</span> OBSERVE AS BARREIRAS</span>} bg={PAL.royal} size={44} />
      <Card t={t} t0={5.0} t1={6.55} x={540} y={760} w={760} h={520} from="down" rot={-2} bg="#1F4FA8">
        <div style={{ padding: 26, fontFamily: FONT, color: '#fff' }}>
          <div style={{ fontWeight: 900, fontSize: 40, display: 'flex', alignItems: 'center', gap: 14 }}><span style={{ background: '#fff', color: '#3FA34D', borderRadius: 30, width: 56, height: 56, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>2</span> PROPONHA MELHORIAS</div>
          <svg width={700} height={330} style={{ marginTop: 10 }}>
            {Array.from({ length: 14 }, (_, i) => <line key={`v${i}`} x1={i * 50} y1={0} x2={i * 50} y2={330} stroke="#FFFFFF" strokeOpacity={0.12} />)}
            {Array.from({ length: 7 }, (_, i) => <line key={`h${i}`} x1={0} y1={i * 50} x2={700} y2={i * 50} stroke="#FFFFFF" strokeOpacity={0.12} />)}
            <path d={`M30 280 L${f(30 + 600 * sm((t - 5.3) / 0.8))} ${f(280 - 120 * sm((t - 5.3) / 0.8))}`} stroke="#FFFFFF" strokeWidth={6} />
            <path d="M630 160 L680 160 L680 280" stroke="#FFFFFF" strokeWidth={6} fill="none" opacity={clamp((t - 5.9) / 0.2)} />
            <text x={330} y={190} fill={PAL.yellow} fontFamily={FONT} fontWeight={900} fontSize={44} opacity={clamp((t - 5.8) / 0.2)} transform="rotate(-11 330 190)">RAMPA • 8,33%</text>
            <g transform="translate(70 220)" opacity={clamp((t - 6.0) / 0.2)}><Icon name="wheelchair" size={56} /></g>
          </svg>
        </div>
      </Card>
      <Card t={t} t0={6.55} t1={8.8} x={540} y={760} w={720} h={460} from="right" rot={2}>
        <div style={{ padding: 30, fontFamily: FONT, color: PAL.navy }}>
          <div style={{ fontWeight: 900, fontSize: 40, display: 'flex', alignItems: 'center', gap: 14 }}><span style={{ background: PAL.orange, color: '#fff', borderRadius: 30, width: 56, height: 56, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>3</span> APRESENTE À DIRETORIA</div>
          {['Rampa de acesso à sede', 'Atividades para todos', 'Materiais acessíveis'].map((s, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 22, fontWeight: 800, fontSize: 34, opacity: clamp((t - 6.9 - i * 0.3) / 0.25) }}><span style={{ display: 'inline-flex', width: 44, height: 44, borderRadius: 10, background: '#3FA34D', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={32} /></span>{s}</div>)}
        </div>
      </Card>
      <Stamp t={t} t0={7.95} t1={8.8} x={680} y={930} text="APROVADO!" color="#3FA34D" rot={-10} size={60} />
      <Chip t={t} t0={9.0} t1={10.4} x={540} y={330} text={<>RAMPA <span style={{ color: PAL.yellow }}>ACESSÍVEL</span></>} bg={PAL.green} size={56} rot={-2} />
      <Chip t={t} t0={10.4} t1={12.0} x={540} y={330} text={<>NÃO É SÓ <span style={{ color: PAL.yellow }}>RECEBER</span></>} size={56} rot={-2} />
      <Chip t={t} t0={12.0} t1={14.8} x={540} y={330} text={<>É GARANTIR QUE <span style={{ color: PAL.yellow }}>PARTICIPE!</span></>} bg={PAL.green} size={50} rot={2} />
      <Burst t={t} t0={14.4} x={700} y={900} r={340} />
      <Confetti t={t} t0={14.5} ox={540} oy={900} n={110} />
      <Confetti t={t} t0={16.4} ox={300} oy={1000} n={60} />
      <Confetti t={t} t0={16.6} ox={800} oy={1000} n={60} />
      {/* tela final */}
      {final ? <>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(25,12,60,${f(0.55 * sm((t - 14.9) / 0.8))}) 0%, rgba(25,12,60,0) 45%)` }} />
        <TitleBurst t={t} t0={14.95} t1={99} lines={['SEJA VOCÊ', 'PARTE DESSA', 'MUDANÇA!']} accent={2} y={250} size={104} />
        {t > 16.8 ? <div style={{ position: 'absolute', left: 540 - 130, top: 1240, width: 260, height: 220, transform: `scale(${f(clamp(outBack((t - 16.9) / 0.5), 0, 1.2))}) rotate(${f((1 - clamp(outBack((t - 16.9) / 0.5))) * -360)}deg)`, filter: 'drop-shadow(0 10px 18px rgba(0,0,0,.35))' }}>
          <Img src={staticFile('emblema_recortado.png')} style={{ width: 260, height: 220, objectFit: 'contain' }} />
        </div> : null}
        <Chip t={t} t0={17.4} t1={99} x={540} y={1530} text={<>ESPECIALIDADE DE <span style={{ color: PAL.yellow }}>EDUCAÇÃO INCLUSIVA</span></>} size={36} />
        <Chip t={t} t0={17.7} t1={99} x={540} y={1620} text="SÉRIE ESPECIALIDADES DOS DESBRAVADORES" bg={PAL.yellow} color={PAL.navy} size={26} />
      </> : null}
    </AbsoluteFill>
  );
};
