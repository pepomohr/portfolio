'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import DustyMorning from './DustyMorning';
import RainyWindow from './RainyWindow';

export default function BackgroundScene() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evita el flash de tema incorrecto: next-themes recién sabe el tema real
  // (viene de localStorage) después del primer render en el cliente.
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isLight = resolvedTheme === 'light';

  return (
    <AnimatePresence initial={false}>
      {isLight ? (
        <motion.div key="dusty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
          <DustyMorning />
        </motion.div>
      ) : (
        <motion.div key="rainy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
          <RainyWindow />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
