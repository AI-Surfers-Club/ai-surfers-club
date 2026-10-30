'use server';

import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { getStore, isMockMode } from '@/lib/store';
import { MOCK_ACCOUNTS } from '@/lib/store/mock/seed';
import { MOCK_COOKIE } from '@/lib/store/mock/mock-auth';
import { safeNext } from '@/lib/auth/rules';

/** mock 로그인: 고른 계정을 쿠키에 심고 돌아간다. 가입 전 계정이면 가입 화면으로 */
export async function pickMockAccount(form: FormData) {
  if (!isMockMode()) notFound();
  const id = String(form.get('account') ?? '');
  const next = safeNext(String(form.get('next') ?? '/'));
  const acct = MOCK_ACCOUNTS.find((a) => a.id === id);
  if (!acct) redirect('/?login=failed');
  const jar = await cookies();
  jar.set(MOCK_COOKIE, acct.id, { httpOnly: true, sameSite: 'lax', path: '/' });
  const profile = await getStore().getProfile(acct.id);
  redirect(profile ? next : `/signup?next=${encodeURIComponent(next)}`);
}
