'use client';

import { useRef, useState } from 'react';
import { uploadImage } from '@/lib/images/actions';
import { imageProblem, MAX_IMAGES } from '@/lib/images/rules';

type Props = { images: string[]; onChange: (next: string[]) => void; error?: string };

/** 이미지 최대 10장. 맨 앞이 대표. 끌기·←→·대표로 버튼으로 순서를 바꾼다 */
export function ImageUploader({ images, onChange, error }: Props) {
  const [problem, setProblem] = useState<string | null>(null);
  const [busy, setBusy] = useState(0);
  const [over, setOver] = useState<number | 'add' | null>(null);
  const dragFrom = useRef<number | null>(null);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length || from === to) return;
    const next = images.slice();
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    onChange(next);
  };

  const add = async (files: FileList | File[]) => {
    const list = [...files];
    if (!list.length) return;
    const room = MAX_IMAGES - images.length;
    const bad = list.filter((f) => imageProblem(f.type, f.size));
    const good = list.filter((f) => !imageProblem(f.type, f.size));
    const take = good.slice(0, Math.max(0, room));
    const msgs: string[] = [];
    if (bad.length) msgs.push(`${bad.length}장은 JPG·PNG·WebP, 5MB 이하가 아니라서 빠졌어요`);
    if (good.length > room) msgs.push(`최대 ${MAX_IMAGES}장까지라 ${good.length - room}장은 빠졌어요`);
    setBusy((b) => b + take.length);
    const urls: string[] = [];
    for (const f of take) {
      const fd = new FormData();
      fd.set('file', f);
      const r = await uploadImage(fd);
      if (r.ok) urls.push(r.url);
      else msgs.push(r.error);
      setBusy((b) => b - 1);
    }
    if (urls.length) onChange([...images, ...urls].slice(0, MAX_IMAGES));
    setProblem(msgs.length ? msgs.join(' · ') : null);
  };

  const shownError = problem ?? error;
  const picker = (
    <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => { if (e.target.files) add(e.target.files); e.target.value = ''; }} />
  );

  return (
    <div className={`field${shownError ? ' invalid' : ''}`} id="f-img">
      <div className="field-label"><span>이미지</span><span className="count" data-testid="img-count">{images.length}/{MAX_IMAGES}</span></div>
      <div className={`img-grid${images.length ? '' : ' empty'}`} data-testid="img-grid">
        {images.map((src, i) => (
          <div
            key={`${i}-${src.slice(-24)}`}
            className={`img-tile${over === i ? ' over' : ''}`}
            draggable
            data-testid="img-tile"
            onDragStart={(e) => { dragFrom.current = i; e.dataTransfer.effectAllowed = 'move'; }}
            onDragEnd={() => { dragFrom.current = null; setOver(null); }}
            onDragOver={(e) => { if (dragFrom.current !== null) { e.preventDefault(); setOver(i); } }}
            onDragLeave={() => setOver(null)}
            onDrop={(e) => { e.preventDefault(); if (dragFrom.current !== null) move(dragFrom.current, i); dragFrom.current = null; setOver(null); }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`이미지 ${i + 1}`} />
            {i === 0 && <span className="cover-badge">대표</span>}
            <button type="button" className="x-btn" aria-label={`이미지 ${i + 1} 삭제`} onClick={() => onChange(images.filter((_, k) => k !== i))}>×</button>
            <div className="tile-tools">
              <button type="button" aria-label={`이미지 ${i + 1} 앞으로`} style={{ visibility: i === 0 ? 'hidden' : 'visible' }} onClick={() => move(i, i - 1)}>←</button>
              {i > 0 ? <button type="button" aria-label={`이미지 ${i + 1} 대표로`} onClick={() => move(i, 0)}>대표로</button> : <span />}
              <button type="button" aria-label={`이미지 ${i + 1} 뒤로`} style={{ visibility: i === images.length - 1 ? 'hidden' : 'visible' }} onClick={() => move(i, i + 1)}>→</button>
            </div>
          </div>
        ))}
        {busy > 0 && Array.from({ length: busy }, (_, k) => <div key={`b${k}`} className="img-tile uploading" aria-label="올리는 중" />)}
        {images.length + busy < MAX_IMAGES && (
          <label
            className={`img-add${over === 'add' ? ' over' : ''}`}
            onDragOver={(e) => { if (dragFrom.current === null) { e.preventDefault(); setOver('add'); } }}
            onDragLeave={() => setOver(null)}
            onDrop={(e) => { if (dragFrom.current !== null) return; e.preventDefault(); setOver(null); add(e.dataTransfer.files); }}
          >
            <span className="plus" aria-hidden="true">+</span>
            {images.length ? (
              '추가'
            ) : (
              <span className="txt">이미지를 끌어다 놓거나 눌러서 올려주세요<span className="sub">최대 10장 · 첫 번째 이미지가 대표 이미지가 돼요</span></span>
            )}
            {picker}
          </label>
        )}
      </div>
      <p className="img-hint">
        {images.length
          ? <>JPG·PNG·WebP, 장당 5MB 이하 · <b>첫 번째 이미지가 대표</b>예요. 끌어서 순서를 바꾸거나 &quot;대표로&quot;를 눌러주세요.</>
          : 'JPG·PNG·WebP, 장당 5MB 이하 · 올리지 않으면 기본 이미지가 쓰여요.'}
      </p>
      {shownError && <p className="err" role="alert">{shownError}</p>}
    </div>
  );
}
