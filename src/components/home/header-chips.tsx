'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Chip = { label: string; href: string; on: boolean };

/**
 * 스크롤해서 툴바가 헤더 뒤로 지나가면, 헤더 로고 오른쪽에 필터 칩만 작게 보인다.
 * 640px 미만에서는 헤더 바로 아래 한 줄 띠. 누르면 목록이 걸러지고 목록 맨 위로 간다.
 */
export function HeaderChips({ chips }: { chips: Chip[] }) {
  const router = useRouter();
  const [shown, setShown] = useState(false);
  const [box, setBox] = useState<{ left: number; right: number }>({ left: 240, right: 320 });

  useEffect(() => {
    const toolbar = document.getElementById('home-toolbar');
    const measure = () => {
      const logo = document.querySelector('.site-header .logo')?.getBoundingClientRect();
      const nav = document.querySelector('.site-header .nav')?.getBoundingClientRect();
      if (logo && nav) setBox({ left: logo.right + 24, right: window.innerWidth - nav.left + 24 });
    };
    const onScroll = () => {
      if (!toolbar) return;
      setShown(toolbar.getBoundingClientRect().bottom <= 60);
    };
    measure();
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
    };
  }, []);

  const pick = (href: string) => {
    router.push(href, { scroll: false });
    const grid = document.querySelector('[data-testid="service-grid"]') as HTMLElement | null;
    const offset = window.innerWidth < 640 ? 110 : 70;
    if (grid) window.scrollTo({ top: grid.getBoundingClientRect().top + window.scrollY - offset });
  };

  return (
    <div
      className={`hchips${shown ? ' shown' : ''}`}
      style={{ ['--hchips-left' as string]: `${box.left}px`, ['--hchips-right' as string]: `${box.right}px` }}
      aria-hidden={!shown}
      data-testid="header-chips"
    >
      {chips.map((c) => (
        <button key={c.href + c.label} type="button" className={`chip${c.on ? ' on' : ''}`} tabIndex={shown ? 0 : -1} onClick={() => pick(c.href)}>
          {c.label}
        </button>
      ))}
    </div>
  );
}
