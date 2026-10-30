import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth/session';
import { safeNext } from '@/lib/auth/rules';
import { getAuth } from '@/lib/store';
import { SignupForm } from '@/components/auth/signup-form';
import '@/components/auth/auth.css';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function SignupPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const next = safeNext(typeof sp.next === 'string' ? sp.next : '/');
  const user = await currentUser();
  if (user.state === 'guest') redirect(getAuth().signInUrl(`/signup?next=${encodeURIComponent(next)}`));
  if (user.state === 'member') redirect(next);

  return (
    <main className="main">
      <div className="center-card">
        <h1 className="serif serif-ko">AI Surfers Club에 오신 걸 환영해요</h1>
        <p className="form-sub">임직원만 가입할 수 있어요. 커뮤니티에서 안내받은 비밀번호를 입력해주세요.</p>
        <div className="acct"><span className="avatar" aria-hidden="true">G</span>{user.account.email}</div>
        <SignupForm next={next} />
        <a className="link-sm" href="/auth/signout">다른 계정으로 로그인</a>
      </div>
    </main>
  );
}
