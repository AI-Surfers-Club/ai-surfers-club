'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateMyProfile, type ProfileResult } from '@/lib/profile/actions';
import { CHARACTER_COUNT, characterSrc, defaultCharacter } from '@/lib/avatars/characters';
import './profile.css';

type Props = { displayName: string; teamName: string; admin: boolean; profileId: string; character?: number | null };

/** 헤더의 '{이름} · {팀}' 버튼과, 누르면 열리는 '내 정보 수정' 창 */
export function ProfileMenu({ displayName, teamName, admin, profileId, character = null }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<ProfileResult | null>(null);
  const [pending, start] = useTransition();
  const firstInput = useRef<HTMLInputElement>(null);
  // 고르지 않았으면 계정마다 다른 기본 캐릭터가 선택돼 있다
  const fallback = defaultCharacter(profileId);
  const [picked, setPicked] = useState<number>(character ?? fallback);
  useEffect(() => { if (open) setPicked(character ?? fallback); }, [open, character, fallback]);

  useEffect(() => {
    if (!open) return;
    firstInput.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const submit = (form: FormData) =>
    start(async () => {
      const r = await updateMyProfile(form);
      setResult(r);
      if (r.ok) {
        setOpen(false);
        setResult(null);
        router.refresh();
      }
    });

  const e = result?.errors ?? {};
  return (
    <>
      <button type="button" className="account" id="profile-trigger" data-testid="profile-trigger" aria-haspopup="dialog" title={`${displayName} · ${teamName}`} onClick={() => setOpen(true)}>
        <span className="crew-art" aria-hidden="true" style={{ '--crew': `url(${characterSrc(character ?? fallback)})` } as React.CSSProperties} />
        <span className="visually-hidden">{displayName} · {teamName}{admin ? ' 관리자' : ''}</span>
        {admin && <span className="account-dot" aria-hidden="true" />}
      </button>
      {open && (
        <div className="overlay" onMouseDown={(ev) => ev.target === ev.currentTarget && setOpen(false)}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="profile-title">
            <div className="modal-head">
              <h2 id="profile-title" className="serif serif-ko">내 정보 수정</h2>
              <button type="button" className="x" aria-label="닫기" onClick={() => setOpen(false)}>×</button>
            </div>
            <form action={submit} noValidate>
              <fieldset className="modal-field pf-chars">
                <legend className="modal-label">내 캐릭터</legend>
                <div className="pf-char-grid">
                  {Array.from({ length: CHARACTER_COUNT }, (_, n) => (
                    <label key={n} className={`pf-char${picked === n ? ' on' : ''}`}>
                      <input type="radio" name="character" value={n} checked={picked === n} onChange={() => setPicked(n)} className="visually-hidden" aria-label={`캐릭터 ${n + 1}${n === fallback ? ' (기본)' : ''}`} />
                      <span className="crew-art" aria-hidden="true" style={{ '--crew': `url(${characterSrc(n)})` } as React.CSSProperties} />
                    </label>
                  ))}
                </div>
                <p className="pf-photo-note">About Us 카드에 나와요.</p>
              </fieldset>
              <div className={`modal-field${e.teamName ? ' invalid' : ''}`}>
                <label htmlFor="pf-team">팀 이름 *</label>
                <input ref={firstInput} id="pf-team" name="teamName" defaultValue={teamName} aria-invalid={!!e.teamName} />
                {e.teamName && <p className="modal-err">{e.teamName}</p>}
              </div>
              <div className={`modal-field${e.displayName ? ' invalid' : ''}`}>
                <label htmlFor="pf-name">이름 *</label>
                <input id="pf-name" name="displayName" defaultValue={displayName} aria-invalid={!!e.displayName} />
                {e.displayName && <p className="modal-err">{e.displayName}</p>}
              </div>
              {result?.message && <div className="modal-banner" role="alert">{result.message}</div>}
              <p className="modal-note">바꾸면 이미 올린 서비스에도 바로 반영돼요.</p>
              <div className="modal-foot">
                <a className="lnk" href="/auth/signout">로그아웃</a>
                <button type="submit" className="pill fill big" disabled={pending}>{pending ? '저장 중…' : '저장'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
