'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

const EASE = [0.16, 1, 0.3, 1] as const;

// Cuánto se corre la luna fuera del botón para salir del todo del área
// visible (el botón la recorta con overflow-hidden) antes de deslizarse
// de vuelta al centro sobre el sol.
const MOON_OFFSET = 40;

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted ? resolvedTheme === 'dark' : true;

  function toggleTheme() {
    setTheme(isDark ? 'light' : 'dark');
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      disabled={!mounted}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className="fixed right-6 top-6 z-50 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-black/20 backdrop-blur-md transition-colors hover:border-white/25"
    >
      {/* Sol: siempre está ahí, la luna es la que entra y sale */}
      <span
        aria-hidden
        className="absolute h-[22px] w-[22px] rounded-full"
        style={{ background: 'radial-gradient(circle at 35% 35%, #fff8e1, #f5c26b)' }}
      />

      {/* Luna: se desliza sobre el sol y lo tapa casi entero, dejando solo
          un anillo de luz — el "eclipse". Un poco más chica que el sol
          a propósito, para que ese anillo quede parejo alrededor. */}
      <motion.span
        aria-hidden
        className="absolute h-[18px] w-[18px] rounded-full bg-[#050505]"
        initial={false}
        animate={{ x: isDark ? 0 : MOON_OFFSET }}
        transition={{ duration: 0.6, ease: EASE }}
      />
    </button>
  );
}
