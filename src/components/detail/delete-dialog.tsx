'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { DeleteResult } from '@/lib/services/edit';
// 모달 모양(.overlay, .modal …)은 내 정보 창과 같은 것을 쓴다
import '@/components/profile/profile.css';

type Props = { onDelete: () => Promise<DeleteResult>; onClose: () => void };

/** 삭제 확인 창. 확인하면 지우고 안내 후 홈으로 */
export function DeleteDialog({ onDelete, onClose }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !pending && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, pending]);

  const confirm = () =>
    start(async () => {
      const r = await onDelete();
      if (!r.ok) {
        setMessage(r.message);
        return;
      }
      setDone(true);
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 700);
    });

  if (done) return <div className="toast" role="status">서비스를 삭제했어요</div>;

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && !pending && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="del-title">
        <div className="modal-head">
          <h2 id="del-title" className="serif serif-ko">서비스 삭제</h2>
          <button type="button" className="x" aria-label="닫기" onClick={onClose}>×</button>
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 18 }}>이 서비스를 삭제할까요? 올린 이미지도 함께 사라지고 되돌릴 수 없어요.</p>
        {message && <div className="modal-banner" role="alert">{message}</div>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" className="pill big" onClick={onClose} disabled={pending}>취소</button>
          <button type="button" className="pill fill big" onClick={confirm} disabled={pending}>{pending ? '삭제 중…' : '삭제'}</button>
        </div>
      </div>
    </div>
  );
}
