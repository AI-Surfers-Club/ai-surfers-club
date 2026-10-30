// 서버 전용 Supabase 클라이언트. 클라이언트 컴포넌트에서 import하지 않는다.
// 클라이언트는 메서드를 부를 때 만든다 — 환경변수가 없어도 모듈은 불러올 수 있게.
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function need(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`환경변수 ${name} 이(가) 없습니다`);
  return v;
}

/** 로그인 세션(쿠키)을 쓰는 클라이언트: RLS가 적용된다 */
export async function sessionClient(): Promise<SupabaseClient> {
  const jar = await cookies();
  return createServerClient(need('NEXT_PUBLIC_SUPABASE_URL'), need('NEXT_PUBLIC_SUPABASE_ANON_KEY'), {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => jar.set(name, value, options));
        } catch {
          // 서버 컴포넌트에서는 쿠키를 쓸 수 없다 — 세션 갱신은 다음 요청에서
        }
      },
    },
  });
}

let admin: SupabaseClient | null = null;

/**
 * service role 클라이언트: RLS를 건너뛴다.
 * 저장소 메서드는 서버 동작이 권한(작성자·ADMIN_EMAILS)을 확인한 뒤에만 부른다.
 */
export function adminClient(): SupabaseClient {
  if (!admin) {
    admin = createClient(need('NEXT_PUBLIC_SUPABASE_URL'), need('SUPABASE_SERVICE_ROLE_KEY'), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return admin;
}

export const BUCKET = 'thumbnails';
