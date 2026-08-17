'use client';

import { useRef } from 'react';
import type { MouseEvent } from 'react';
import { motion, useScroll, useTransform, type Variants } from 'framer-motion';
import { useLenis } from 'lenis/react';
import MagneticButton from '@/components/MagneticButton';
import ProjectGrid from '@/components/ProjectGrid';

const EASE = [0.16, 1, 0.3, 1] as const;

const titleContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const titleLine: Variants = {
  hidden: { opacity: 0, y: 64 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
};

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: EASE, delay },
});

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const lenis = useLenis();

  // A medida que el Hero sale de pantalla, se desvanece y sube levemente:
  // evita el "corte" abrupto hacia el ProjectGrid.
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -80]);

  function scrollToProjects(e: MouseEvent<HTMLButtonElement>) {
    // Cancela cualquier comportamiento nativo del navegador (salto instantáneo)
    // antes de que Lenis tome el control del scroll.
    e.preventDefault();
    // Mismo motor lerp que el resto del sitio, pero mucho más lento (0.04 vs.
    // el 0.1 base) para un deslizamiento bien dramático y pausado al hacer click.
    lenis?.scrollTo('#proyectos', { lerp: 0.04 });
  }

  return (
    <>
      <section
        ref={heroRef}
        className="relative flex h-screen flex-col items-center justify-center px-6 text-center"
      >
        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="flex flex-col items-center">
          <motion.h1
            variants={titleContainer}
            initial="hidden"
            animate="visible"
            className="text-[13vw] font-medium leading-[0.95] tracking-tight text-white sm:text-[10vw] lg:text-[7.5rem]"
          >
            <motion.span variants={titleLine} className="block">
              Construyo
            </motion.span>
            <motion.span variants={titleLine} className="block text-white/40">
              software real.
            </motion.span>
          </motion.h1>

          <motion.p {...fadeUp(0.9)} className="mt-8 max-w-xl text-lg text-white/60 sm:text-xl">
            Construyo software a medida y experiencias web de alto impacto.
          </motion.p>

          <motion.div {...fadeUp(1.1)} className="mt-12">
            <MagneticButton
              onClick={scrollToProjects}
              className="rounded-full bg-white px-8 py-4 text-sm font-medium text-black"
            >
              Ver Proyectos
            </MagneticButton>
          </motion.div>
        </motion.div>

        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="absolute bottom-10 text-xs uppercase tracking-[0.3em] text-white/30"
        >
          Scroll
        </motion.span>
      </section>

      <div id="proyectos">
        <ProjectGrid />
      </div>
    </>
  );
}
