import Link from 'next/link';
import { Suspense } from 'react';
import { currentUser } from '@/lib/auth/session';
import { getAuth } from '@/lib/store';
import { LoginError } from '@/components/auth/login-error';
import { ProfileMenu } from '@/components/profile/profile-menu';

/** 헤더 오른쪽: 로그인 상태에 따라 버튼이 바뀐다 */
export async function HeaderActions() {
  let user: Awaited<ReturnType<typeof currentUser>> = { state: 'guest' };
  try {
    user = await currentUser();
  } catch {
    // 로그인 정보를 못 읽으면 비로그인으로 보여준다
  }
  const signIn = (next: string) => {
    try {
      return getAuth().signInUrl(next);
    } catch {
      return '/';
    }
  };

  return (
    <div className="nav">
      <Suspense fallback={null}><LoginError /></Suspense>
      <Link className="pill hide-m" href="/about">About Us</Link>
      {user.state === 'member' ? (
        <>
          <Link className="pill fill" href="/services/new">+ 서비스 등록</Link>
          <ProfileMenu displayName={user.profile.displayName} teamName={user.profile.teamName} admin={user.admin} profileId={user.profile.id} character={user.profile.character ?? null} />
        </>
      ) : (
        <>
          <Link className="pill fill" href={user.state === 'pending' ? '/signup?next=%2Fservices%2Fnew' : signIn('/services/new')}>+ 서비스 등록</Link>
          <Link className="account" href={user.state === 'pending' ? '/signup' : signIn('/')} aria-label="로그인" title="로그인">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
            </svg>
          </Link>
        </>
      )}
    </div>
  );
}
