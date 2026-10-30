import { cookies } from 'next/headers';
import type { AuthAdapter } from '../types';
import { MOCK_ACCOUNTS } from './seed';

/** mock 로그인 쿠키 이름. 값은 MOCK_ACCOUNTS의 id */
export const MOCK_COOKIE = 'mock_uid';

export const mockAuth: AuthAdapter = {
  async currentAccount() {
    const jar = await cookies();
    const id = jar.get(MOCK_COOKIE)?.value;
    const acct = MOCK_ACCOUNTS.find((a) => a.id === id);
    return acct ? { id: acct.id, email: acct.email } : null;
  },
  signInUrl(next) {
    return `/auth/mock?next=${encodeURIComponent(next)}`;
  },
  async signOut() {
    const jar = await cookies();
    jar.delete(MOCK_COOKIE);
  },
};
