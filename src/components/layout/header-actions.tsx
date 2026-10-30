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
    <nav className="nav">
      <Suspense fallback={null}><LoginError /></Suspense>
      {user.state === 'member' ? (
        <>
          <Link className="pill fill" href="/services/new">+ 서비스 등록</Link>
          <ProfileMenu displayName={user.profile.displayName} teamName={user.profile.teamName} admin={user.admin} />
        </>
      ) : (
        <>
          <Link className="pill hide-m" href={user.state === 'pending' ? '/signup' : signIn('/')}>로그인</Link>
          <Link className="pill fill" href={user.state === 'pending' ? '/signup?next=%2Fservices%2Fnew' : signIn('/services/new')}>+ 서비스 등록</Link>
        </>
      )}
    </nav>
  );
}
