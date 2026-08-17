'use client';

import { useState } from 'react';
import type { MouseEvent } from 'react';
import { AnimatePresence, LayoutGroup, motion, useMotionValue, useMotionTemplate } from 'framer-motion';
import ClinicalMicroDemo from './ClinicalMicroDemo';

type Category = 'Sistemas Complejos' | 'Presencia Digital' | 'Laboratorio de Código';

// 'featured' = tarjeta destacada 2x2. 'wide' = tarjeta angosta que cierra la fila. 'default' = 1x1.
type Variant = 'featured' | 'wide' | 'default';

interface Project {
  id: string;
  title: string;
  category: Category;
  variant: Variant;
  description?: string;
  stack?: string[];
}

const EASE = [0.16, 1, 0.3, 1] as const;

// Data real de los proyectos, agrupada por categoría. El orden importa: define cómo
// encaja cada tarjeta en la grilla (ver spanClasses) para que el Bento cierre sin huecos.
const projects: Project[] = [
  // Sistemas Complejos
  {
    id: 'ecosistema-clinico',
    title: 'Ecosistema Clínico',
    category: 'Sistemas Complejos',
    variant: 'featured',
    description:
      'Arquitectura integral de punta a punta. Incluye un sistema de gestión interno terminado, un e-commerce integrado que maneja picos de ventas, y una app móvil en desarrollo para la autogestión de turnos desde casa.',
    stack: ['React', 'Next.js', 'Supabase', 'Tailwind'],
  },
  { id: 'safety-dashboard', title: 'Safety Services (Dashboard & Portal)', category: 'Sistemas Complejos', variant: 'default' },
  { id: 'sistema-nutricion', title: 'Sistema de Nutrición (con lector de código de barras)', category: 'Sistemas Complejos', variant: 'default' },
  // Presencia Digital
  { id: 'safety-landing', title: 'Safety Services Landing (Migración a Next.js)', category: 'Presencia Digital', variant: 'default' },
  { id: 'divergent', title: 'Divergent (E-commerce de drops)', category: 'Presencia Digital', variant: 'default' },
  { id: 'forestagro', title: 'Forestagro (SEO/Landing)', category: 'Presencia Digital', variant: 'default' },
  // Laboratorio de Código
  { id: 'burako', title: 'Burako Online en React', category: 'Laboratorio de Código', variant: 'wide' },
];

// Con grid-cols-1 md:grid-cols-2 lg:grid-cols-3, esta combinación de spans llena
// exactamente 10 celdas a md (2x5) y 12 celdas a lg (3x4): sin huecos en ningún breakpoint.
const spanClasses: Record<Variant, string> = {
  featured: 'col-span-1 md:col-span-2 lg:col-span-2 md:row-span-2',
  wide: 'col-span-1 lg:col-span-3',
  default: 'col-span-1',
};

const categoryAccent: Record<Category, string> = {
  'Sistemas Complejos': 'text-emerald-300/70',
  'Presencia Digital': 'text-sky-300/70',
  'Laboratorio de Código': 'text-amber-300/70',
};

// Placeholder temporal para los proyectos que todavía no tienen description/stack propios.
const DEFAULT_DESCRIPTION = 'Resolución del problema y arquitectura.';
const DEFAULT_STACK = ['React', 'Next.js', 'Supabase', 'Tailwind'];

// El contenido tarda en aparecer (delay) hasta que la tarjeta casi terminó de
// crecer (el layout dura 0.6s), para que no se sienta como que aparece "de golpe"
// en medio de la expansión. Al cerrar, sale rápido y hacia arriba.
const expandedContentVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE, delay: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

function ProjectCard({
  project,
  isExpanded,
  onToggle,
}: {
  project: Project;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const glow = useMotionTemplate`radial-gradient(200px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.35), transparent 80%)`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ opacity: { duration: 0.7, ease: EASE }, y: { duration: 0.7, ease: EASE }, layout: { duration: 0.6, ease: EASE } }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onToggle}
      className={`group relative cursor-pointer rounded-3xl p-px ${isExpanded ? spanClasses.featured : spanClasses[project.variant]}`}
    >
      {/* Anillo de 1px que solo se ve en el borde: el panel interior tapa todo lo demás */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-500"
        style={{ background: glow, opacity: isHovered ? 1 : 0 }}
      />

      <motion.div
        layout
        className={`relative flex h-full w-full flex-col rounded-[calc(1.5rem-1px)] bg-[#111114] p-8 ${isExpanded ? 'min-h-[460px]' : 'min-h-[220px]'}`}
      >
        {isExpanded && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            aria-label="Cerrar"
            className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/50 transition-colors hover:border-white/30 hover:text-white sm:right-8 sm:top-8"
          >
            ✕
          </button>
        )}

        <span className={`text-xs font-medium uppercase tracking-[0.2em] ${categoryAccent[project.category]}`}>
          {project.category}
        </span>

        {!isExpanded && (
          <h3 className="mt-auto text-xl font-medium text-white sm:text-2xl">{project.title}</h3>
        )}

        {/* mode="popLayout": saca al elemento que sale del flujo (position: absolute)
            para que su exit no compita con el layout (resize) del panel padre —
            sin esto, el shrink de la tarjeta "gana" y el contenido corta de golpe. */}
        <AnimatePresence mode="popLayout">
          {isExpanded && (
            <motion.div
              key="expanded-content"
              variants={expandedContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="mt-6 grid flex-1 grid-cols-1 gap-8 md:grid-cols-2"
            >
              {/* Zona de Información */}
              <div className="flex flex-col">
                <h3 className="text-2xl font-medium text-white sm:text-3xl">{project.title}</h3>
                <p className="mt-4 max-w-md text-base leading-relaxed text-white/60 sm:text-lg">
                  {project.description ?? DEFAULT_DESCRIPTION}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {(project.stack ?? DEFAULT_STACK).map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Zona Visual / Micro-Demo */}
              <div className="min-h-[200px] rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                {project.id === 'ecosistema-clinico' ? (
                  <ClinicalMicroDemo />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-xs uppercase tracking-[0.2em] text-white/30">Micro-demo próximamente</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export default function ProjectGrid() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-24">
      <LayoutGroup>
        <motion.div layout className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isExpanded={expandedId === project.id}
              onToggle={() => setExpandedId((current) => (current === project.id ? null : project.id))}
            />
          ))}
        </motion.div>
      </LayoutGroup>
    </section>
  );
}
