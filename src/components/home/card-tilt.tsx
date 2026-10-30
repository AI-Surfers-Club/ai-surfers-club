'use client';

import { useRef, type ReactNode } from 'react';

/** 시안의 카드 기울임: 마우스를 따라 살짝 3D로 기운다 (동작 줄이기면 끔) */
export function CardTilt({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current?.firstElementChild as HTMLElement | null;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    const rx = (e.clientY - r.top - r.height / 2) / 30;
    const ry = (r.width / 2 - (e.clientX - r.left)) / 30;
    el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
  };
  const onLeave = () => {
    const el = ref.current?.firstElementChild as HTMLElement | null;
    if (el) el.style.transform = '';
  };
  return <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{ display: 'contents' }}>{children}</div>;
}
