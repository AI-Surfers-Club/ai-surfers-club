'use client';

import { useEffect, useRef } from 'react';

/**
 * 히어로 배경 파도: 1.5px 파랑 선 7줄.
 * 마우스 가로 위치에 마루가 솟고, 아래쪽일수록 높게, 빨리 움직이면 크게 출렁이다 잦아든다.
 * 마우스가 없으면 잔잔히 일렁이고, 동작 줄이기 설정이면 멈춘 파도만 그린다.
 */
export function HeroWave() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // 색은 토큰(CSS 변수)에서 읽는다
    const color = getComputedStyle(canvas).getPropertyValue('--color-blue').trim() || 'currentColor';
    const w = { x: 0.5, tx: 0.5, lift: 0, tlift: 0, energy: 0, lastX: null as number | null, t: 0 };
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      w.tx = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      w.tlift = inside ? 0.45 + 0.55 * Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)) : 0;
      if (inside && w.lastX !== null) w.energy = Math.min(1.6, w.energy + Math.abs(e.clientX - w.lastX) / 260);
      w.lastX = inside ? e.clientX : null;
    };

    const draw = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const cw = canvas.clientWidth, ch = canvas.clientHeight;
      if (canvas.width !== Math.round(cw * dpr) || canvas.height !== Math.round(ch * dpr)) {
        canvas.width = Math.round(cw * dpr);
        canvas.height = Math.round(ch * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);
      if (!reduce) {
        w.x += (w.tx - w.x) * 0.07;
        w.lift += (w.tlift - w.lift) * 0.05;
        w.energy *= 0.96;
        w.t += 0.016;
      }
      const lines = 7, spread = 0.11 + w.energy * 0.04;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      for (let i = 0; i < lines; i++) {
        const k = i / (lines - 1);
        const base = ch * (0.42 + k * 0.5);
        const swell = (46 - k * 26) * (w.lift + w.energy * 0.5);
        ctx.beginPath();
        for (let x = 0; x <= cw + 4; x += 4) {
          const d = x / cw - w.x;
          const crest = Math.exp(-(d * d) / (2 * spread * spread)) * swell;
          const ripple = Math.sin(x * 0.011 - w.t * (1.2 + k * 0.5) + i * 0.8) * (3 + k * 5 + w.energy * 6)
            + Math.sin(x * 0.027 + w.t * 0.9 + i) * (1.5 + w.energy * 3);
          const y = base - crest + ripple;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.globalAlpha = 0.08 + k * 0.22;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      if (!reduce) raf = requestAnimationFrame(draw);
    };

    document.addEventListener('mousemove', onMove, { passive: true });
    draw();
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('mousemove', onMove);
    };
  }, []);

  return <canvas ref={ref} className="hero-wave" aria-hidden="true" />;
}
