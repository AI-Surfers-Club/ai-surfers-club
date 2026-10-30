// 서버 전용: 지금 로그인한 사람과 권한
import { redirect } from 'next/navigation';
import { getAuth, getStore } from '@/lib/store';
import type { Account, Profile } from '@/lib/store/types';
import { isAdmin as isAdminEmail, safeNext } from './rules';

export type CurrentUser =
  | { state: 'guest' }
  | { state: 'pending'; account: Account }
  | { state: 'member'; account: Account; profile: Profile; admin: boolean };

/** 로그인한 계정과 가입 정보. 로그인했지만 가입 전이면 'pending' */
export async function currentUser(): Promise<CurrentUser> {
  const account = await getAuth().currentAccount();
  if (!account) return { state: 'guest' };
  const profile = await getStore().getProfile(account.id);
  if (!profile) return { state: 'pending', account };
  return { state: 'member', account, profile, admin: isAdminEmail(account.email) };
}

export function isAdmin(email: string | null | undefined): boolean {
  return isAdminEmail(email);
}

/** 회원만 들어올 수 있는 곳: 비로그인은 로그인으로, 가입 전이면 가입으로 보낸다 */
export async function requireMember(next: string): Promise<Extract<CurrentUser, { state: 'member' }>> {
  const user = await currentUser();
  const back = safeNext(next);
  if (user.state === 'guest') redirect(getAuth().signInUrl(back));
  if (user.state === 'pending') redirect(`/signup?next=${encodeURIComponent(back)}`);
  return user;
}
