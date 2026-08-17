'use client';

import { useRef } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  /** Radio (en px) del "campo magnético" alrededor del botón que empieza a atraerlo. */
  radius?: number;
  /** Fracción del desplazamiento del cursor que el botón realmente recorre (0-1). */
  strength?: number;
}

// Resorte suave: masa baja + damping alto = sigue al cursor sin oscilar ni sentirse gomoso.
const SPRING_CONFIG = { stiffness: 150, damping: 15, mass: 0.1 };

export default function MagneticButton({
  children,
  className = '',
  onClick,
  radius = 80,
  strength = 0.35,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, SPRING_CONFIG);
  const springY = useSpring(y, SPRING_CONFIG);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    const distance = Math.hypot(distanceX, distanceY);

    if (distance > radius) {
      x.set(0);
      y.set(0);
      return;
    }

    x.set(distanceX * strength);
    y.set(distanceY * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ padding: radius / 2 }}
      className="inline-flex"
    >
      <motion.button
        ref={ref}
        onClick={onClick}
        style={{ x: springX, y: springY }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: 'spring', ...SPRING_CONFIG }}
        className={className}
      >
        {children}
      </motion.button>
    </div>
  );
}
