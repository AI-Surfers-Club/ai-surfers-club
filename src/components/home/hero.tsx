import type { ReactNode } from 'react';
import { HeroWave } from './hero-wave';

/** 홈 히어로: 파도 배경 + 제목 + 오른쪽 자리(검색 등) */
export function Hero({ title, side, korean = false }: { title: ReactNode; side?: ReactNode; korean?: boolean }) {
  return (
    <section className="hero">
      <HeroWave />
      <h1 className={korean ? 'serif ko' : 'serif'}>{title}</h1>
      {side}
    </section>
  );
}
