'use client';

import { useEffect, useRef } from 'react';

const BACKGROUND = '#050505';

// Cuántas gotas por pixel² de pantalla, con un piso y techo para no reventar
// la performance en monitores grandes ni quedar vacío en mobile.
const DENSITY = 1 / 9000;
const MIN_DROPS = 90;
const MAX_DROPS = 260;

interface Bounds {
  width: number;
  height: number;
}

class RainDrop {
  x = 0;
  y = 0;
  length = 0;
  speed = 0;
  wind = 0;
  opacity = 0;
  lineWidth = 0;

  constructor(private bounds: Bounds, spawnAnywhere = false) {
    this.respawn(spawnAnywhere);
  }

  // Dos "especies" de gota: rápidas/opacas cayendo casi derecho, y
  // lentas/translúcidas resbalando con más ángulo — como en un vidrio real.
  respawn(spawnAnywhere: boolean) {
    const isFast = Math.random() > 0.55;

    this.wind = isFast ? 1.4 + Math.random() * 1.2 : 0.5 + Math.random() * 0.5;
    this.speed = isFast ? 7 + Math.random() * 6 : 1.8 + Math.random() * 2.2;
    this.length = isFast ? 16 + Math.random() * 12 : 6 + Math.random() * 8;
    this.opacity = isFast ? 0.1 + Math.random() * 0.08 : 0.03 + Math.random() * 0.05;
    this.lineWidth = isFast ? 1.2 : 0.8;

    // Nace un poco afuera de los bordes para que el viento no deje huecos visibles.
    this.x = Math.random() * (this.bounds.width + 300) - 150;
    this.y = spawnAnywhere ? Math.random() * this.bounds.height : -30;
  }

  update() {
    this.x += this.wind;
    this.y += this.speed;

    if (this.y > this.bounds.height + 20 || this.x > this.bounds.width + 150) {
      this.respawn(false);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const magnitude = Math.hypot(this.wind, this.speed);
    const ux = this.wind / magnitude;
    const uy = this.speed / magnitude;

    ctx.beginPath();
    ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
    ctx.lineWidth = this.lineWidth;
    ctx.moveTo(this.x - ux * this.length, this.y - uy * this.length);
    ctx.lineTo(this.x, this.y);
    ctx.stroke();
  }
}

export default function RainyWindow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const bounds: Bounds = { width: window.innerWidth, height: window.innerHeight };
    let drops: RainDrop[] = [];

    function seedDrops() {
      const count = Math.max(MIN_DROPS, Math.min(MAX_DROPS, Math.floor(bounds.width * bounds.height * DENSITY)));
      drops = Array.from({ length: count }, () => new RainDrop(bounds, true));
    }

    // El backing store se redimensiona según devicePixelRatio para que las
    // gotas no salgan borrosas ni estiradas; el espacio lógico (bounds, en
    // px CSS) es el que usan las gotas, así que reposicionar en resize no
    // las deforma — solo cambia dónde envuelven al llegar al borde.
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      bounds.width = window.innerWidth;
      bounds.height = window.innerHeight;
      canvas!.width = bounds.width * dpr;
      canvas!.height = bounds.height * dpr;
      canvas!.style.width = `${bounds.width}px`;
      canvas!.style.height = `${bounds.height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    seedDrops();
    window.addEventListener('resize', resize);

    let frameId: number;
    function tick() {
      ctx!.fillStyle = BACKGROUND;
      ctx!.fillRect(0, 0, bounds.width, bounds.height);

      for (const drop of drops) {
        drop.update();
        drop.draw(ctx!);
      }

      frameId = requestAnimationFrame(tick);
    }
    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 -z-[1] h-screen w-screen" />;
}
