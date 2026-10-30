import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getStore, isMockMode } from '@/lib/store';
import { safeNext } from '@/lib/auth/rules';

/** Supabase Google OAuth 돌아오는 곳: 세션을 만들고, 가입 전이면 가입 화면으로 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const next = safeNext(url.searchParams.get('next'));
  const code = url.searchParams.get('code');
  if (isMockMode() || !code) return NextResponse.redirect(new URL('/?login=failed', req.url));

  const jar = await cookies();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (list) => list.forEach(({ name, value, options }) => jar.set(name, value, options)),
    },
  });
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return NextResponse.redirect(new URL('/?login=failed', req.url));

  const profile = await getStore().getProfile(data.user.id);
  const dest = profile ? next : `/signup?next=${encodeURIComponent(next)}`;
  return NextResponse.redirect(new URL(dest, req.url));
}
