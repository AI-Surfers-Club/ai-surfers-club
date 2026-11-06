import type { ReactNode } from 'react';
import { HeroWave } from './hero-wave';

type Props = {
  title: ReactNode;
  /** 오른쪽 자리(검색 등) */
  side?: ReactNode;
  korean?: boolean;
  /** 제목 위 작은 줄 (예: ← 전체 서비스) */
  eyebrow?: ReactNode;
  /** 제목 왼쪽에 붙는 것 (예: 작성자 프로필 티켓) */
  badge?: ReactNode;
};

/** 홈 히어로: 파도 배경 + 제목 + 오른쪽 자리(검색 등) */
export function Hero({ title, side, korean = false, eyebrow, badge }: Props) {
  return (
    <section className={`hero${eyebrow ? ' compact' : ''}`}>
      <HeroWave />
      <div className="hero-title">
        {eyebrow}
        {badge ? (
          <div className="hero-title-row">
            {badge}
            <h1 className={korean ? 'serif ko' : 'serif'}>{title}</h1>
          </div>
        ) : (
          <h1 className={korean ? 'serif ko' : 'serif'}>{title}</h1>
        )}
      </div>
      {side}
    </section>
  );
}
