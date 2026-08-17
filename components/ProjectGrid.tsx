'use client';

import { useState } from 'react';
import type { MouseEvent } from 'react';
import { AnimatePresence, LayoutGroup, motion, useMotionValue, useMotionTemplate } from 'framer-motion';

type Category = 'Sistemas Complejos' | 'Presencia Digital' | 'Laboratorio de Código';

// 'featured' = tarjeta destacada 2x2. 'wide' = tarjeta angosta que cierra la fila. 'default' = 1x1.
type Variant = 'featured' | 'wide' | 'default';

interface Project {
  id: string;
  title: string;
  category: Category;
  variant: Variant;
}

const EASE = [0.16, 1, 0.3, 1] as const;

// Data real de los proyectos, agrupada por categoría. El orden importa: define cómo
// encaja cada tarjeta en la grilla (ver spanClasses) para que el Bento cierre sin huecos.
const projects: Project[] = [
  // Sistemas Complejos
  { id: 'ecosistema-clinico', title: 'Ecosistema Clínico (Sistema, E-commerce, App)', category: 'Sistemas Complejos', variant: 'featured' },
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
        className={`relative flex h-full w-full flex-col rounded-[calc(1.5rem-1px)] bg-[#111114] p-8 ${isExpanded ? 'min-h-[320px]' : 'min-h-[220px]'}`}
      >
        <div className="flex items-start justify-between">
          <span className={`text-xs font-medium uppercase tracking-[0.2em] ${categoryAccent[project.category]}`}>
            {project.category}
          </span>

          {isExpanded && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              aria-label="Cerrar"
              className="text-white/40 transition-colors hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        <h3
          className={`font-medium text-white transition-[margin,font-size] duration-300 ${
            isExpanded ? 'mt-6 text-3xl sm:text-4xl' : 'mt-auto text-xl sm:text-2xl'
          }`}
        >
          {project.title}
        </h3>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="overflow-hidden"
            >
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
                Contenido del preview.
              </p>
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
