'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  addFilterAction, deleteFilterAction, listFilterRows, renameFilterAction,
  type FilterResult, type FilterRow,
} from '@/lib/filters/actions';
import '@/components/profile/profile.css';
import './admin.css';

/** 툴바의 '필터 관리' 버튼과 관리 창 (관리자에게만 그려진다) */
export function FilterManager() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<FilterRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const [confirming, setConfirming] = useState<FilterRow | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!open) return;
    setRows(null);
    setError(null);
    start(async () => {
      apply(await listFilterRows());
    });
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && (confirming ? setConfirming(null) : setOpen(false));
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function apply(r: FilterResult): boolean {
    if (!r.ok) {
      setError(r.error);
      return false;
    }
    setRows(r.filters);
    setError(null);
    router.refresh();
    return true;
  }

  const add = () => start(async () => { if (apply(await addFilterAction(newName))) setNewName(''); });
  const rename = () => editing && start(async () => { if (apply(await renameFilterAction(editing.id, editing.name))) setEditing(null); });
  const remove = (row: FilterRow) => start(async () => { if (apply(await deleteFilterAction(row.id))) setConfirming(null); });

  return (
    <>
      <button type="button" className="pill" onClick={() => setOpen(true)}>필터 관리</button>
      {open && !confirming && (
        <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="fm-title">
            <div className="modal-head">
              <div>
                <h2 id="fm-title" className="serif serif-ko">필터 관리</h2>
                <p className="modal-note" style={{ marginBottom: 0 }}>홈 필터와 등록 화면에 보이는 항목이에요.</p>
              </div>
              <button type="button" className="x" aria-label="닫기" onClick={() => setOpen(false)}>×</button>
            </div>
            <form className="fm-add" onSubmit={(e) => { e.preventDefault(); add(); }}>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="새 필터 이름 (예: 이미지생성)" aria-label="새 필터 이름" />
              <button type="submit" className="pill fill" disabled={pending}>추가</button>
            </form>
            {error && <p className="modal-err" role="alert">{error}</p>}
            {rows === null ? (
              <div aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="sk" style={{ height: 14, margin: '12px 0' }} />)}</div>
            ) : rows.length === 0 ? (
              <p className="fm-empty">아직 필터가 없습니다. 위에서 첫 필터를 추가해보세요.</p>
            ) : (
              <ul className="fm-list">
                {rows.map((r) =>
                  editing?.id === r.id ? (
                    <li key={r.id} className="frow">
                      <input autoFocus value={editing.name} aria-label={`${r.name} 새 이름`} onChange={(e) => setEditing({ id: r.id, name: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), rename())} />
                      <button type="button" className="lnk" onClick={rename} disabled={pending}>저장</button>
                      <button type="button" className="lnk" onClick={() => setEditing(null)}>취소</button>
                    </li>
                  ) : (
                    <li key={r.id} className="frow" data-testid="filter-row">
                      <span className="nm">{r.name}</span>
                      <span className="cnt">서비스 {r.usage}개</span>
                      <button type="button" className="lnk" onClick={() => setEditing({ id: r.id, name: r.name })}>이름 변경</button>
                      <button type="button" className="lnk" aria-label={`${r.name} 삭제`} onClick={() => setConfirming(r)}>삭제</button>
                    </li>
                  ),
                )}
              </ul>
            )}
          </div>
        </div>
      )}
      {open && confirming && (
        <div className="overlay">
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="fd-title">
            <div className="modal-head">
              <h2 id="fd-title" className="serif serif-ko">필터 삭제</h2>
              <button type="button" className="x" aria-label="닫기" onClick={() => setConfirming(null)}>×</button>
            </div>
            <p className="fm-text">
              &apos;{confirming.name}&apos; 필터를 삭제할까요?
              {confirming.usage > 0 && <><br /><b>이 필터를 쓰는 서비스 {confirming.usage}개에서 함께 빠집니다.</b></>}
            </p>
            {error && <p className="modal-err" role="alert">{error}</p>}
            <div className="fm-actions">
              <button type="button" className="pill big" onClick={() => setConfirming(null)}>취소</button>
              <button type="button" className="pill fill big" onClick={() => remove(confirming)} disabled={pending}>삭제</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
