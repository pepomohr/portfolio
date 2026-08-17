'use client';

import { ReactLenis } from 'lenis/react';
import type { ReactNode } from 'react';

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
      {children}
    </ReactLenis>
  );
}
