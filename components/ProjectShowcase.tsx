'use client';

import { useState } from 'react';
import type { MouseEvent } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';

interface ProjectShowcaseProps {
  images?: string[];
}

const EASE = [0.16, 1, 0.3, 1] as const;

// SVG inline en vez de un servicio externo: cero dependencia de red y queda
// claro que es un placeholder temporal a reemplazar por capturas reales.
function placeholderImage(label: string, hue: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="100%" height="100%" fill="hsl(${hue} 35% 13%)"/><text x="50%" y="50%" font-family="sans-serif" font-size="26" fill="hsla(0,0%,100%,0.35)" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const DEFAULT_IMAGES = [
  placeholderImage('Vista 1 — Dashboard', 158),
  placeholderImage('Vista 2 — Agenda', 205),
  placeholderImage('Vista 3 — Reportes', 258),
];

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -40 : 40, opacity: 0 }),
};

export default function ProjectShowcase({ images = DEFAULT_IMAGES }: ProjectShowcaseProps) {
  const [[index, direction], setSlide] = useState<[number, number]>([0, 0]);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 200, damping: 20 });

  function paginate(step: number) {
    setSlide(([current]) => [(current + step + images.length) % images.length, step]);
  }

  function goTo(target: number) {
    setSlide(([current]) => [target, target > current ? 1 : -1]);
  }

  // Tilt 3D sutil: la rotación es proporcional a qué tan lejos del centro está
  // el cursor, con un tope bajo (±4°) para que se sienta como flotar, no girar.
  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent<HTMLDivElement>) {
    const rect = currentTarget.getBoundingClientRect();
    const px = (clientX - rect.left) / rect.width - 0.5;
    const py = (clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * 8);
    rotateX.set(py * -8);
  }

  function handleMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ perspective: 800 }}
        className="group relative flex-1"
      >
        <motion.div
          style={{ rotateX: springRotateX, rotateY: springRotateY, transformStyle: 'preserve-3d' }}
          whileHover={{ scale: 1.015 }}
          transition={{ scale: { duration: 0.4, ease: EASE } }}
          className="relative h-full w-full overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0c] shadow-2xl"
        >
          {/* Barra estilo macOS: simula la ventana de una app/navegador */}
          <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/[0.03] px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>

          <div className="relative aspect-[16/10] w-full overflow-hidden">
            <AnimatePresence custom={direction} initial={false}>
              <motion.img
                key={index}
                src={images[index]}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: EASE }}
                alt={`Captura ${index + 1} de ${images.length}`}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>
          </div>
        </motion.div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                paginate(-1);
              }}
              aria-label="Captura anterior"
              className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white/70 opacity-0 backdrop-blur transition-opacity hover:text-white group-hover:opacity-100"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                paginate(1);
              }}
              aria-label="Captura siguiente"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white/70 opacity-0 backdrop-blur transition-opacity hover:text-white group-hover:opacity-100"
            >
              ›
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goTo(i);
              }}
              aria-label={`Ir a la captura ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-5 bg-white/70' : 'w-1.5 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
