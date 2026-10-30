import type { AuthAdapter } from '../types';
import { sessionClient } from './clients';

/** Supabase Auth (Google OAuth). 로그인 시작은 /api/supabase/login 이 PKCE 쿠키를 심고 구글로 보낸다. */
export function createAuth(): AuthAdapter {
  return {
    async currentAccount() {
      const supabase = await sessionClient();
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      return u && u.email ? { id: u.id, email: u.email } : null;
    },
    signInUrl(next) {
      return `/api/supabase/login?next=${encodeURIComponent(next)}`;
    },
    async signOut() {
      const supabase = await sessionClient();
      await supabase.auth.signOut();
    },
  };
}
