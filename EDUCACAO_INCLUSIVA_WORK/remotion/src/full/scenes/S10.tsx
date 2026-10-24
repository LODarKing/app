import React from 'react';
import { MotionBG } from '../fx';
export const S10: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0 }}>
    <MotionBG t={t} c1="#2851D8" c2="#190C3C" />
    <div style={{ position: 'absolute', top: 800, width: 1080, textAlign: 'center', fontFamily: 'Poppins', fontWeight: 900, fontSize: 90, color: '#fff' }}>CENA 10</div>
  </div>
);
