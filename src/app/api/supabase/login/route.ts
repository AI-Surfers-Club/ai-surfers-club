import { NextResponse, type NextRequest } from 'next/server';
import { isMockMode } from '@/lib/store';
import { sessionClient } from '@/lib/store/supabase/clients';
import { safeNext } from '@/lib/auth/rules';

/** Google OAuth 시작: PKCE 쿠키를 심고 구글 로그인 화면으로 보낸다 */
export async function GET(req: NextRequest) {
  if (isMockMode()) return new NextResponse('Not Found', { status: 404 });
  const url = new URL(req.url);
  const next = safeNext(url.searchParams.get('next'));
  const supabase = await sessionClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${url.origin}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) return NextResponse.redirect(new URL('/?login=failed', req.url));
  return NextResponse.redirect(data.url);
}
