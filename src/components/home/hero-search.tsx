'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/** 히어로 오른쪽 아래 밑줄 검색칸. 입력이 멈추면 주소의 ?q= 를 바꾼다 */
export function HeroSearch({ initial }: { initial: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [value, setValue] = useState(initial);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => {
      const p = new URLSearchParams(sp.toString());
      if (value.trim()) p.set('q', value.trim());
      else p.delete('q');
      const s = p.toString();
      router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
    }, 250);
    return () => clearTimeout(t);
    // sp는 일부러 빼둔다: 입력할 때만 주소를 바꾼다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <label className="hero-search">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" aria-hidden="true">
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="M15.5 15.5L21 21" />
      </svg>
      <input
        className="search"
        type="search"
        placeholder="어떤 AI 서비스를 찾고 있나요?"
        aria-label="서비스 이름이나 소개로 검색"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </label>
  );
}
