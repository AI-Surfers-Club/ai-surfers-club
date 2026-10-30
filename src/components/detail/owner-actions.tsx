'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { DeleteResult } from '@/lib/services/edit';
import { DeleteDialog } from './delete-dialog';

/** 작성자·관리자에게만 보이는 '수정'·'삭제' */
export function OwnerActions({ serviceId, onDelete }: { serviceId: string; onDelete: () => Promise<DeleteResult> }) {
  const [asking, setAsking] = useState(false);
  return (
    <span className="owner-actions" style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
      <Link className="pill" href={`/services/${serviceId}/edit`}>수정</Link>
      <button type="button" className="pill" onClick={() => setAsking(true)}>삭제</button>
      {asking && <DeleteDialog onDelete={onDelete} onClose={() => setAsking(false)} />}
    </span>
  );
}

/** 저장하고 상세로 돌아왔을 때 잠깐 보이는 안내 (?saved=created|updated) */
export function SavedToast({ kind }: { kind: 'created' | 'updated' | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const [show, setShow] = useState(!!kind);
  useEffect(() => {
    if (!kind) return;
    const t = setTimeout(() => {
      setShow(false);
      router.replace(pathname, { scroll: false });
    }, 1800);
    return () => clearTimeout(t);
  }, [kind, pathname, router]);
  if (!show || !kind) return null;
  return <div className="toast" role="status">{kind === 'created' ? '서비스가 등록되었어요' : '수정 내용을 저장했어요'}</div>;
}
