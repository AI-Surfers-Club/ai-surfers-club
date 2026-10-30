import { notFound } from 'next/navigation';
import { isMockMode } from '@/lib/store';
import { MOCK_ACCOUNTS } from '@/lib/store/mock/seed';
import { safeNext } from '@/lib/auth/rules';
import { pickMockAccount } from './actions';
import '@/components/auth/auth.css';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** mock 모드 전용 가짜 구글 계정 선택 화면 */
export default async function MockLoginPage({ searchParams }: { searchParams: SearchParams }) {
  if (!isMockMode()) notFound();
  const sp = await searchParams;
  const next = safeNext(typeof sp.next === 'string' ? sp.next : '/');
  return (
    <main className="main">
      <div className="center-card">
        <h1 className="serif">Google 계정 선택</h1>
        <p className="form-sub">프로토타입용 가짜 로그인입니다. 실제 서비스에서는 구글 로그인 화면이 뜹니다.</p>
        <form action={pickMockAccount}>
          <input type="hidden" name="next" value={next} />
          {MOCK_ACCOUNTS.map((a) => (
            <button key={a.id} type="submit" name="account" value={a.id} className="g-acct">
              <span className="avatar" aria-hidden="true">{a.label[0]}</span>
              <span>{a.label} <small>— {a.note}</small><small className="g-mail">{a.email}</small></span>
            </button>
          ))}
        </form>
      </div>
    </main>
  );
}
