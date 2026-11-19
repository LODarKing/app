import React, { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';
import { FONTS } from '../config/brand';

let loading: Promise<void> | null = null;

const loadAll = (): Promise<void> => {
  if (!loading) {
    const t = FONTS.titulo;
    const i = FONTS.interface;
    const faces = [
      new FontFace(t.family, `url(${staticFile(t.file)}) format('woff2')`, {
        weight: t.weightRange,
        stretch: t.stretchRange,
      }),
      new FontFace(i.family, `url(${staticFile(i.file)}) format('woff2')`, {
        weight: i.weightRange,
      }),
    ];
    loading = Promise.all(
      faces.map((f) =>
        f.load().then((loaded) => {
          (document.fonts as unknown as Set<FontFace>).add(loaded);
        }),
      ),
    ).then(() => undefined);
  }
  return loading;
};

/**
 * Só desenha os filhos depois que as duas fontes carregaram.
 * O render espera (delayRender), então nenhum quadro sai com fonte substituta.
 */
export const FontGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('Carregando fontes'));
  useEffect(() => {
    loadAll()
      .then(() => {
        setReady(true);
        continueRender(handle);
      })
      .catch((err) => {
        // Sem fonte não há vinheta: falha alto em vez de renderizar com fonte errada.
        throw err;
      });
  }, [handle]);
  return ready ? <>{children}</> : null;
};
