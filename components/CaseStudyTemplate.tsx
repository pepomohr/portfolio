'use client';

import { useRouter } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';
import MagneticButton from './MagneticButton';

interface CaseStudyProps {
  title: string;
  challenge: string;
  solution: string;
  stack: string[];
  impact: string;
}

const titleContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.15 },
  },
};

const wordVariant: Variants = {
  hidden: { opacity: 0, y: 32, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const sectionVariant: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <motion.section
      variants={sectionVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      className="border-t border-white/10 py-14"
    >
      <h2 className="text-sm font-medium uppercase tracking-[0.3em] text-white/40">{label}</h2>
      <div className="mt-6 max-w-3xl text-lg leading-relaxed text-white/80 sm:text-xl">
        {children}
      </div>
    </motion.section>
  );
}

export default function CaseStudyTemplate({ title, challenge, solution, stack, impact }: CaseStudyProps) {
  const router = useRouter();
  const words = title.split(' ');

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto w-full max-w-6xl px-6 py-24"
    >
      <MagneticButton
        onClick={() => router.push('/')}
        className="mb-16 rounded-full border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-medium text-white/70 hover:text-white"
      >
        ← Volver al inicio
      </MagneticButton>

      <motion.h1
        variants={titleContainer}
        initial="hidden"
        animate="visible"
        className="text-4xl font-medium leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl"
      >
        {words.map((word, i) => (
          <motion.span key={i} variants={wordVariant} className="mr-4 inline-block">
            {word}
          </motion.span>
        ))}
      </motion.h1>

      <Section label="El Desafío">
        <p>{challenge}</p>
      </Section>

      <Section label={`La Solución (Stack: ${stack.join(', ')})`}>
        <p>{solution}</p>
      </Section>

      <Section label="El Impacto">
        <p>{impact}</p>
      </Section>
    </motion.main>
  );
}
