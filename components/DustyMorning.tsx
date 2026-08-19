'use client';

import { useEffect, useRef } from 'react';

const BG_TOP = '#fdfbf7';
const BG_BOTTOM = '#f4f1eb';

// Cuántas partículas por pixel² de pantalla, con piso/techo para no reventar
// la performance en monitores grandes ni quedar vacío en mobile.
const DENSITY = 1 / 4000;
const MIN_PARTICLES = 150;
const MAX_PARTICLES = 500;

const REPEL_RADIUS = 120;
const REPEL_STRENGTH = 1.4;
// Qué tan rápido la velocidad "empujada" se relaja de vuelta al flotar
// ambiente — bajo = brisa que se disipa despacio, alto = corrección brusca.
const RETURN_LERP = 0.04;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

interface Bounds {
  width: number;
  height: number;
}

interface Mouse {
  x: number;
  y: number;
  active: boolean;
}

class DustParticle {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  radius = 0;
  opacity = 0;
  phaseX = 0;
  phaseY = 0;
  freqX = 0;
  freqY = 0;
  amplitude = 0;
  baseSpeedX = 0;
  baseSpeedY = 0;

  constructor(private bounds: Bounds) {
    this.respawn();
  }

  respawn() {
    this.x = Math.random() * this.bounds.width;
    this.y = Math.random() * this.bounds.height;
    this.radius = 0.6 + Math.random() * 1.4; // ~1.2-4px de diámetro
    this.opacity = 0.35 + Math.random() * 0.45;

    // Movimiento senoidal con fase/frecuencia propias por partícula, para
    // que la deriva no se sienta lineal ni sincronizada entre partículas.
    this.phaseX = Math.random() * Math.PI * 2;
    this.phaseY = Math.random() * Math.PI * 2;
    this.freqX = 0.15 + Math.random() * 0.25;
    this.freqY = 0.15 + Math.random() * 0.25;
    this.amplitude = 0.15 + Math.random() * 0.25;

    // Deriva ambiente lenta (el polvo tiende a subir apenas, como iluminado
    // a contraluz), sobre la que se monta la oscilación senoidal.
    this.baseSpeedX = (Math.random() - 0.5) * 0.15;
    this.baseSpeedY = -0.05 - Math.random() * 0.1;

    this.vx = this.baseSpeedX;
    this.vy = this.baseSpeedY;
  }

  update(time: number, mouse: Mouse) {
    const driftVX = this.baseSpeedX + Math.sin(time * this.freqX + this.phaseX) * this.amplitude;
    const driftVY = this.baseSpeedY + Math.cos(time * this.freqY + this.phaseY) * this.amplitude;

    if (mouse.active) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist < REPEL_RADIUS && dist > 0.01) {
        const force = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH;
        this.vx += (dx / dist) * force;
        this.vy += (dy / dist) * force;
      }
    }

    // La brisa es un empujón puntual sobre vx/vy; cada frame la velocidad
    // relaja (lerp) de vuelta hacia la deriva ambiente en vez de cortar seco.
    this.vx = lerp(this.vx, driftVX, RETURN_LERP);
    this.vy = lerp(this.vy, driftVY, RETURN_LERP);

    this.x += this.vx;
    this.y += this.vy;

    const margin = 20;
    if (this.x < -margin) this.x = this.bounds.width + margin;
    if (this.x > this.bounds.width + margin) this.x = -margin;
    if (this.y < -margin) this.y = this.bounds.height + margin;
    if (this.y > this.bounds.height + margin) this.y = -margin;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.fillStyle = `rgba(180, 150, 100, ${this.opacity})`;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

export default function DustyMorning() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const bounds: Bounds = { width: window.innerWidth, height: window.innerHeight };
    const mouse: Mouse = { x: bounds.width / 2, y: bounds.height / 2, active: false };
    let particles: DustParticle[] = [];
    let gradient: CanvasGradient;

    function seedParticles() {
      const count = Math.max(
        MIN_PARTICLES,
        Math.min(MAX_PARTICLES, Math.floor(bounds.width * bounds.height * DENSITY))
      );
      particles = Array.from({ length: count }, () => new DustParticle(bounds));
    }

    function buildGradient() {
      gradient = ctx!.createLinearGradient(0, 0, 0, bounds.height);
      gradient.addColorStop(0, BG_TOP);
      gradient.addColorStop(1, BG_BOTTOM);
    }

    // Mismo criterio que RainyWindow: backing store según devicePixelRatio,
    // coordenadas lógicas en px CSS para que nada se deforme al redimensionar.
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      bounds.width = window.innerWidth;
      bounds.height = window.innerHeight;
      canvas!.width = bounds.width * dpr;
      canvas!.height = bounds.height * dpr;
      canvas!.style.width = `${bounds.width}px`;
      canvas!.style.height = `${bounds.height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGradient();
    }

    function handleMouseMove(e: MouseEvent) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    }

    function handleMouseLeave() {
      mouse.active = false;
    }

    resize();
    seedParticles();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    let time = 0;
    let frameId: number;
    function tick() {
      time += 0.016;

      ctx!.fillStyle = gradient;
      ctx!.fillRect(0, 0, bounds.width, bounds.height);

      for (const particle of particles) {
        particle.update(time, mouse);
        particle.draw(ctx!);
      }

      frameId = requestAnimationFrame(tick);
    }
    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 -z-[1] h-screen w-screen" />;
}
