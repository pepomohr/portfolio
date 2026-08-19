'use client';

import { useEffect } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import type { ReactNode } from 'react';

// El alto de la página cambia todo el tiempo acá (tarjetas del bento que se
// expanden/colapsan, el fondo que cruza entre RainyWindow/DustyMorning,
// fuentes que terminan de cargar). Lenis calcula su límite máximo de scroll
// a partir del alto del documento, y si el contenido crece sin que se entere,
// la rueda del mouse se clava en ese límite viejo apenas lo alcanza — aunque
// arrastrar el scrollbar nativo (que no pasa por Lenis) siga funcionando
// bien. Este observer lo mantiene sincronizado ante cualquier cambio de alto,
// sin importar qué lo haya causado.
function LenisResizeSync() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    const observer = new ResizeObserver(() => lenis.resize());
    observer.observe(document.body);

    return () => observer.disconnect();
  }, [lenis]);

  return null;
}

export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        // lerp (no duration/easing): Lenis re-anima con `duration`/`easing` en CADA
        // tick de rueda, lo que se siente "tosco" en scrolls continuos. `lerp` en
        // cambio amortigua frame a frame — esa es la física continua que da la
        // sensación fluida. duration/easing quedan solo para el scrollTo puntual
        // del botón "Ver Proyectos".
        lerp: 0.1,
        smoothWheel: true,
      }}
    >
      <LenisResizeSync />
      {children}
    </ReactLenis>
  );
}
