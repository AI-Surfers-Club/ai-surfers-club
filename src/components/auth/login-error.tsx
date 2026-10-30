'use client';

import { useSearchParams } from 'next/navigation';

/** 로그인 실패로 돌아왔을 때(?login=failed) 안내 */
export function LoginError() {
  const sp = useSearchParams();
  if (sp.get('login') !== 'failed') return null;
  return <div className="toast" role="alert">로그인에 실패했습니다. 다시 시도해주세요</div>;
}
