'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type DemoState = 'idle' | 'loading' | 'success' | 'confirmed';

const EASE = [0.16, 1, 0.3, 1] as const;

// Mismo verde institucional que usa el sistema real de C427 (#16A34A / hover #15803D)
// para que la demo se sienta parte de la misma marca, no una maqueta genérica.
const BRAND = 'bg-[#16A34A] hover:bg-[#15803D]';

// Datos ficticios — nunca información real de pacientes.
const FAKE_PATIENT = {
  name: 'Carlos Mendoza',
  dni: '32.415.789',
  specialty: 'Cardiología',
  time: '16:30 hs',
  professional: 'Dra. Fernanda Ríos',
};

const stateVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25, ease: EASE } },
};

export default function ClinicalMicroDemo() {
  const [state, setState] = useState<DemoState>('idle');
  const [dni, setDni] = useState('');

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!dni.trim()) return;
    setState('loading');
    setTimeout(() => setState('success'), 1700);
  }

  function handleConfirm() {
    setState('confirmed');
    setTimeout(() => {
      setState('idle');
      setDni('');
    }, 1400);
  }

  return (
    // stopPropagation: la tarjeta padre colapsa al clickearse a sí misma;
    // sin esto, cualquier interacción acá adentro también la cerraría.
    <div className="flex h-full w-full flex-col justify-center" onClick={(e) => e.stopPropagation()}>
      {/* mode="popLayout" para que cada estado salga en paralelo, sin que el
          próximo estado espere ni la altura pegue un salto brusco. */}
      <AnimatePresence mode="popLayout">
        {state === 'idle' && (
          <motion.form
            key="idle"
            variants={stateVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onSubmit={handleSearch}
          >
            <label className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/40">
              Buscar paciente
            </label>
            <div className="mt-3 flex gap-2">
              <input
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                placeholder="Ingresar DNI del paciente..."
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-[#16A34A]/50"
              />
              <button
                type="submit"
                className={`shrink-0 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-colors ${BRAND}`}
              >
                Buscar
              </button>
            </div>
          </motion.form>
        )}

        {state === 'loading' && (
          <motion.div
            key="loading"
            variants={stateVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col gap-3"
          >
            <div className="flex items-center gap-3">
              <motion.div
                className="h-5 w-5 shrink-0 rounded-full border-2 border-white/10 border-t-[#16A34A]"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
              <span className="text-xs uppercase tracking-[0.2em] text-white/40">Buscando paciente...</span>
            </div>
            {/* Skeleton con la misma silueta que la card de resultado, para que
                el crecimiento de alto no dé un salto al pasar a 'success'. */}
            <div className="mt-2 h-4 w-2/3 animate-pulse rounded-full bg-white/10" />
            <div className="h-16 w-full animate-pulse rounded-xl bg-white/5" />
          </motion.div>
        )}

        {state === 'success' && (
          <motion.div key="success" variants={stateVariants} initial="hidden" animate="visible" exit="exit">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#16A34A]">
                Paciente encontrado
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/25">C427 · Sistema de Consultorio</span>
            </div>

            <p className="mt-3 text-lg font-semibold text-white">{FAKE_PATIENT.name}</p>
            <p className="text-xs text-white/40">DNI {FAKE_PATIENT.dni}</p>

            <div className="mt-4 flex items-center gap-4 rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex min-w-[64px] flex-col items-center justify-center rounded-lg bg-white/5 px-3 py-2">
                <span className="text-base font-bold text-[#16A34A]">{FAKE_PATIENT.time}</span>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-white">{FAKE_PATIENT.specialty}</p>
                <p className="text-xs text-white/40">{FAKE_PATIENT.professional}</p>
              </div>
              <span className="ml-auto rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold uppercase text-white">
                Confirmado
              </span>
            </div>

            <button
              type="button"
              onClick={handleConfirm}
              className={`mt-4 w-full rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg transition-colors ${BRAND}`}
            >
              ✓ Confirmar Asistencia
            </button>
          </motion.div>
        )}

        {state === 'confirmed' && (
          <motion.div
            key="confirmed"
            variants={stateVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-center justify-center gap-3 py-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#16A34A]/15 text-xl text-[#16A34A]"
            >
              ✓
            </motion.div>
            <p className="text-sm text-white/70">Asistencia confirmada</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
