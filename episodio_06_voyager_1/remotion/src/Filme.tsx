import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { criar } from '../../componentes_animacao/filme';

type Motor = Awaited<ReturnType<typeof criar>>;
export const Filme: React.FC<{ audio: string; legenda: boolean }> = ({ audio, legenda }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const ref = useRef<HTMLCanvasElement>(null);
  const [motor, setMotor] = useState<Motor | null>(null);
  const [h] = useState(() => delayRender('carregando fontes, texturas e modelo 3D'));
  useEffect(() => {
    criar(ref.current!, { fontes: staticFile('fonts'), texturas: staticFile('assets/nasa'), legenda }).then((m) => { setMotor(m); continueRender(h); });
  }, []);
  useLayoutEffect(() => { if (motor) motor.seek(frame / fps); }, [motor, frame, fps]);
  return (
    <AbsoluteFill style={{ backgroundColor: '#090E1A' }}>
      <canvas ref={ref} width={1080} height={1920} style={{ width: 1080, height: 1920 }} />
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};
