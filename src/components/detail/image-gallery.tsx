'use client';

import { useState } from 'react';

/** 상세 이미지: 원본 색. 2장 이상이면 좌우 넘김·'현재 / 전체'·작은 그림 줄 */
export function ImageGallery({ name, images }: { name: string; images: string[] }) {
  const [i, setI] = useState(0);
  if (images.length === 0) {
    return (
      <div className="detail-img">
        <div className="default-img serif" aria-hidden="true">{name.trim()[0] ?? '?'}</div>
      </div>
    );
  }
  if (images.length === 1) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <div className="detail-img"><img src={images[0]} alt={`${name} 이미지`} /></div>
    );
  }
  const n = images.length;
  const go = (k: number) => setI((k + n) % n);
  return (
    <div className="gallery" data-testid="gallery">
      <div className="gallery-main">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div className="detail-img"><img src={images[i]} alt={`${name} 이미지 ${i + 1}`} /></div>
        <button type="button" className="g-nav prev" aria-label="이전 이미지" onClick={() => go(i - 1)}>‹</button>
        <button type="button" className="g-nav next" aria-label="다음 이미지" onClick={() => go(i + 1)}>›</button>
        <span className="g-count" data-testid="gallery-count">{i + 1} / {n}</span>
      </div>
      <div className="g-strip">
        {images.map((src, k) => (
          <button key={k} type="button" aria-label={`이미지 ${k + 1}`} aria-current={k === i} onClick={() => setI(k)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" />
          </button>
        ))}
      </div>
    </div>
  );
}
