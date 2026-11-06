'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { characterSrc } from '@/lib/avatars/characters';
import { setAboutGroup } from '@/lib/about/actions';
import { EMPTY_QUERY, homeHref } from '@/lib/services/search';
import type { AboutGroup } from '@/lib/store/types';
import './about.css';

export type Member = {
  id: string;
  displayName: string;
  teamName: string;
  /** 이 사람이 등록한 서비스. 카드 뒷면에 링크로 나온다 */
  services: { id: string; name: string }[];
  /** 고른 서퍼스 크루 캐릭터 번호 (고르지 않았으면 계정마다 다른 기본 캐릭터) */
  character: number;
  /** 줄 길이 (px). 카드마다 달라 매달린 높이가 들쭉날쭉하다 */
  rope: number;
};

/** 관리자의 '멤버 추가' 후보: 아직 About Us 에 없는 회원 */
export type Candidate = { id: string; displayName: string; teamName: string };

type Body = { a: number; v: number; target: number; dragging: boolean; moved: boolean };

// 무겁고 차분하게: 느린 주기, 한두 번 흔들리고 멈춤, 작은 진폭
const GRAVITY = 0.00025; // 원래 각도로 돌아가려는 힘 (줄이 길수록 더 느려진다)
const DAMPING = 0.955; // 흔들림이 잦아드는 정도
const MAX_ANGLE = 0.42; // 끌어도 이 이상 기울지 않는다 (약 24°)
const MAX_SPEED = 0.025; // 한 프레임에 돌 수 있는 최대 각속도
const DRAG_FOLLOW = 0.18; // 끌 때 카드가 손을 따라오는 정도 (1이면 바로 붙음)

const GROUP_NAME: Record<AboutGroup, string> = { surfer: 'Surfers', crew: 'Crew' };

type Props = {
  group: AboutGroup;
  members: Member[];
  /** 레일 위에 작게 붙는 그룹 이름 (예: Crew · 6) */
  label: string;
  /** 카드 앞면 위에 작게 붙는 꼬리표 (모양은 모두 같다) */
  tag?: 'SURFER' | 'CREW';
  /** 넓은 화면에서 한 줄에 놓을 최대 장수 */
  perRow?: number;
  /** 관리자면 멤버 추가·그룹 옮기기·빼기가 보인다 (서버에서도 다시 확인한다) */
  admin?: boolean;
  candidates?: Candidate[];
};

/** About Us: 천장 레일에 줄로 매달린 카드. 끌어서 흔들고, 누르면 뒤집혀 등록한 서비스가 보인다 */
export function HangingTeam({ group, members, label, tag = 'SURFER', perRow = 5, admin = false, candidates = [] }: Props) {
  const router = useRouter();
  const cards = useRef<Map<string, HTMLDivElement>>(new Map());
  // 흔들림 상태는 사람(id)마다 둔다 — 멤버가 추가·삭제돼도 다른 카드의 흔들림이 꼬이지 않는다
  const bodies = useRef<Map<string, Body>>(new Map());
  const body = (id: string, i = 0): Body => {
    let b = bodies.current.get(id);
    if (!b) bodies.current.set(id, (b = { a: (i % 2 ? 1 : -1) * (0.025 + (i % 3) * 0.015), v: 0, target: 0, dragging: false, moved: false }));
    return b;
  };
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const pointer = useRef<{ x: number; y: number; vx: number } | null>(null);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // 물리: 진자 + 마우스가 지나가면 바람처럼 툭 건드린다
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let prev = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(32, now - prev);
      prev = now;
      members.forEach((m, i) => {
        const el = cards.current.get(m.id);
        if (!el) return;
        const b = body(m.id, i);
        if (b.dragging) {
          // 손을 바로 따라붙지 않고 무게 있게 끌려온다. 놓으면 그때 속도로 이어서 흔들린다
          const next = b.a + (b.target - b.a) * (1 - Math.pow(1 - DRAG_FOLLOW, dt / 16));
          b.v = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, ((next - b.a) / dt) * 16 * 0.6));
          b.a = next;
        } else {
          const p = pointer.current;
          if (p && !reduce) {
            const r = el.querySelector('.hang-card')!.getBoundingClientRect();
            if (p.x > r.left && p.x < r.right && p.y > r.top && p.y < r.bottom) b.v += Math.max(-8, Math.min(8, p.vx)) * 0.000006 * dt;
          }
          const g = GRAVITY * (260 / (m.rope + 200));
          b.v += -g * Math.sin(b.a) * dt * 0.06 * 16;
          b.v = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, b.v));
          b.v *= Math.pow(DAMPING, dt / 16);
          b.a += b.v * dt * 0.06;
          if (reduce) { b.a = 0; b.v = 0; }
        }
        el.style.transform = `rotate(${b.a}rad)`;
        // 카드 안쪽 그림자는 기울기를 따라 움직인다
        el.style.setProperty('--tilt', `${b.a}`);
      });
      if (pointer.current) pointer.current.vx *= 0.8;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const onMove = (e: PointerEvent) => {
      const p = pointer.current;
      pointer.current = { x: e.clientX, y: e.clientY, vx: p ? e.clientX - p.x : 0 };
    };
    window.addEventListener('pointermove', onMove);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('pointermove', onMove); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members]);

  const pivotAngle = (id: string, x: number, y: number) => {
    const r = cards.current.get(id)!.parentElement!.getBoundingClientRect();
    const px = r.left + r.width / 2, py = r.top;
    return Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, Math.atan2(px - x, y - py)));
  };

  const flip = (id: string) => {
    setFlipped((f) => ({ ...f, [id]: !f[id] }));
    body(id).v += (Math.random() - 0.5) * 0.015; // 뒤집을 때 살짝 흔들린다
  };

  // 링크를 그냥 누르면 이동해야 하므로, 실제로 끌기 시작한 뒤에만 포인터를 붙잡는다
  const down = (id: string) => (e: React.PointerEvent) => {
    const b = body(id);
    b.dragging = true;
    b.moved = false;
    b.target = b.a;
    const t = e.currentTarget as HTMLElement;
    t.dataset.sx = String(e.clientX);
    t.dataset.sy = String(e.clientY);
  };
  const move = (id: string) => (e: React.PointerEvent) => {
    const b = body(id);
    if (!b.dragging) return;
    const t = e.currentTarget as HTMLElement;
    if (!b.moved && Math.hypot(e.clientX - Number(t.dataset.sx), e.clientY - Number(t.dataset.sy)) > 6) {
      b.moved = true;
      t.setPointerCapture(e.pointerId);
    }
    if (!b.moved) return;
    b.target = pivotAngle(id, e.clientX, e.clientY);
  };
  const up = (id: string) => (e: React.PointerEvent) => {
    const b = body(id);
    b.dragging = false;
    // 서비스 링크·뒤집기 버튼을 누른 건 각자 처리한다
    if (!b.moved && !(e.target as HTMLElement).closest('a, button')) flip(id);
  };
  // 끌고 난 직후의 클릭은 링크 이동으로 치지 않는다
  const swallowAfterDrag = (id: string) => (e: React.MouseEvent) => {
    const b = body(id);
    if (b.moved) { e.preventDefault(); e.stopPropagation(); b.moved = false; }
  };

  // 관리자: 그룹 바꾸기 (null 이면 About Us 에서 뺀다)
  const change = (profileId: string, to: AboutGroup | null, after?: () => void) =>
    start(async () => {
      setError(null);
      const r = await setAboutGroup(profileId, to);
      if (!r.ok) return setError(r.error);
      after?.();
      router.refresh();
    });
  const other: AboutGroup = group === 'surfer' ? 'crew' : 'surfer';

  return (
    <section className="hang-stage" aria-label={label} aria-busy={pending} style={{ '--per-row': perRow } as React.CSSProperties}>
      <div className="hang-rail" aria-hidden="true" />
      <p className="hang-label">{label}</p>
      {admin && <AddMember group={group} candidates={candidates} pending={pending} onAdd={(id, done) => change(id, group, done)} />}
      {error && <p className="hang-admin-err" role="alert">{error}</p>}
      {members.length === 0 && <p className="hang-none">{admin ? '오른쪽 위 ‘멤버 추가’로 회원을 올려주세요' : '아직 소개할 멤버가 없어요'}</p>}
      <ul className="hang-row">
        {members.map((m) => {
          const back = !!flipped[m.id];
          return (
          <li key={m.id} className="hang-slot" style={{ '--rope': `${m.rope}px` } as React.CSSProperties}>
            <div className="hang-swing" ref={(el) => { if (el) cards.current.set(m.id, el); else cards.current.delete(m.id); }}>
              <span className="hang-pin" aria-hidden="true" />
              <span className="hang-rope" aria-hidden="true" />
              <div
                className={`hang-card${back ? ' flipped' : ''}`}
                onPointerDown={down(m.id)}
                onPointerMove={move(m.id)}
                onPointerUp={up(m.id)}
                onPointerCancel={() => { body(m.id).dragging = false; }}
                onClickCapture={swallowAfterDrag(m.id)}
              >
                <span className="hang-clip" aria-hidden="true" />
                <div className="hang-inner">
                  <div className="hang-face front" inert={back}>
                    <span className="hang-meta"><span /><span>{tag}</span></span>
                    <span className="hang-photo">
                      {/* 선 모양 마스크를 키컬러로 칠한다 */}
                      <span className="crew-art" aria-hidden="true" style={{ '--crew': `url(${characterSrc(m.character)})` } as React.CSSProperties} />
                    </span>
                    <span className="hang-name serif serif-ko">{m.displayName}</span>
                    <span className="hang-team">{m.teamName}</span>
                    <button type="button" className="hang-flip-all" aria-label={`${m.displayName} 님이 등록한 서비스 보기`} onClick={() => flip(m.id)} />
                  </div>
                  <div className="hang-face back" inert={!back}>
                    <span className="hang-back-head">
                      <span className="hang-name serif serif-ko">{m.displayName}</span>
                      <button type="button" className="hang-flip-back" aria-label="앞면으로 돌리기" onClick={() => flip(m.id)}>↻</button>
                    </span>
                    {m.services.length ? (
                      <>
                        <ul className="hang-services">
                          {m.services.map((s) => <li key={s.id}>{s.name}</li>)}
                        </ul>
                        {/* 개별 서비스 대신 이 사람의 서비스 모아보기로 보낸다 */}
                        <Link className="hang-more" href={homeHref(EMPTY_QUERY, { author: m.id })} draggable={false}>
                          <span>{m.displayName}님의 서비스 보기</span>
                          <span aria-hidden="true">→</span>
                        </Link>
                      </>
                    ) : (
                      <p className="hang-empty">아직 등록한 서비스가 없어요</p>
                    )}
                  </div>
                </div>
              </div>
              {admin && (
                <div className="hang-admin">
                  <button type="button" disabled={pending} onClick={() => change(m.id, other)} aria-label={`${m.displayName} 님을 ${GROUP_NAME[other]}로 옮기기`}>{GROUP_NAME[other]}로</button>
                  <button type="button" disabled={pending} onClick={() => change(m.id, null)} aria-label={`${m.displayName} 님을 About Us에서 빼기`}>빼기</button>
                </div>
              )}
            </div>
          </li>
          );
        })}
      </ul>
    </section>
  );
}

/** 관리자: 아직 About Us 에 없는 회원을 이 그룹에 올린다 */
function AddMember({ group, candidates, pending, onAdd }: { group: AboutGroup; candidates: Candidate[]; pending: boolean; onAdd: (id: string, done: () => void) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const box = useRef<HTMLDivElement>(null);
  const list = useMemo(() => {
    const k = q.trim();
    return k ? candidates.filter((c) => c.displayName.includes(k) || c.teamName.includes(k)) : candidates;
  }, [q, candidates]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div className="hang-add" ref={box}>
      <button type="button" className="pill fill" aria-expanded={open} onClick={() => setOpen((o) => !o)}>+ 멤버 추가</button>
      {open && (
        <div className="hang-add-pop" role="dialog" aria-label={`${GROUP_NAME[group]}에 멤버 추가`}>
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="이름이나 팀으로 찾기" aria-label="회원 찾기" />
          {list.length ? (
            <ul>
              {list.map((c) => (
                <li key={c.id}>
                  <button type="button" disabled={pending} onClick={() => onAdd(c.id, () => setQ(''))}>
                    <span>{c.displayName}</span><span className="hang-add-team">{c.teamName}</span><span aria-hidden="true">+</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="hang-add-empty">{candidates.length ? '찾는 회원이 없어요' : '가입한 회원이 모두 About Us에 있어요'}</p>
          )}
        </div>
      )}
    </div>
  );
}
