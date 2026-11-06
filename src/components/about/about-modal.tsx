'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, type ReactNode } from 'react';
import './about.css';

/** About Us 팝업: 지금 화면 위에 떠오른다. ×·Esc·바깥 클릭·뒤로가기로 닫으면 보던 화면 그대로 */
export function AboutModal({ children }: { children: ReactNode }) {
  const router = useRouter();
  const panel = useRef<HTMLDivElement>(null);
  const close = () => router.back();

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && router.back();
    document.addEventListener('keydown', onKey);
    // 뒤 화면이 같이 스크롤되지 않게
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, [router]);

  return (
    <div className="about-overlay" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div ref={panel} className="about-modal" role="dialog" aria-modal="true" aria-labelledby="about-modal-title" tabIndex={-1}>
        <div className="about-modal-head">
          <h2 id="about-modal-title" className="serif">About Us</h2>
          <button type="button" className="x" aria-label="닫기" onClick={close}>×</button>
        </div>
        <div className="about-modal-body">{children}</div>
      </div>
    </div>
  );
}
